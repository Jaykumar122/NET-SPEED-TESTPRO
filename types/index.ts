export interface SpeedTestResult {
  id: string;
  timestamp: number;
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
  networkType: string;
  serverLocation: string;
  packetLoss: number;
}

export type TestPhase =
  | "idle"
  | "ping"
  | "download"
  | "upload"
  | "complete"
  | "error";
