import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HistoryCard } from "../../components/HistoryCard";
import { SpeedChart } from "../../components/SpeedChart";
import { useTheme } from "../../context/ThemeContext";
import { clearHistory, deleteResult, getHistory } from "../../services/storage";
import { SpeedTestResult } from "../../types";

type SortMode = "newest" | "fastest" | "slowest";

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "fastest", label: "Fastest" },
  { key: "slowest", label: "Slowest" },
];

export default function HistoryScreen() {
  const { theme } = useTheme();
  const [history, setHistory] = useState<SpeedTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortMode>("newest");

  const load = useCallback(async () => {
    setHistory(await getHistory());
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteResult(id);
    setHistory((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const confirmClear = useCallback(() => {
    Alert.alert(
      "Clear All History",
      "This will permanently delete all speed test records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ],
    );
  }, []);

  const sorted = [...history].sort((a, b) =>
    sort === "newest"
      ? b.timestamp - a.timestamp
      : sort === "fastest"
        ? b.downloadSpeed - a.downloadSpeed
        : a.downloadSpeed - b.downloadSpeed,
  );

  // Stats helpers
  const avg = (key: keyof SpeedTestResult) =>
    history.length
      ? history.reduce((s, r) => s + (r[key] as number), 0) / history.length
      : 0;

  const fmt = (v: number) =>
    v >= 100 ? Math.round(v).toString() : v.toFixed(1);

  const bestDl = history.length
    ? Math.max(...history.map((r) => r.downloadSpeed))
    : 0;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.bg }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: theme.text }]}>History</Text>
          <Text style={[s.sub, { color: theme.textSub }]}>
            {history.length} test{history.length !== 1 ? "s" : ""} recorded
          </Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity
            onPress={confirmClear}
            style={[
              s.iconBtn,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            <Ionicons name="trash-outline" size={17} color={theme.red} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 36 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.cyan}
            colors={[theme.cyan]}
          />
        }
      >
        {loading ? (
          <View style={s.empty}>
            <Text style={{ color: theme.textSub }}>Loading…</Text>
          </View>
        ) : history.length === 0 ? (
          /* ── Empty state ── */
          <View style={s.empty}>
            <View
              style={[
                s.emptyIconWrap,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Ionicons
                name="analytics-outline"
                size={36}
                color={theme.textSub}
              />
            </View>
            <Text style={[s.emptyTitle, { color: theme.text }]}>
              No Tests Yet
            </Text>
            <Text style={[s.emptyDesc, { color: theme.textSub }]}>
              Run your first speed test to see results here.
            </Text>
          </View>
        ) : (
          <>
            {/* ── Summary card ── */}
            <View
              style={[
                s.summaryCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[s.sectionLabel, { color: theme.textSub }]}>
                AVERAGES
              </Text>
              <View style={s.summaryGrid}>
                {[
                  {
                    label: "↓ AVG DL",
                    value: fmt(avg("downloadSpeed")),
                    color: theme.cyan,
                  },
                  {
                    label: "↑ AVG UL",
                    value: fmt(avg("uploadSpeed")),
                    color: theme.purple,
                  },
                  {
                    label: "AVG PING",
                    value: `${Math.round(avg("ping"))}ms`,
                    color: theme.orange,
                  },
                  { label: "BEST DL", value: fmt(bestDl), color: theme.green },
                ].map((item, i) => (
                  <View key={i} style={s.summaryItem}>
                    <Text style={[s.summaryVal, { color: item.color }]}>
                      {item.value}
                    </Text>
                    <Text style={[s.summaryLabel, { color: theme.textSub }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ── Speed chart ── */}
            {history.length >= 2 && <SpeedChart data={history} />}

            {/* ── Sort controls ── */}
            <View style={s.sortRow}>
              {SORT_OPTIONS.map(({ key, label }) => {
                const active = sort === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSort(key)}
                    style={[
                      s.sortBtn,
                      {
                        backgroundColor: active ? theme.cyan : theme.card,
                        borderColor: active ? theme.cyan : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        s.sortBtnText,
                        { color: active ? theme.bg : theme.textSub },
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* ── Result cards ── */}
            {sorted.map((result, index) => (
              <HistoryCard
                key={result.id}
                result={result}
                onDelete={handleDelete}
                rank={sort === "newest" ? index : undefined}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  sub: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginTop: 2,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", marginBottom: 8 },
  emptyDesc: { fontSize: 13, textAlign: "center", lineHeight: 20 },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  sectionLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 14,
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryVal: { fontSize: 20, fontWeight: "900", letterSpacing: -0.5 },
  summaryLabel: {
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginTop: 4,
  },
  sortRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  sortBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  sortBtnText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
