// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

const MAPPING = {
  // Navigation
  "house.fill": "home",
  "calendar": "calendar-today",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  // Actions
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "xmark": "close",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "circle": "radio-button-unchecked",
  "plus": "add",
  "minus": "remove",
  "pencil": "edit",
  "gear": "settings",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  // Health / Wellness
  "moon.fill": "bedtime",
  "figure.walk": "directions-walk",
  "flame.fill": "local-fire-department",
  "heart.fill": "favorite",
  "sun.max.fill": "wb-sunny",
  "bolt.fill": "bolt",
  "brain.head.profile": "psychology",
  "star.fill": "star",
  "trophy.fill": "emoji-events",
  "sparkles": "auto-awesome",
  "leaf.fill": "eco",
  "waveform.path.ecg": "monitor-heart",
  // Data
  "chart.line.uptrend.xyaxis": "trending-up",
  "chart.pie.fill": "pie-chart",
  "list.bullet": "list",
  "clock.fill": "schedule",
  "calendar.badge.clock": "event",
  // Misc
  "info.circle": "info",
  "lock.fill": "lock",
  "bell.fill": "notifications",
  "tag.fill": "label",
  "lightbulb.fill": "lightbulb",
  "person.2.fill": "group",
  "hand.raised.fill": "back-hand",
  "globe": "language",
} as IconMapping;

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
