# ⚡ NET-SPEED-TESTPRO

A modern, feature-rich internet speed test application built with **React Native Expo 54**, **NativeWind v5**, and **TypeScript**. Test your download speed, upload speed, ping, jitter, and packet loss — all with a beautiful dark UI and persistent history.

---

## 📱 Screenshots

![WhatsApp Image 2026-04-10 at 1 20 28 AM](https://github.com/user-attachments/assets/f4ce9ea7-dcff-4aa5-98fc-ccfed7181f79)
![WhatsApp Image 2026-04-10 at 1 20 28 AM (1)](https://github.com/user-attachments/assets/03bda125-5e82-49cc-bafd-1c3d0afafe0e)
![WhatsApp Image 2026-04-10 at 1 20 27 AM](https://github.com/user-attachments/assets/7efd78fe-82cc-40cf-ada3-8359b1fc61a9)

---

## ✨ Features

### 🚀 Speed Test
- **Download Speed** — measures real-world download throughput (Mbps)
- **Upload Speed** — measures real-world upload throughput (Mbps)
- **Ping** — round-trip latency in milliseconds
- **Jitter** — variation in ping response times (ms)
- **Packet Loss** — percentage of lost packets during the test
- **Average Speed** — running average across all past tests

### 📊 History & Analytics
- Bar graph of past speed test results (download & upload)
- Highlights **Newest**, **Fastest**, and **Slowest** results at a glance
- Persistent history stored locally — data survives app restarts
- Tap any history entry for full test details

### 🌐 Network Tab
- **Wi-Fi / Cellular** connection type detection
- **IP Address** (local and/or public)
- **Platform** (iOS / Android)
- **OS Version**
- **Internet Access** status (connected / disconnected)
- **Device Model** info via Expo Device

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| [Expo](https://expo.dev) | ~54.0.0 | App framework & build tooling |
| [React Native](https://reactnative.dev) | 0.76.5 | Cross-platform mobile UI |
| [NativeWind](https://www.nativewind.dev) | ^5.0.1 | Tailwind CSS utility classes for RN |
| [Tailwind CSS](https://tailwindcss.com) | ^3.4.0 | Utility-first CSS (NativeWind peer) |
| [TypeScript](https://www.typescriptlang.org) | ^5.3.0 | Type safety |
| [Expo Router](https://expo.github.io/router) | ~4.0.0 | File-based navigation |
| [Expo Network](https://docs.expo.dev/versions/latest/sdk/network/) | ~6.0.0 | Network info (IP, type, connectivity) |
| [Expo Device](https://docs.expo.dev/versions/latest/sdk/device/) | ~7.0.0 | Device & OS information |
| [Expo Constants](https://docs.expo.dev/versions/latest/sdk/constants/) | ~17.0.0 | App constants |
| [React Native SVG](https://github.com/software-mansion/react-native-svg) | ^15.8.0 | Bar chart graphs |
| [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) | ~3.16.1 | Smooth animations |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | ^1.23.1 | Local persistent storage |
| [Zustand](https://zustand-demo.pmnd.rs) | ^4.5.0 | Lightweight state management |

---

## 📁 Project Structure

```
SpeedTestApp/
├── app/
│   ├── _layout.tsx          # Root layout (fonts, navigation shell)
│   ├── index.tsx            # Speed Test screen (main tab)
│   ├── history.tsx          # History + bar graph screen
│   └── network.tsx          # Network info screen
├── components/
│   ├── SpeedGauge.tsx       # Animated circular speed gauge
│   ├── MetricCard.tsx       # Ping / Jitter / Packet Loss card
│   ├── BarChart.tsx         # SVG bar chart for history
│   ├── HistoryCard.tsx      # Single history result row
│   ├── NetworkCard.tsx      # Network info row item
│  
├── hooks/
│   ├── useSpeedTest.ts      # Core speed test logic & state
│   └── useNetworkInfo.ts    # Network / device info hook
├── store/
│   └── speedStore.ts        # Zustand store (results + history)
├── utils/
│   ├── speedTest.ts         # Download/upload/ping test functions
│   ├── formatters.ts        # Number & unit formatters
│   └── storage.ts           # AsyncStorage read/write helpers
├── types/
│   └── index.ts             # Shared TypeScript interfaces
├── tailwind.config.js
├── app.json
├── babel.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — `npm install -g expo-cli`
- [Expo Go](https://expo.dev/go) app on your phone, **or** Android/iOS simulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Jaykumar122/NET-SPEED-TESTPRO.git
cd speedtest-pro

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

Then scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

### Run on Simulator / Emulator

```bash
# iOS Simulator (macOS only)
npx expo start --ios

# Android Emulator
npx expo start --android
```

---

### Environment

No API keys are required. The speed test uses publicly available endpoints (e.g., Cloudflare, fast.com-style chunked requests) and can be configured in `utils/speedTest.ts`.

---

## 📐 TypeScript Types

```ts
// types/index.ts

export interface SpeedResult {
  id: string;
  timestamp: number;
  download: number;   // Mbps
  upload: number;     // Mbps
  ping: number;       // ms
  jitter: number;     // ms
  packetLoss: number; // %
  server?: string;
}

export interface NetworkInfo {
  type: "wifi" | "cellular" | "none" | "unknown";
  isConnected: boolean;
  ipAddress: string | null;
  platform: string;
  osVersion: string;
  deviceName: string;
}
```

---

## 🧪 How the Speed Test Works

1. **Ping & Jitter** — sends multiple HTTP HEAD requests to a test endpoint, measures round-trip time, calculates variance (jitter).
2. **Download** — fetches a large binary payload, measures bytes received over time, computes throughput in Mbps.
3. **Upload** — sends a large binary payload via POST, measures time to completion, computes throughput in Mbps.
4. **Packet Loss** — fires N requests in parallel and counts failures/timeouts as lost packets.
5. Results are saved to **AsyncStorage** via the Zustand store for persistent history.

---

## 📊 History Screen

- Bar chart rendered with **React Native SVG** — no third-party charting lib needed.
- Each bar represents one test session (download in cyan, upload in green).
- **Badges** highlight:
  - 🟦 `NEWEST` — most recent result
  - 🟩 `FASTEST` — highest download speed
  - 🟥 `SLOWEST` — lowest download speed
- Swipe or tap to delete individual results.

---

## 🌐 Network Screen

Uses `expo-network` and `expo-device` to display:

| Field | Source |
|-------|--------|
| Connection Type | `Network.getNetworkStateAsync()` |
| IP Address | `Network.getIpAddressAsync()` |
| Internet Access | `Network.getNetworkStateAsync().isInternetReachable` |
| Platform | `Platform.OS` |
| OS Version | `Device.osVersion` |
| Device Model | `Device.modelName` |

---

## 🐛 Known Issues / Roadmap

- [ ] Real server selection (pick nearest test server)
- [ ] IPv6 address display
- [ ] Share result card as image
- [ ] Widget support (iOS 16+ / Android)
- [ ] Unit toggle: Mbps ↔ MB/s
- [ ] Dark / Light theme toggle

---

## 📄 License

```
MIT License

Copyright (c) 2025 JAYKUMAR112

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgements

- [Expo Team](https://expo.dev) for the amazing DX
- [NativeWind](https://www.nativewind.dev) for bringing Tailwind to React Native
- [Cloudflare Speed Test](https://speed.cloudflare.com) for endpoint inspiration
- [React Native SVG](https://github.com/software-mansion/react-native-svg) for the chart primitives

---

<p align="center">Built with ❤️ using React Native + Expo</p>
>>>>>>> 4e72a73f9509347c21e061cd28dde588da89367f
