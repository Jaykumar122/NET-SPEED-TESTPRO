import AsyncStorage from "@react-native-async-storage/async-storage";
import { SpeedTestResult } from "../types";

const KEY = "st_history";
const MAX = 50;

export async function saveResult(r: SpeedTestResult): Promise<void> {
  const prev = await getHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify([r, ...prev].slice(0, MAX)));
}

export async function getHistory(): Promise<SpeedTestResult[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export async function deleteResult(id: string): Promise<void> {
  const h = await getHistory();
  await AsyncStorage.setItem(KEY, JSON.stringify(h.filter((r) => r.id !== id)));
}
