import { mark } from "./brandMark";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  Image as NativeImage,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { Profile } from "./config";
import { imageSource } from "./api";
export function Image(props: React.ComponentProps<typeof NativeImage>) {
  const source = props.source as {
    uri?: string;
    headers?: Record<string, string>;
  };
  const [uri, setUri] = useState<{ url: string; key: string }>();
  const auth = source?.headers?.Authorization;
  useEffect(() => {
    if (Platform.OS !== "web" || !source?.uri || !auth) return;
    let cancelled = false,
      url = "";
    fetch(source.uri, { headers: { Authorization: auth } })
      .then((r) => {
        if (!r.ok) throw new Error("photo_unavailable");
        return r.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setUri({ url, key: source.uri! + auth });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source?.uri, auth]);
  if (Platform.OS === "web" && auth) {
    if (uri?.key !== source.uri! + auth) return <View style={props.style} />;
    return <NativeImage {...props} source={{ uri: uri.url }} />;
  }
  return <NativeImage {...props} />;
}
export const c = {
  bg: "#F8F4EC",
  ink: "#344C46",
  muted: "#756F65",
  accent: "#B76850",
  line: "#E3DACE",
  card: "#FFFEFA",
  sky: "#DEE9E8",
};
export function Bird({ size = 44 }: { size?: number }) {
 return <Svg width={size} height={size} viewBox="0 0 80 80">
  <Circle cx="40" cy="40" r="39" fill="#DEE9E8" />
  <Path d={mark.body} fill={c.ink} />
  <Path d={mark.wing} fill={c.accent} />
  <Path d={mark.beak} fill={c.accent} />
  <Circle cx="59" cy="34" r="1.7" fill="#FFFEFA" />
  <Path d={mark.envelope} fill="#FFFEFA" stroke={c.ink} strokeWidth="1.5" strokeLinejoin="round" />
 </Svg>;
}
export function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        secondary && s.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.7 : 1 },
      ]}
    >
      <Text style={[s.buttonText, secondary && { color: c.ink }]}>{title}</Text>
    </Pressable>
  );
}
export function Field({
  label,
  value,
  onChange,
  multiline = false,
  secure = false,
  email = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  secure?: boolean;
  email?: boolean;
}) {
  return (
    <View style={{ gap: 7 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        placeholder={label}
        placeholderTextColor="#9BA49E"
        value={value}
        onChangeText={onChange}
        secureTextEntry={secure}
        autoCapitalize={email ? "none" : "sentences"}
        keyboardType={email ? "email-address" : "default"}
        multiline={multiline}
        maxLength={multiline ? 10000 : secure ? 128 : 500}
        style={[
          s.input,
          multiline && { height: 110, textAlignVertical: "top" },
        ]}
      />
    </View>
  );
}
export function Chips({
  values,
  selected,
  onChange,
}: {
  values: { id: string; label: string }[];
  selected: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 4 }}
    >
      {values.map((v) => (
        <Pressable
          key={v.id}
          accessibilityRole="button"
          accessibilityState={{ selected: v.id === selected }}
          onPress={() => onChange(v.id)}
          style={[s.chip, v.id === selected && s.chipActive]}
        >
          <Text
            style={{
              color: v.id === selected ? "#fff" : c.ink,
              fontSize: 12,
              fontWeight: "600",
            }}
          >
            {v.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function Avatar({
  person,
  size = 52,
}: {
  person: Profile;
  size?: number;
}) {
  return person.hasPhoto ? (
    <Image
      accessibilityLabel={person.nickname}
      source={imageSource(`/profiles/${person.id}/avatar?v=${person.avatarVersion || "0"}`)}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#EDE2D2",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size * 0.56} height={size * 0.56} viewBox="0 0 40 40">
        {person.avatar === "moon" ? <Path d="M28 5A15 15 0 1 0 35 28A16 16 0 0 1 28 5Z" fill="none" stroke={c.ink} strokeWidth={1.5} />
          : person.avatar === "sea" ? <Path d="M3 13Q9 7 15 13T27 13T39 13M3 21Q9 15 15 21T27 21T39 21M3 29Q9 23 15 29T27 29T39 29" fill="none" stroke={c.ink} strokeWidth={1.5} />
          : person.avatar === "flower" ? <><Path d="M20 16C7 0 0 19 16 20C0 33 19 40 20 24C33 40 40 21 24 20C40 7 21 0 20 16Z" fill="none" stroke={c.accent} strokeWidth={1.5} /><Circle cx="20" cy="20" r="3" fill={c.accent} /></>
          : <Path d="M5 27L13 19L10 7Q23 11 25 20Q28 11 33 15L36 19L32 20Q28 34 15 29L5 32Z" fill="none" stroke={c.ink} strokeWidth={1.5} strokeLinejoin="round" />}
      </Svg>
    </View>
  );
}
export function Frame({
  title,
  children,
  onClose,
  closeText,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  closeText: string;
}) {
  return (
    <Modal animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={s.root}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={s.modalHeader}>
            <Text style={s.section}>{title}</Text>
            <Pressable accessibilityRole="button" onPress={onClose}>
              <Text style={s.link}>{closeText}</Text>
            </Pressable>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.modalContent}
          >
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
export const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: c.bg },
  center: { alignItems: "center", justifyContent: "center", gap: 24 },
  top: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  wordmark: {
    fontSize: 20,
    fontWeight: "700",
    color: c.ink,
    letterSpacing: -0.8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  content: {
    padding: 22,
    paddingBottom: 35,
    gap: 18,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  hero: {
    fontSize: 30,
    lineHeight: 42,
    fontWeight: "600",
    letterSpacing: -1.3,
    color: c.ink,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 1.8,
    color: c.muted,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 23,
    color: c.muted,
    marginTop: -8,
    marginBottom: 5,
  },
  body: { fontSize: 15, lineHeight: 26, color: c.ink },
  caption: { fontSize: 12, lineHeight: 20, color: c.muted },
  label: { fontSize: 13, fontWeight: "600", color: c.ink },
  section: { fontSize: 18, lineHeight: 26, fontWeight: "600", color: c.ink },
  link: { fontSize: 12, fontWeight: "600", color: c.ink },
  button: {
    minHeight: 48,
    backgroundColor: c.ink,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: c.line,
  },
  input: {
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: c.ink,
    minHeight: 49,
  },
  person: { paddingVertical: 24, borderBottomWidth: 1, borderColor: c.line, gap: 16 },
  personStory: { fontSize: 16, lineHeight: 28, color: c.ink },
  sharedLine: { fontSize: 12, lineHeight: 21, color: "#8A523C" },
  questionToggle: { paddingVertical: 14, borderBottomWidth: 1, borderColor: c.line },
  card: {
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 10,
    padding: 20,
    gap: 15,
  },
  softCard: { backgroundColor: "#EFE7DA", borderRadius: 8, padding: 18 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.card,
  },
  chipActive: { backgroundColor: c.ink, borderColor: c.ink },
  tag: {
    fontSize: 11,
    color: "#677F70",
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 3,
    borderRadius: 8,
  },
  pill: {
    fontSize: 11,
    color: c.accent,
    backgroundColor: "#F6EAE0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: "#E9EAE0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: c.accent },
  flightRow: {
    backgroundColor: c.card,
    borderColor: c.line,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  envelope: {
    backgroundColor: "#FFFCF1",
    borderWidth: 1,
    borderColor: "#DDDCCB",
    borderRadius: 8,
    padding: 22,
    gap: 14,
    borderBottomWidth: 4,
  },
  envelopeName: {
    fontSize: 27,
    color: c.ink,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
  },
  stamp: {
    fontSize: 27,
    color: c.accent,
    borderWidth: 1,
    borderColor: "#C5BAA0",
    borderStyle: "dashed",
    padding: 8,
  },
  nav: {
    flexDirection: "row",
    backgroundColor: c.card,
    borderTopWidth: 1,
    borderColor: c.line,
    paddingTop: 12,
    paddingBottom: 6,
  },
  navItem: { flex: 1, alignItems: "center", gap: 4, minHeight: 52 },
  navDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: c.accent },
  onboardArt: {
    paddingVertical: 22,
    alignItems: "center",
    gap: 20,
    backgroundColor: c.sky,
    borderRadius: 28,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 22,
    borderBottomWidth: 1,
    borderColor: c.line,
  },
  modalContent: {
    padding: 24,
    gap: 20,
    paddingBottom: 50,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  letterPaper: {
    padding: 24,
    borderWidth: 1,
    borderColor: "#E6E3D5",
    gap: 24,
    borderRadius: 4,
  },
  letterDear: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontStyle: "italic",
    fontSize: 21,
    lineHeight: 30,
    color: c.ink,
  },
  letterInput: {
    minHeight: 220,
    fontSize: 16,
    lineHeight: 29,
    color: c.ink,
    textAlignVertical: "top",
  },
  letterBody: { fontSize: 16, lineHeight: 31, color: c.ink },
  thumbnail: { width: 90, height: 110, borderRadius: 4, marginBottom: 8 },
  error: { padding: 12, backgroundColor: "#F7E5DC" },
});
