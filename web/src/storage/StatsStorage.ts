import { type Config, defaultConfig } from '../core/types';

export interface TypingRecord {
  timestamp: number;
  wpm: number;
  accuracy: number;
  strokes: number;
  mode: string;
}

export interface StoredData {
  config: Config;
  records: TypingRecord[];
  bestWpm: number;
  bestAccuracy: number;
}

const STORAGE_KEY = 'gotta_go_fast_data';

export class StatsStorage {
  private static loadRaw(): StoredData {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // Ignore localStorage errors
    }
    return {
      config: { ...defaultConfig },
      records: [],
      bestWpm: 0,
      bestAccuracy: 0,
    };
  }

  private static saveRaw(data: StoredData): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore localStorage errors
    }
  }

  public static getConfig(): Config {
    return StatsStorage.loadRaw().config;
  }

  public static saveConfig(config: Config): void {
    const data = StatsStorage.loadRaw();
    data.config = config;
    StatsStorage.saveRaw(data);
  }

  public static addRecord(record: TypingRecord): void {
    const data = StatsStorage.loadRaw();
    data.records.unshift(record);
    if (data.records.length > 50) {
      data.records.pop();
    }
    if (record.wpm > data.bestWpm) {
      data.bestWpm = record.wpm;
    }
    if (record.accuracy > data.bestAccuracy) {
      data.bestAccuracy = record.accuracy;
    }
    StatsStorage.saveRaw(data);
  }

  public static getStats(): { bestWpm: number; bestAccuracy: number; totalTests: number } {
    const data = StatsStorage.loadRaw();
    return {
      bestWpm: data.bestWpm,
      bestAccuracy: data.bestAccuracy,
      totalTests: data.records.length,
    };
  }
}
