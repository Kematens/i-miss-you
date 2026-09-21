import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { appStorage, UserRole } from '../services/storage';

export interface CouplePacket<T = unknown> {
  id: string;
  type: string;
  sender: UserRole;
  timestamp: number;
  payload: T;
}

type PacketHandler<T = unknown> = (payload: T, sender: UserRole, timestamp: number) => void;

export function useCoupleSync() {
  const [pairingCode, setPairingCodeState] = useState<string>(() => appStorage.getPairingCode());
  const [myRole, setMyRoleState] = useState<UserRole>(() => appStorage.getMyRole());
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastConflictMessage, setLastConflictMessage] = useState<string | null>(null);

  const myJoinTimestampRef = useRef<number>(Date.now());
  const handlersRef = useRef<Map<string, Set<PacketHandler<any>>>>(new Map());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  // 注册全局事件监听器
  const onEvent = useCallback(<T = unknown>(type: string, handler: PacketHandler<T>) => {
    if (!handlersRef.current.has(type)) {
      handlersRef.current.set(type, new Set());
    }
    const set = handlersRef.current.get(type)!;
    set.add(handler as PacketHandler<any>);

    return () => {
      set.delete(handler as PacketHandler<any>);
    };
  }, []);

  // 分发收到的数据包
  const dispatchPacket = useCallback((packet: CouplePacket<any>) => {
    // 忽略自己发送的回环消息
    if (packet.sender === myRole) return;

    // 对方活跃标志
    setPartnerOnline(true);

    // 握手仲裁
    if (packet.type === 'PAIR_HANDSHAKE') {
      const incomingRole = packet.payload?.role as UserRole;
      if (incomingRole === myRole) {
        // 角色冲突裁决：根据时间戳早胜出
        if (packet.timestamp < myJoinTimestampRef.current) {
          const alternateRole: UserRole = myRole === 'HE' ? 'SHE' : 'HE';
          setMyRoleState(alternateRole);
          appStorage.setMyRole(alternateRole);
          setLastConflictMessage(`检测到双方角色均为 ${myRole}，已自动为你切换为 ${alternateRole}`);
        }
      }
      // 回应 ACK
      sendInternal('PAIR_ACK', { role: myRole });
    } else if (packet.type === 'PAIR_ACK') {
      setPartnerOnline(true);
    }

    // 分发至具体业务 handler
    const listeners = handlersRef.current.get(packet.type);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(packet.payload, packet.sender, packet.timestamp);
        } catch (err) {
          console.error(`[useCoupleSync] Error in listener for ${packet.type}:`, err);
        }
      });
    }

    // 通配监听
    const wildcardListeners = handlersRef.current.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((fn) => fn(packet, packet.sender, packet.timestamp));
    }
  }, [myRole]);

  // 底层发送逻辑
  const sendInternal = useCallback((type: string, payload: any) => {
    const packet: CouplePacket<any> = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      sender: myRole,
      timestamp: Date.now(),
      payload
    };

    // 1. 如果 Supabase 联机配置就绪
    if (supabaseChannelRef.current && isSupabaseConfigured()) {
      supabaseChannelRef.current.send({
        type: 'broadcast',
        event: 'couple_event',
        payload: packet
      }).catch((err: unknown) => {
        console.warn('[useCoupleSync] Supabase broadcast send error:', err);
      });
    }

    // 2. 本地同机跨标签广播（用于多窗口双人同机测试/离线模拟）
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(packet);
      } catch (err) {
        console.warn('[useCoupleSync] Local BroadcastChannel send error:', err);
      }
    }
  }, [myRole]);

  // 对外暴露的业务发送 API
  const sendEvent = useCallback(<T = unknown>(type: string, payload: T) => {
    sendInternal(type, payload);
  }, [sendInternal]);

  // 修改并持久化角色
  const setMyRole = useCallback((role: UserRole) => {
    setMyRoleState(role);
    appStorage.setMyRole(role);
    // 广播身份变更
    sendInternal('PAIR_HANDSHAKE', { role });
  }, [sendInternal]);

  // 修改并持久化暗号
  const setPairingCode = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    setPairingCodeState(clean);
    appStorage.setPairingCode(clean);
  }, []);

  // 建立通信信道
  useEffect(() => {
    myJoinTimestampRef.current = Date.now();
    const channelName = `couple_room_${pairingCode}`;

    // 1. 本地 BroadcastChannel 兜底（多标签/离线测试）
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel(channelName);
        bc.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            dispatchPacket(event.data as CouplePacket<any>);
          }
        };
        broadcastChannelRef.current = bc;
        setIsConnected(true);
      } catch (e) {
        console.warn('[useCoupleSync] BroadcastChannel init error:', e);
      }
    }

    // 2. 远端 Supabase Realtime 频道
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false }
        }
      });

      channel
        .on('broadcast', { event: 'couple_event' }, ({ payload }) => {
          if (payload) {
            dispatchPacket(payload as CouplePacket<any>);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            // 订阅成功后立刻发起一次对端在线握手
            channel.send({
              type: 'broadcast',
              event: 'couple_event',
              payload: {
                id: `hs_${Date.now()}`,
                type: 'PAIR_HANDSHAKE',
                sender: myRole,
                timestamp: Date.now(),
                payload: { role: myRole }
              }
            });
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setIsConnected(false);
          }
        });

      supabaseChannelRef.current = channel;
    }

    // 初始广播握手包
    sendInternal('PAIR_HANDSHAKE', { role: myRole });

    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
        broadcastChannelRef.current = null;
      }
      if (supabase && supabaseChannelRef.current) {
        supabase.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
    };
  }, [pairingCode, myRole, dispatchPacket, sendInternal]);

  return {
    isConnected,
    partnerOnline,
    myRole,
    partnerRole: (myRole === 'HE' ? 'SHE' : 'HE') as UserRole,
    pairingCode,
    setPairingCode,
    setMyRole,
    sendEvent,
    onEvent,
    lastConflictMessage,
    clearConflictMessage: () => setLastConflictMessage(null)
  };
}
