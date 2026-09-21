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

export interface KeyDatesConfig {
  anniversaryDate: string; // '2024-06-18' (YYYY-MM-DD)
  heBirthday: string;      // '03-03' (MM-DD)
  sheBirthday: string;     // '12-18' (MM-DD)
}

export const DEFAULT_KEY_DATES: KeyDatesConfig = {
  anniversaryDate: '2024-06-18',
  heBirthday: '03-03',
  sheBirthday: '12-18'
};

export function calculateDaysTogether(startDateStr: string = DEFAULT_KEY_DATES.anniversaryDate): number {
  const parts = startDateStr.split('-').map(Number);
  const startYear = parts[0] || 2024;
  const startMonth = (parts[1] || 6) - 1;
  const startDay = parts[2] || 18;

  const start = new Date(startYear, startMonth, startDay);
  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays);
}

export function checkSpecialDateToday(dates: KeyDatesConfig = DEFAULT_KEY_DATES): {
  isAnniversary: boolean;
  isHeBirthday: boolean;
  isSheBirthday: boolean;
  bannerMessage: string | null;
} {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayMMDD = `${month}-${day}`;

  const isHeBirthday = todayMMDD === dates.heBirthday;
  const isSheBirthday = todayMMDD === dates.sheBirthday;
  const isAnniversary = todayMMDD === dates.anniversaryDate.slice(5);

  let bannerMessage: string | null = null;
  if (isAnniversary) {
    bannerMessage = '🎉 今天是我们在一起的纪念日（6月18日）！愿我们的心动如星轨般璀璨永恒！';
  } else if (isSheBirthday) {
    bannerMessage = '🎂 祝亲爱的女巫生日快乐（12月18日）！愿所有的美好与魔法光芒都环绕着你！';
  } else if (isHeBirthday) {
    bannerMessage = '🎂 祝亲爱的巫师生日快乐（3月3日）！今天是被爱意与魔法守护的幸运日！';
  }

  return { isAnniversary, isHeBirthday, isSheBirthday, bannerMessage };
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

  getKeyDates(): KeyDatesConfig {
    return this.get<KeyDatesConfig>('key_dates', DEFAULT_KEY_DATES);
  }

  setKeyDates(dates: Partial<KeyDatesConfig>): void {
    const current = this.getKeyDates();
    this.set('key_dates', { ...current, ...dates });
  }

  getAnniversaryDate(): string {
    return this.getKeyDates().anniversaryDate;
  }

  setAnniversaryDate(date: string): void {
    this.setKeyDates({ anniversaryDate: date.trim() });
  }

  getBirthdays(): { he: string; she: string } {
    const dates = this.getKeyDates();
    return { he: dates.heBirthday, she: dates.sheBirthday };
  }

  setBirthdays(birthdays: { he?: string; she?: string }): void {
    const update: Partial<KeyDatesConfig> = {};
    if (birthdays.he) update.heBirthday = birthdays.he.trim();
    if (birthdays.she) update.sheBirthday = birthdays.she.trim();
    this.setKeyDates(update);
  }
}

export const appStorage = new AppStorage();
