import { Ionicons } from "@expo/vector-icons";
import * as Network from "expo-network";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PulseRing } from "../../components/PulseRing";
import { SpeedGauge } from "../../components/SpeedGauge";
import { useTheme } from "../../context/ThemeContext";
import { ProgressCallback, runSpeedTest } from "../../services/speedTest";
import { saveResult } from "../../services/storage";
import { SpeedTestResult, TestPhase } from "../../types";

const { width: W } = Dimensions.get("window");

const PHASE_META: Record<TestPhase, { label: string; step: number }> = {
  idle: { label: "Ready", step: 0 },
  ping: { label: "Ping", step: 1 },
  download: { label: "Download", step: 2 },
  upload: { label: "Upload", step: 3 },
  complete: { label: "Complete", step: 4 },
  error: { label: "Error", step: 0 },
};

// FIX: Bulletproof Javascript Array to bypass the code formatter bug
const STEP_ICONS: any[] = [
  "radio-button-on",
  "arrow-down-circle",
  "arrow-up-circle",
  "checkmark-circle",
];

const STEP_LABELS = ["PING", "DOWN", "UP", "DONE"];

export default function SpeedTestScreen() {
  const { theme, isDark, toggle } = useTheme();

  // Test state
  const [phase, setPhase] = useState<TestPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(0);
  const [dlSpeed, setDlSpeed] = useState(0);
  const [ulSpeed, setUlSpeed] = useState(0);
  const [ping, setPing] = useState(0);
  const [jitter, setJitter] = useState(0);
  const [netType, setNetType] = useState("—");
  const [result, setResult] = useState<SpeedTestResult | null>(null);

  // Animations
  const btnScale = useRef(new Animated.Value(1)).current;
  const resultFade = useRef(new Animated.Value(0)).current;
  const progressW = useRef(new Animated.Value(0)).current;
  const statsSlide = useRef(new Animated.Value(30)).current;

  const isRunning = !["idle", "complete", "error"].includes(phase);

  const phaseColor =
    phase === "idle"
      ? theme.textGhost
      : phase === "ping"
        ? theme.orange
        : phase === "download"
          ? theme.cyan
          : phase === "upload"
            ? theme.purple
            : phase === "complete"
              ? theme.green
              : theme.red;

  useEffect(() => {
    Network.getNetworkStateAsync().then((s) => setNetType(s.type ?? "—"));
  }, []);

  useEffect(() => {
    Animated.timing(progressW, {
      toValue: progress,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleStart = useCallback(async () => {
    if (isRunning) return;

    setDlSpeed(0);
    setUlSpeed(0);
    setPing(0);
    setJitter(0);
    setLiveSpeed(0);
    setResult(null);
    setProgress(0);
    resultFade.setValue(0);
    statsSlide.setValue(30);

    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.93,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 200,
        friction: 10,
      }),
    ]).start();

    const ns = await Network.getNetworkStateAsync();
    setNetType(ns.type ?? "Unknown");

    const onProgress: ProgressCallback = (p, prog, speed) => {
      setPhase(p);
      setProgress(prog);
      if (speed !== undefined) {
        setLiveSpeed(speed);
        if (p === "download") setDlSpeed(speed);
        if (p === "upload") setUlSpeed(speed);
        if (p === "ping") setPing(Math.round(speed));
      }
    };

    try {
      const r = await runSpeedTest(onProgress, ns.type ?? "Unknown");
      setPhase("complete");
      setDlSpeed(r.downloadSpeed);
      setUlSpeed(r.uploadSpeed);
      setPing(r.ping);
      setJitter(r.jitter);
      setResult(r);
      await saveResult(r);

      Animated.parallel([
        Animated.timing(resultFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(statsSlide, {
          toValue: 0,
          useNativeDriver: true,
          tension: 60,
          friction: 12,
        }),
      ]).start();
    } catch {
      setPhase("error");
    }
  }, [isRunning]);

  const barWidth = progressW.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const showStats = phase !== "idle";
  const currentStep = PHASE_META[phase].step;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.bg }}
      edges={["top"]}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={[s.appTitle, { color: theme.text }]}>
              Speed
              <Text style={{ color: theme.cyan }}>Test</Text>
            </Text>
            <Text style={[s.appSub, { color: theme.textSub }]}>
              {Platform.OS === "ios" ? "iOS" : "Android"} · {netType}
            </Text>
          </View>

          {/* Theme toggle */}
          <View
            style={[
              s.toggleWrap,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons
              name={isDark ? "moon" : "sunny"}
              size={13}
              color={isDark ? theme.cyan : theme.orange}
            />
            <Switch
              value={!isDark}
              onValueChange={toggle}
              trackColor={{
                false: theme.elevated,
                true: theme.cyan + "50",
              }}
              thumbColor={isDark ? theme.textSub : theme.cyan}
              style={{ transform: [{ scaleX: 0.78 }, { scaleY: 0.78 }] }}
            />
          </View>
        </View>

        {/* ── Progress bar ── */}
        <View style={[s.progressTrack, { backgroundColor: theme.elevated }]}>
          <Animated.View
            style={[
              s.progressFill,
              {
                width: barWidth,
                backgroundColor: phaseColor,
                shadowColor: phaseColor,
              },
            ]}
          />
        </View>

        {/* ── Step indicators ── */}
        <View style={s.stepsRow}>
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const done = currentStep > stepNum;
            const active = currentStep === stepNum;
            const color =
              done || active
                ? stepNum === 1
                  ? theme.orange
                  : stepNum === 2
                    ? theme.cyan
                    : stepNum === 3
                      ? theme.purple
                      : theme.green
                : theme.textGhost;
            return (
              <View key={i} style={s.step}>
                <View
                  style={[
                    s.stepCircle,
                    {
                      backgroundColor:
                        done || active ? color + "22" : theme.elevated,
                      borderColor: done || active ? color : theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={done ? "checkmark" : (STEP_ICONS[i] as any)} // FIX: Typecasted to any
                    size={13}
                    color={color}
                  />
                </View>
                <Text style={[s.stepLabel, { color }]}>{label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Gauge + button area ── */}
        <View style={s.gaugeSection}>
          <View style={s.pulseWrap}>
            <PulseRing
              color={phaseColor}
              size={W * 0.85}
              isActive={isRunning}
            />
          </View>

          <SpeedGauge
            downloadSpeed={dlSpeed}
            uploadSpeed={ulSpeed}
            liveSpeed={liveSpeed}
            ping={ping}
            phase={phase}
            isActive={isRunning}
          />
        </View>

        {/* ── Start / Retest button ── */}
        <View style={s.btnWrap}>
          <Animated.View style={{ transform: [{ scale: btnScale }] }}>
            <TouchableOpacity
              onPress={handleStart}
              disabled={isRunning}
              activeOpacity={0.82}
              style={[
                s.startBtn,
                isRunning
                  ? {
                      backgroundColor: theme.card,
                      borderColor: phaseColor,
                      shadowColor: phaseColor,
                    }
                  : {
                      backgroundColor: theme.cyan,
                      borderColor: theme.cyan,
                      shadowColor: theme.cyan,
                    },
              ]}
            >
              {isRunning ? (
                <View style={s.runningRow}>
                  <Animated.View
                    style={[s.runningDot, { backgroundColor: phaseColor }]}
                  />
                  <Text style={[s.btnText, { color: phaseColor }]}>
                    {PHASE_META[phase].label.toUpperCase()}…
                  </Text>
                </View>
              ) : phase === "complete" ? (
                <Text style={[s.btnText, { color: theme.bg }]}>RUN AGAIN</Text>
              ) : (
                <Text style={[s.btnText, { color: theme.bg }]}>START TEST</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* ── Live speed bars ── */}
        {showStats && (
          <View style={[s.barsSection, { paddingHorizontal: 16 }]}>
            <SpeedBarRow
              icon="arrow-down-circle"
              label="DOWNLOAD"
              value={dlSpeed}
              maxValue={300}
              color={theme.cyan}
              theme={theme}
            />
            <SpeedBarRow
              icon="arrow-up-circle"
              label="UPLOAD"
              value={ulSpeed}
              maxValue={150}
              color={theme.purple}
              theme={theme}
            />
          </View>
        )}

        {/* ── Ping / Jitter / Loss pills ── */}
        {showStats && ping > 0 && (
          <Animated.View
            style={[
              s.pillsRow,
              {
                opacity: phase === "complete" ? resultFade : 1,
                transform: [
                  { translateY: phase === "complete" ? statsSlide : 0 },
                ],
              },
            ]}
          >
            <StatPill
              label="PING"
              value={`${ping}ms`}
              color={theme.orange}
              theme={theme}
              accent
            />
            <StatPill
              label="JITTER"
              value={`${jitter}ms`}
              color={theme.textSub}
              theme={theme}
            />
            {result && (
              <StatPill
                label="LOSS"
                value={`${result.packetLoss}%`}
                color={result.packetLoss > 0 ? theme.red : theme.green}
                theme={theme}
                accent
              />
            )}
          </Animated.View>
        )}

        {/* ── Result footer strip ── */}
        {result && (
          <Animated.View style={{ opacity: resultFade }}>
            <View
              style={[
                s.footer,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Ionicons name="checkmark-circle" size={13} color={theme.green} />
              <Text style={[s.footerText, { color: theme.textSub }]}>
                {result.networkType} · {result.serverLocation}
              </Text>
              <Text style={[s.footerTime, { color: theme.textGhost }]}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-components ────────────────────────────────────────────────────

function SpeedBarRow({
  icon,
  label,
  value,
  maxValue,
  color,
  theme,
}: {
  icon: keyof typeof import("@expo/vector-icons").Ionicons.glyphMap;
  label: string;
  value: number;
  maxValue: number;
  color: string;
  theme: ReturnType<typeof useTheme>["theme"];
}) {
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(widthAnim, {
      toValue: Math.min(value / maxValue, 1),
      useNativeDriver: false,
      tension: 40,
      friction: 10,
    }).start();
  }, [value]);

  const barW = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const fmt = value >= 100 ? Math.round(value).toString() : value.toFixed(1);

  return (
    <View
      style={[
        sr.wrap,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={sr.top}>
        <View style={sr.topLeft}>
          <Ionicons name={icon} size={14} color={color} />
          <Text style={[sr.label, { color: theme.textSub }]}>{label}</Text>
        </View>
        <View style={sr.topRight}>
          <Text style={[sr.val, { color: theme.text }]}>{fmt}</Text>
          <Text style={[sr.unit, { color }]}> Mb/s</Text>
        </View>
      </View>
      <View style={[sr.track, { backgroundColor: theme.elevated }]}>
        <Animated.View
          style={[
            sr.fill,
            {
              width: barW,
              backgroundColor: color,
              shadowColor: color,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.7,
              shadowRadius: 4,
              elevation: 3,
            },
          ]}
        />
      </View>
    </View>
  );
}

function StatPill({
  label,
  value,
  color,
  theme,
  accent = false,
}: {
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>["theme"];
  accent?: boolean;
}) {
  return (
    <View
      style={[
        sp.wrap,
        {
          backgroundColor: accent ? color + "15" : theme.card,
          borderColor: accent ? color + "45" : theme.border,
        },
      ]}
    >
      <Text
        style={[sp.val, { color: accent ? color : theme.text }]}
        adjustsFontSizeToFit
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[sp.lbl, { color: theme.textSub }]}>{label}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scroll: { paddingBottom: 36 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
  },
  appTitle: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  appSub: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },
  toggleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 5,
    borderRadius: 99,
    borderWidth: 1,
  },
  progressTrack: {
    marginHorizontal: 20,
    height: 2,
    borderRadius: 1,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 28,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  step: { alignItems: "center", gap: 5 },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLabel: { fontSize: 9, fontWeight: "700", letterSpacing: 1.5 },
  gaugeSection: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  pulseWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  btnWrap: { alignItems: "center", marginTop: 20, marginBottom: 20 },
  startBtn: {
    paddingHorizontal: 52,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  btnText: { fontSize: 15, fontWeight: "900", letterSpacing: 3 },
  runningRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  runningDot: { width: 8, height: 8, borderRadius: 4 },
  barsSection: { gap: 8, marginBottom: 10 },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  footer: {
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  footerText: { flex: 1, fontSize: 11, fontWeight: "600" },
  footerTime: { fontSize: 10 },
});

const sr = StyleSheet.create({
  wrap: { borderRadius: 14, padding: 14, borderWidth: 1 },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  topRight: { flexDirection: "row", alignItems: "baseline" },
  label: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  val: { fontSize: 26, fontWeight: "900", letterSpacing: -1 },
  unit: { fontSize: 12, fontWeight: "700", letterSpacing: 1, marginBottom: 1 },
  track: { height: 4, borderRadius: 2, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 2 },
});

const sp = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: "28%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  val: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  lbl: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 3,
  },
});
