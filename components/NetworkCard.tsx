import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface Props {
  type: string;
  isConnected: boolean;
  isReachable: boolean | null;
  ip: string;
}

export function NetworkCard({ type, isConnected, isReachable, ip }: Props) {
  const { theme } = useTheme();
  const isWifi = type.toLowerCase().includes("wifi");
  const accentColor = isConnected ? theme.green : theme.red;
  const netColor = isWifi ? theme.cyan : theme.purple;
  const icon: keyof typeof Ionicons.glyphMap = isWifi ? "wifi" : "cellular";

  return (
    <View
      style={[
        s.card,
        { backgroundColor: theme.card, borderColor: theme.border },
      ]}
    >
      <View style={s.row}>
        <View style={[s.iconBox, { backgroundColor: netColor + "20" }]}>
          <Ionicons name={icon} size={18} color={netColor} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.typeText, { color: theme.text }]}>{type}</Text>
          <Text style={[s.ipText, { color: theme.textSub }]}>{ip}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: accentColor + "20" }]}>
          <View style={[s.dot, { backgroundColor: accentColor }]} />
          <Text style={[s.badgeText, { color: accentColor }]}>
            {isConnected ? "Online" : "Offline"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  typeText: { fontSize: 14, fontWeight: "700" },
  ipText: { fontSize: 11, marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    gap: 5,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
});
