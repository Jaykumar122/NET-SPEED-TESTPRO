import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SpeedTestResult } from "../types";

function getRating(dl: number, t: ReturnType<typeof useTheme>["theme"]) {
  if (dl >= 200) return { label: "BLAZING", color: t.cyan };
  if (dl >= 100) return { label: "FAST", color: t.green };
  if (dl >= 50) return { label: "GOOD", color: t.blue };
  if (dl >= 25) return { label: "FAIR", color: t.orange };
  return { label: "SLOW", color: t.red };
}

interface Props {
  result: SpeedTestResult;
  onDelete?: (id: string) => void;
  rank?: number;
}

export function HistoryCard({ result, onDelete, rank }: Props) {
  const { theme } = useTheme();
  const rating = getRating(result.downloadSpeed, theme);
  const fmt = (v: number) =>
    v >= 100 ? Math.round(v).toString() : v.toFixed(1);

  return (
    <View
      style={[
        s.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      {/* Top */}
      <View style={s.topRow}>
        <View style={s.topLeft}>
          {rank !== undefined && (
            <View style={[s.rankChip, { backgroundColor: theme.elevated }]}>
              <Text style={[s.rankText, { color: theme.textSub }]}>
                #{rank + 1}
              </Text>
            </View>
          )}
          <View>
            <Text style={[s.date, { color: theme.text }]}>
              {format(new Date(result.timestamp), "MMM d, yyyy")}
            </Text>
            <Text style={[s.time, { color: theme.textSub }]}>
              {format(new Date(result.timestamp), "h:mm a")} ·{" "}
              {result.networkType}
            </Text>
          </View>
        </View>
        <View style={s.topRight}>
          <View
            style={[
              s.ratingBadge,
              {
                backgroundColor: rating.color + "18",
                borderColor: rating.color + "40",
              },
            ]}
          >
            <Text style={[s.ratingText, { color: rating.color }]}>
              {rating.label}
            </Text>
          </View>
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(result.id)}
              style={[s.delBtn, { backgroundColor: theme.elevated }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="trash-outline" size={12} color={theme.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Speeds */}
      <View style={[s.speedsRow, { borderColor: theme.border }]}>
        <View style={s.speedItem}>
          <Text style={[s.speedVal, { color: theme.cyan }]}>
            {fmt(result.downloadSpeed)}
          </Text>
          <Text style={[s.speedLbl, { color: theme.textSub }]}>↓ Mb/s</Text>
        </View>
        <View style={[s.speedDiv, { backgroundColor: theme.border }]} />
        <View style={s.speedItem}>
          <Text style={[s.speedVal, { color: theme.purple }]}>
            {fmt(result.uploadSpeed)}
          </Text>
          <Text style={[s.speedLbl, { color: theme.textSub }]}>↑ Mb/s</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={[s.statsRow, { borderTopColor: theme.border }]}>
        {[
          { v: `${result.ping}ms`, l: "PING" },
          { v: `${result.jitter}ms`, l: "JITTER" },
          { v: `${result.packetLoss}%`, l: "LOSS" },
        ].map((item, i) => (
          <View key={i} style={s.statItem}>
            <Text style={[s.statVal, { color: theme.text }]}>{item.v}</Text>
            <Text style={[s.statLbl, { color: theme.textSub }]}>{item.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  topLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  topRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rankChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  rankText: { fontSize: 10, fontWeight: "700" },
  date: { fontSize: 13, fontWeight: "700" },
  time: { fontSize: 11, marginTop: 1 },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
  },
  ratingText: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  delBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  speedsRow: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    overflow: "hidden",
  },
  speedItem: { flex: 1, alignItems: "center", paddingVertical: 10 },
  speedDiv: { width: 1 },
  speedVal: { fontSize: 26, fontWeight: "900", letterSpacing: -1 },
  speedLbl: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  statItem: { alignItems: "center" },
  statVal: { fontSize: 13, fontWeight: "800" },
  statLbl: { fontSize: 9, fontWeight: "600", letterSpacing: 2, marginTop: 2 },
});
