import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { TestPhase } from "../types";

const { width: W } = Dimensions.get("window");
const SIZE = Math.min(W * 0.85, 340);
const C = SIZE / 2;

const START_ANGLE = -120;
const END_ANGLE = 120;
const SWEEP_ANGLE = END_ANGLE - START_ANGLE;
const TICK_COUNT = 51;

interface Tick {
  key: number;
  x: number;
  y: number;
  height: number;
  rotDeg: number;
  isMajor: boolean;
  fraction: number;
}

function buildTicks(radius: number, trackW: number): Tick[] {
  const outerR = radius;

  return Array.from({ length: TICK_COUNT }, (_, i) => {
    const fraction = i / (TICK_COUNT - 1);
    const angleDeg = START_ANGLE + fraction * SWEEP_ANGLE;
    const rad = (angleDeg * Math.PI) / 180;

    const isMajor = i % 10 === 0;
    const tickLen = isMajor ? SIZE * 0.05 : SIZE * 0.02;
    const innerR = outerR - tickLen;

    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    const x1 = C + innerR * sin;
    const y1 = C - innerR * cos;
    const x2 = C + outerR * sin;
    const y2 = C - outerR * cos;

    const height = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const rotDeg = Math.atan2(x2 - x1, -(y2 - y1)) * (180 / Math.PI);

    return { key: i, x: x1, y: y1, height, rotDeg, isMajor, fraction };
  });
}

interface Props {
  downloadSpeed: number;
  uploadSpeed: number;
  liveSpeed: number;
  ping: number;
  phase: TestPhase;
  isActive: boolean;
}

export function SpeedGauge({
  downloadSpeed,
  uploadSpeed,
  liveSpeed,
  ping,
  phase,
  isActive,
}: Props) {
  const { theme, isDark } = useTheme();

  const outerRadius = SIZE * 0.45;
  const ticks = useRef(buildTicks(outerRadius, 0)).current;

  const dlMax = 300;
  const ulMax = 150;
  const liveMax = phase === "upload" ? ulMax : dlMax;
  const liveFraction = Math.min(liveSpeed / liveMax, 1);

  const needleAngle = useRef(new Animated.Value(START_ANGLE)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const dlColor = theme.cyan;
  const ulColor = theme.purple;
  const activeColor =
    phase === "download"
      ? dlColor
      : phase === "upload"
        ? ulColor
        : phase === "ping"
          ? theme.orange
          : phase === "complete"
            ? theme.green
            : theme.textGhost;

  const needleColor = theme.orange;

  useEffect(() => {
    const targetDeg = START_ANGLE + liveFraction * SWEEP_ANGLE;
    Animated.spring(needleAngle, {
      toValue: targetDeg,
      useNativeDriver: false,
      tension: 50,
      friction: 6,
    }).start();
  }, [liveSpeed, phase, liveMax]);

  useEffect(() => {
    if (isActive) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseScale, {
            toValue: 1.02,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive]);

  const needleRotate = needleAngle.interpolate({
    inputRange: [START_ANGLE, END_ANGLE],
    outputRange: [`${START_ANGLE}deg`, `${END_ANGLE}deg`],
  });

  const trackDark = isDark ? "#1E1E38" : "#D0D4F0";

  const displayVal =
    phase === "idle"
      ? "—"
      : phase === "ping"
        ? `${ping}`
        : phase === "complete"
          ? downloadSpeed >= 100
            ? Math.round(downloadSpeed).toString()
            : downloadSpeed.toFixed(1)
          : liveSpeed >= 100
            ? Math.round(liveSpeed).toString()
            : liveSpeed > 0
              ? liveSpeed.toFixed(1)
              : "0.0";

  const displayUnit = phase === "idle" ? "" : phase === "ping" ? "ms" : "Mbps";
  const displayLabel =
    phase === "idle"
      ? "READY"
      : phase === "ping"
        ? "PING"
        : phase === "download"
          ? "DOWNLOADING"
          : phase === "upload"
            ? "UPLOADING"
            : "COMPLETE";

  const labelNodes = useMemo(() => {
    const labelCount = 6;
    const nodes = [];
    const labelRadius = outerRadius - SIZE * 0.12;

    for (let i = 0; i <= labelCount; i++) {
      const val = Math.round((liveMax / labelCount) * i);
      const fraction = i / labelCount;
      const angleDeg = START_ANGLE + fraction * SWEEP_ANGLE;
      const rad = (angleDeg * Math.PI) / 180;

      const x = C + labelRadius * Math.sin(rad);
      const y = C - labelRadius * Math.cos(rad);

      nodes.push(
        <View
          key={`lbl-${i}`}
          style={{
            position: "absolute",
            left: x - 15,
            top: y - 10,
            width: 30,
            alignItems: "center",
          }}
        >
          <Text style={[styles.dialText, { color: theme.textSub }]}>{val}</Text>
        </View>,
      );
    }
    return nodes;
  }, [liveMax, theme.textSub]);

  return (
    <Animated.View
      style={[
        styles.wrap,
        { width: SIZE, height: SIZE, transform: [{ scale: pulseScale }] },
      ]}
    >
      {/* ── Dashboard Ticks ── */}
      {ticks.map((tick) => {
        const isPassed =
          tick.fraction <= liveFraction &&
          phase !== "idle" &&
          phase !== "complete";
        const isCompleted = phase === "complete";

        const tickColor = isPassed
          ? activeColor
          : isCompleted
            ? trackDark
            : trackDark;
        const tickOpacity = isPassed || isCompleted ? 1 : 0.4;

        return (
          <View
            key={`tick-${tick.key}`}
            style={{
              position: "absolute",
              left: tick.x - (tick.isMajor ? 2 : 1),
              top: tick.y,
              width: tick.isMajor ? 4 : 2,
              height: tick.height,
              borderRadius: 2,
              backgroundColor: tickColor,
              opacity: tickOpacity,
              transform: [{ rotate: `${tick.rotDeg}deg` }],
            }}
          />
        );
      })}

      {/* ── Dial Numbers ── */}
      {labelNodes}

      {/* ── Automotive Needle ── */}
      <Animated.View
        style={{
          position: "absolute",
          left: C - 3,
          top: C - outerRadius * 0.95,
          width: 6,
          height: outerRadius * 0.95,
          borderRadius: 3,
          backgroundColor: needleColor,
          transformOrigin: "bottom center",
          transform: [{ rotate: needleRotate }],
          shadowColor: needleColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 1,
          shadowRadius: 10,
          elevation: 8,
          zIndex: 10,
        }}
      />

      {/* Needle Inner Glow Line */}
      <Animated.View
        style={{
          position: "absolute",
          left: C - 0.5,
          top: C - outerRadius * 0.9,
          width: 1,
          height: outerRadius * 0.85,
          backgroundColor: "#FFFFFF",
          opacity: 0.6,
          transformOrigin: "bottom center",
          transform: [{ rotate: needleRotate }],
          zIndex: 11,
        }}
      />

      {/* ── Center Hub Caps ── */}
      <View
        style={{
          position: "absolute",
          left: C - SIZE * 0.09,
          top: C - SIZE * 0.09,
          width: SIZE * 0.18,
          height: SIZE * 0.18,
          borderRadius: SIZE * 0.09,
          backgroundColor: isDark ? "#121220" : "#FFFFFF",
          borderWidth: 2,
          borderColor: isDark ? "#2A2A48" : "#E5E7EB",
          zIndex: 12,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 10,
          elevation: 5,
        }}
      />
      <View
        style={{
          position: "absolute",
          left: C - SIZE * 0.04,
          top: C - SIZE * 0.04,
          width: SIZE * 0.08,
          height: SIZE * 0.08,
          borderRadius: SIZE * 0.04,
          backgroundColor: needleColor,
          zIndex: 13,
        }}
      />

      {/* ── Digital Speed Display (Bottom Center) ── */}
      <View
        style={{
          position: "absolute",
          bottom: SIZE * 0.05,
          alignItems: "center",
          width: "90%",
          zIndex: 1,
        }}
      >
        <Text style={[styles.labelText, { color: activeColor }]}>
          {displayLabel}
        </Text>
        <View style={styles.speedRow}>
          <Text
            style={[styles.valueText, { color: theme.text }]}
            adjustsFontSizeToFit={true}
            numberOfLines={1}
          >
            {displayVal}
          </Text>
          <Text style={[styles.unitText, { color: theme.textSub }]}>
            {displayUnit}
          </Text>
        </View>

        {/* Post-Test DL/UL Results inside the dial */}
        {phase === "complete" && (
          <View
            style={[
              styles.subRow,
              { backgroundColor: isDark ? "#00000040" : "#F3F4F690" },
            ]}
          >
            <Text
              style={[styles.subVal, { color: dlColor }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              ↓ {Math.round(downloadSpeed)}
            </Text>
            <Text style={[styles.subSep, { color: theme.textGhost }]}> | </Text>
            <Text
              style={[styles.subVal, { color: ulColor }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              ↑ {Math.round(uploadSpeed)}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dialText: { fontSize: 11, fontWeight: "800", opacity: 0.8 },
  speedRow: { flexDirection: "row", alignItems: "baseline", marginTop: -2 },
  labelText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  valueText: { fontSize: 48, fontWeight: "900", letterSpacing: -2 },
  unitText: { fontSize: 14, fontWeight: "800", marginLeft: 4, marginBottom: 6 },
  subRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    maxWidth: "100%",
    justifyContent: "center",
  },
  subVal: { fontSize: 13, fontWeight: "800", letterSpacing: 0.5 },
  subSep: { fontSize: 13 },
});
