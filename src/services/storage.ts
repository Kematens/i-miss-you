/**
 * 本地持久化服务（Local Persistence Layer）
 * 命名空间: couple_app_
 * 遵循 Last-Write-Wins 与离线状态保护规范
 */

const STORAGE_PREFIX = 'couple_app_';

export type UserRole = 'HE' | 'SHE';

export interface StoredRating {
  id: string;
  date: string;
  score: number;
  verdict: string;
  notes: string;
  tags: string[];
  senderRole: UserRole;
  timestamp: number;
}

export interface StoredWhisper {
  id: number;
  text: string;
  senderRole: UserRole;
  timestamp: number;
}

export interface StoredLocation {
  lat: number;
  lng: number;
  address?: string;
  updatedAt: number;
}

export interface StoredPhoto {
  dataUrl: string;
  updatedAt: number;
  senderRole: UserRole;
}

class AppStorage {
  private getKey(key: string): string {
    return `${STORAGE_PREFIX}${key}`;
  }

  get<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultValue;
      }
      const raw = window.localStorage.getItem(this.getKey(key));
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[storage] Failed to parse key ${key}:`, err);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(this.getKey(key), JSON.stringify(value));
    } catch (err) {
      console.warn(`[storage] Failed to save key ${key}:`, err);
    }
  }

  remove(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(this.getKey(key));
    } catch (err) {
      console.warn(`[storage] Failed to remove key ${key}:`, err);
    }
  }

  // --- 强类型快捷存取 ---
  getPairingCode(): string {
    return this.get<string>('pairing_code', 'LUMOS-7788');
  }

  setPairingCode(code: string): void {
    this.set<string>('pairing_code', code.trim().toUpperCase());
  }

  getMyRole(): UserRole {
    return this.get<UserRole>('my_role', 'HE');
  }

  setMyRole(role: UserRole): void {
    this.set<UserRole>('my_role', role);
  }

  getWhispers(): StoredWhisper[] {
    return this.get<StoredWhisper[]>('whispers', []);
  }

  addWhisper(whisper: StoredWhisper): void {
    const list = this.getWhispers();
    // 保持最新 10 条
    const updated = [whisper, ...list.filter(w => w.id !== whisper.id)].slice(0, 10);
    this.set('whispers', updated);
  }

  getMyLocation(): StoredLocation | null {
    return this.get<StoredLocation | null>('my_location', null);
  }

  setMyLocation(loc: StoredLocation): void {
    this.set('my_location', loc);
  }

  getPartnerLocation(): StoredLocation | null {
    return this.get<StoredLocation | null>('partner_location', null);
  }

  setPartnerLocation(loc: StoredLocation): void {
    this.set('partner_location', loc);
  }

  getMyPhoto(): StoredPhoto | null {
    return this.get<StoredPhoto | null>('my_photo', null);
  }

  setMyPhoto(photo: StoredPhoto): void {
    this.set('my_photo', photo);
  }

  getPartnerPhoto(): StoredPhoto | null {
    return this.get<StoredPhoto | null>('partner_photo', null);
  }

  setPartnerPhoto(photo: StoredPhoto): void {
    this.set('partner_photo', photo);
  }

  getRatings(): StoredRating[] {
    return this.get<StoredRating[]>('ratings', []);
  }

  addRating(rating: StoredRating): void {
    const list = this.getRatings();
    const updated = [rating, ...list.filter(r => r.id !== rating.id)].slice(0, 20);
    this.set('ratings', updated);
  }
}

export const appStorage = new AppStorage();
