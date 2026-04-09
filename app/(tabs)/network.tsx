import { Ionicons } from "@expo/vector-icons";
import * as Network from "expo-network";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NetworkCard } from "../../components/NetworkCard";
import { useTheme } from "../../context/ThemeContext";

interface NetState {
  type: string;
  isConnected: boolean;
  isReachable: boolean | null;
  ip: string;
}

export default function NetworkScreen() {
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [net, setNet] = useState<NetState | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchInfo = useCallback(async () => {
    try {
      const [state, ip] = await Promise.all([
        Network.getNetworkStateAsync(),
        Network.getIpAddressAsync(),
      ]);
      setNet({
        type: state.type ?? "Unknown",
        isConnected: state.isConnected ?? false,
        isReachable: state.isInternetReachable ?? null,
        ip: ip ?? "—",
      });
      setLastUpdated(new Date());
    } catch {
      // keep previous state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchInfo();
    }, [fetchInfo]),
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchInfo();
  }, [fetchInfo]);

  const isWifi = net?.type?.toLowerCase().includes("wifi") ?? false;
  const quality = net?.isConnected
    ? isWifi
      ? { label: "Excellent", color: theme.green }
      : { label: "Good", color: theme.cyan }
    : { label: "Offline", color: theme.red };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.bg }}
      edges={["top"]}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View>
          <Text style={[s.title, { color: theme.text }]}>Network</Text>
          <Text style={[s.sub, { color: theme.textSub }]}>
            {lastUpdated
              ? `Updated ${lastUpdated.toLocaleTimeString()}`
              : "Connection diagnostics"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={refreshing}
          style={[
            s.iconBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={theme.cyan} />
          ) : (
            <Ionicons name="refresh" size={17} color={theme.cyan} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={s.loadWrap}>
            <ActivityIndicator size="large" color={theme.cyan} />
            <Text style={[s.loadText, { color: theme.textSub }]}>
              Scanning network…
            </Text>
          </View>
        ) : (
          <>
            {/* ── Status hero card ── */}
            <View
              style={[
                s.heroCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View style={s.heroTop}>
                <View
                  style={[
                    s.heroIconWrap,
                    { backgroundColor: quality.color + "20" },
                  ]}
                >
                  <Ionicons
                    name={isWifi ? "wifi" : "cellular"}
                    size={26}
                    color={quality.color}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.heroType, { color: theme.text }]}>
                    {net?.type ?? "Unknown"}
                  </Text>
                  <View style={s.statusRow}>
                    <View
                      style={[
                        s.statusDot,
                        {
                          backgroundColor: net?.isConnected
                            ? theme.green
                            : theme.red,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        s.statusText,
                        {
                          color: net?.isConnected ? theme.green : theme.red,
                        },
                      ]}
                    >
                      {net?.isConnected ? "Connected" : "Disconnected"}
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    s.qualityBadge,
                    {
                      backgroundColor: quality.color + "18",
                      borderColor: quality.color + "44",
                    },
                  ]}
                >
                  <Text style={[s.qualityText, { color: quality.color }]}>
                    {quality.label}
                  </Text>
                </View>
              </View>

              {/* Signal strength visual */}
              <View style={s.signalRow}>
                {[1, 2, 3, 4, 5].map((bar) => {
                  const filled = isWifi ? bar <= 5 : bar <= 3;
                  return (
                    <View
                      key={bar}
                      style={[
                        s.signalBar,
                        {
                          height: 6 + bar * 5,
                          backgroundColor: filled
                            ? quality.color
                            : theme.elevated,
                        },
                      ]}
                    />
                  );
                })}
                <Text style={[s.signalLabel, { color: theme.textSub }]}>
                  {isWifi ? "Wi-Fi" : "Cellular"} Signal
                </Text>
              </View>
            </View>

            {/* ── Network card ── */}
            {net && (
              <View style={s.section}>
                <NetworkCard
                  type={net.type}
                  isConnected={net.isConnected}
                  isReachable={net.isReachable}
                  ip={net.ip}
                />
              </View>
            )}

            {/* ── Connection details ── */}
            <SectionCard title="CONNECTION" theme={theme}>
              <InfoRow
                icon="globe-outline"
                label="Internet Access"
                value={
                  net?.isReachable == null
                    ? "Checking…"
                    : net.isReachable
                      ? "Reachable"
                      : "Not reachable"
                }
                color={net?.isReachable ? theme.green : theme.red}
                theme={theme}
              />
              <InfoRow
                icon="location-outline"
                label="IP Address"
                value={net?.ip ?? "—"}
                color={theme.blue}
                theme={theme}
                isLast
              />
            </SectionCard>

            {/* ── Device details ── */}
            <SectionCard title="DEVICE" theme={theme}>
              <InfoRow
                icon="phone-portrait-outline"
                label="Platform"
                value={Platform.OS === "ios" ? "iOS" : "Android"}
                color={theme.cyan}
                theme={theme}
              />
              <InfoRow
                icon="layers-outline"
                label="OS Version"
                value={String(Platform.Version)}
                color={theme.purple}
                theme={theme}
                isLast
              />
            </SectionCard>

            {/* ── Tips ── */}
            <SectionCard title="TIPS FOR BETTER SPEED" theme={theme}>
              {[
                {
                  icon: "wifi-outline" as const,
                  tip: "Move closer to your router for a stronger signal",
                },
                {
                  icon: "refresh-circle-outline" as const,
                  tip: "Restart your router if speeds seem lower than usual",
                },
                {
                  icon: "apps-outline" as const,
                  tip: "Close background apps during speed tests",
                },
                {
                  icon: "time-outline" as const,
                  tip: "Test during off-peak hours for accurate results",
                },
              ].map((item, i, arr) => (
                <View
                  key={i}
                  style={[
                    s.tipRow,
                    i < arr.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={13}
                    color={theme.textSub}
                    style={{ marginTop: 1 }}
                  />
                  <Text style={[s.tipText, { color: theme.textSub }]}>
                    {item.tip}
                  </Text>
                </View>
              ))}
            </SectionCard>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Inline sub-components ────────────────────────────────────────────────────

function SectionCard({
  title,
  theme,
  children,
}: {
  title: string;
  theme: ReturnType<typeof useTheme>["theme"];
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        sc.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <Text style={[sc.label, { color: theme.textSub }]}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
  theme,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  theme: ReturnType<typeof useTheme>["theme"];
  isLast?: boolean;
}) {
  return (
    <View
      style={[
        ir.row,
        !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border },
      ]}
    >
      <View style={[ir.iconBox, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={14} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[ir.label, { color: theme.textSub }]}>{label}</Text>
        <Text style={[ir.value, { color: theme.text }]} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

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
  loadWrap: { alignItems: "center", paddingTop: 100 },
  loadText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  heroCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  heroType: { fontSize: 18, fontWeight: "800" },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  qualityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  qualityText: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5 },
  signalRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  signalBar: { width: 16, borderRadius: 3 },
  signalLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1,
    marginLeft: 6,
    marginBottom: 2,
  },
  section: { paddingHorizontal: 16 },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
    gap: 10,
  },
  tipText: { fontSize: 12, flex: 1, lineHeight: 18 },
});

const sc = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
    borderWidth: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 3,
    marginBottom: 4,
  },
});

const ir = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    gap: 12,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  value: { fontSize: 13, fontWeight: "700" },
});
