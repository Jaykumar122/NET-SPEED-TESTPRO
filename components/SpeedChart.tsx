import { format } from "date-fns";
import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { SpeedTestResult } from "../types";

const { width: W } = Dimensions.get("window");
const H = 100;

export function SpeedChart({ data }: { data: SpeedTestResult[] }) {
  const { theme } = useTheme();
  if (data.length < 2) return null;

  const recent = [...data].reverse().slice(-8);
  const maxVal =
    Math.max(...recent.flatMap((r) => [r.downloadSpeed, r.uploadSpeed])) *
      1.2 || 1;

  return (
    <View
      style={[
        s.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={[s.title, { color: theme.textSub }]}>SPEED TREND</Text>
      <View style={s.area}>
        {/* Y-axis */}
        <View style={s.yAxis}>
          {[1, 0.5, 0].map((f) => (
            <Text key={f} style={[s.yLabel, { color: theme.textSub }]}>
              {Math.round(maxVal * f)}
            </Text>
          ))}
        </View>
        {/* Grid + bars */}
        <View style={{ flex: 1 }}>
          {[0, 0.5, 1].map((f) => (
            <View
              key={f}
              style={[
                s.gridLine,
                { top: (1 - f) * H, backgroundColor: theme.border },
              ]}
            />
          ))}
          <View style={[s.barsArea, { height: H }]}>
            {recent.map((r) => {
              const dlH = Math.max(2, (r.downloadSpeed / maxVal) * H);
              const ulH = Math.max(2, (r.uploadSpeed / maxVal) * H);
              return (
                <View key={r.id} style={s.group}>
                  <View
                    style={[
                      s.bar,
                      { height: dlH, backgroundColor: theme.cyan },
                    ]}
                  />
                  <View
                    style={[
                      s.bar,
                      { height: ulH, backgroundColor: theme.purple },
                    ]}
                  />
                </View>
              );
            })}
          </View>
          <View style={s.xRow}>
            {recent.map((r, i) => (
              <View key={r.id} style={s.xItem}>
                {(i === 0 || i === recent.length - 1 || i % 2 === 0) && (
                  <Text style={[s.xLabel, { color: theme.textSub }]}>
                    {format(new Date(r.timestamp), "M/d")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>
      {/* Legend */}
      <View style={s.legend}>
        {[
          { c: theme.cyan, l: "↓ Download" },
          { c: theme.purple, l: "↑ Upload" },
        ].map((item) => (
          <View key={item.l} style={s.legendItem}>
            <View style={[s.legendDot, { backgroundColor: item.c }]} />
            <Text style={[s.legendText, { color: theme.textSub }]}>
              {item.l}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  title: { fontSize: 9, fontWeight: "700", letterSpacing: 3, marginBottom: 12 },
  area: { flexDirection: "row" },
  yAxis: {
    width: 30,
    justifyContent: "space-between",
    paddingBottom: 18,
    alignItems: "flex-end",
    paddingRight: 4,
  },
  yLabel: { fontSize: 8, fontWeight: "600" },
  gridLine: { position: "absolute", left: 0, right: 0, height: 1 },
  barsArea: { flexDirection: "row", alignItems: "flex-end", gap: 2 },
  group: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 1.5,
  },
  bar: { flex: 1, borderRadius: 2, maxWidth: 11, opacity: 0.88 },
  xRow: { flexDirection: "row", marginTop: 4 },
  xItem: { flex: 1, alignItems: "center" },
  xLabel: { fontSize: 8 },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 10,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 10 },
});
