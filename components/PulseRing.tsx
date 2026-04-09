import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

interface Props {
  color: string;
  size: number;
  isActive: boolean;
}

export function PulseRing({ color, size, isActive }: Props) {
  const s1 = useRef(new Animated.Value(1)).current;
  const o1 = useRef(new Animated.Value(0.5)).current;
  const s2 = useRef(new Animated.Value(1)).current;
  const o2 = useRef(new Animated.Value(0.3)).current;
  const r1 = useRef<Animated.CompositeAnimation | null>(null);
  const r2 = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (isActive) {
      r1.current = Animated.loop(
        Animated.parallel([
          Animated.timing(s1, {
            toValue: 1.7,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(o1, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      );
      r2.current = Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(s2, {
              toValue: 1.5,
              duration: 1400,
              useNativeDriver: true,
            }),
            Animated.timing(o2, {
              toValue: 0,
              duration: 1400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      );
      r1.current.start();
      r2.current.start();
    } else {
      r1.current?.stop();
      r2.current?.stop();
      s1.setValue(1);
      o1.setValue(0.5);
      s2.setValue(1);
      o2.setValue(0.3);
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1.5,
          borderColor: color,
          opacity: o1,
          transform: [{ scale: s1 }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute",
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 1,
          borderColor: color,
          opacity: o2,
          transform: [{ scale: s2 }],
        }}
      />
    </View>
  );
}
