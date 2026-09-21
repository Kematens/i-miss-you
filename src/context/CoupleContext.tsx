import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
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

interface CoupleContextType {
  isConnected: boolean;
  partnerOnline: boolean;
  myRole: UserRole;
  partnerRole: UserRole;
  pairingCode: string;
  setPairingCode: (code: string) => void;
  setMyRole: (role: UserRole) => void;
  sendEvent: <T = unknown>(type: string, payload: T) => void;
  onEvent: <T = unknown>(type: string, handler: PacketHandler<T>) => () => void;
  showPairingModal: boolean;
  setShowPairingModal: (show: boolean) => void;
  conflictNotice: string | null;
  clearConflictNotice: () => void;
}

const CoupleContext = createContext<CoupleContextType | null>(null);

export const CoupleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pairingCode, setPairingCodeState] = useState<string>(() => appStorage.getPairingCode());
  const [myRole, setMyRoleState] = useState<UserRole>(() => appStorage.getMyRole());
  const [partnerOnline, setPartnerOnline] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [showPairingModal, setShowPairingModal] = useState<boolean>(false);
  const [conflictNotice, setConflictNotice] = useState<string | null>(null);

  const myJoinTimestampRef = useRef<number>(Date.now());
  const handlersRef = useRef<Map<string, Set<PacketHandler<any>>>>(new Map());
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const supabaseChannelRef = useRef<any>(null);

  // 注册监听器
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

  // 分发数据包
  const dispatchPacket = useCallback((packet: CouplePacket<any>) => {
    if (packet.sender === myRole) return;

    setPartnerOnline(true);

    if (packet.type === 'PAIR_HANDSHAKE') {
      const incomingRole = packet.payload?.role as UserRole;
      if (incomingRole === myRole) {
        if (packet.timestamp < myJoinTimestampRef.current) {
          const alternateRole: UserRole = myRole === 'HE' ? 'SHE' : 'HE';
          setMyRoleState(alternateRole);
          appStorage.setMyRole(alternateRole);
          setConflictNotice(`检测到双方角色均为 ${myRole}，系统已自动为你切换为 ${alternateRole}`);
        }
      }
      sendInternal('PAIR_ACK', { role: myRole });
    } else if (packet.type === 'PAIR_ACK') {
      setPartnerOnline(true);
    }

    const listeners = handlersRef.current.get(packet.type);
    if (listeners) {
      listeners.forEach((fn) => {
        try {
          fn(packet.payload, packet.sender, packet.timestamp);
        } catch (err) {
          console.error(`[CoupleContext] Listener error on ${packet.type}:`, err);
        }
      });
    }

    const wildcardListeners = handlersRef.current.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((fn) => fn(packet, packet.sender, packet.timestamp));
    }
  }, [myRole]);

  // 发送实现
  const sendInternal = useCallback((type: string, payload: any) => {
    const packet: CouplePacket<any> = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type,
      sender: myRole,
      timestamp: Date.now(),
      payload
    };

    if (supabaseChannelRef.current && isSupabaseConfigured()) {
      supabaseChannelRef.current.send({
        type: 'broadcast',
        event: 'couple_event',
        payload: packet
      }).catch((err: unknown) => {
        console.warn('[CoupleContext] Supabase broadcast error:', err);
      });
    }

    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(packet);
      } catch (err) {
        console.warn('[CoupleContext] BroadcastChannel post error:', err);
      }
    }
  }, [myRole]);

  const sendEvent = useCallback(<T = unknown>(type: string, payload: T) => {
    sendInternal(type, payload);
  }, [sendInternal]);

  const setMyRole = useCallback((role: UserRole) => {
    setMyRoleState(role);
    appStorage.setMyRole(role);
    sendInternal('PAIR_HANDSHAKE', { role });
  }, [sendInternal]);

  const setPairingCode = useCallback((code: string) => {
    const clean = code.trim().toUpperCase();
    setPairingCodeState(clean);
    appStorage.setPairingCode(clean);
  }, []);

  // 连接信道
  useEffect(() => {
    myJoinTimestampRef.current = Date.now();
    const channelName = `couple_room_${pairingCode}`;

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
        console.warn('[CoupleContext] BroadcastChannel error:', e);
      }
    }

    if (isSupabaseConfigured() && supabase) {
      const channel = supabase.channel(channelName, {
        config: { broadcast: { self: false } }
      });

      channel
        .on('broadcast', { event: 'couple_event' }, ({ payload }) => {
          if (payload) dispatchPacket(payload as CouplePacket<any>);
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
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

  const partnerRole: UserRole = myRole === 'HE' ? 'SHE' : 'HE';

  return (
    <CoupleContext.Provider
      value={{
        isConnected,
        partnerOnline,
        myRole,
        partnerRole,
        pairingCode,
        setPairingCode,
        setMyRole,
        sendEvent,
        onEvent,
        showPairingModal,
        setShowPairingModal,
        conflictNotice,
        clearConflictNotice: () => setConflictNotice(null)
      }}
    >
      {children}
    </CoupleContext.Provider>
  );
};

export const useCouple = () => {
  const ctx = useContext(CoupleContext);
  if (!ctx) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return ctx;
};
