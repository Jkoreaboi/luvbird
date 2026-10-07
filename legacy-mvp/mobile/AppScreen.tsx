import { commonGround, connectionCopy } from "./src/connection";
import Onboarding, { introCopy } from "./src/Onboarding";
import { journeyMessages } from "./src/journeyMessages";
import { accountMessages } from "./src/accountMessages";
import { guide, about } from "./src/guide";
import {
  PendingPhoto,
  savePending,
  loadPending,
  clearPending,
} from "./src/pendingPhoto";
import { extras, questions } from "./src/extraMessages";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Switch,
  AppState,
  Animated,
  AccessibilityInfo,
  RefreshControl,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  brand,
  cities,
  avatarSymbols,
  emptyProfile,
  Profile,
  Letter,
  Connection,
  Draft,
} from "./src/config";
import { messages, Lang, MessageKey, errorText } from "./src/i18n";
import { api, setToken, imageSource } from "./src/api";
import WorldMap from "./src/WorldMap";
import { progress } from "./src/route";
import {
  s,
  c,
  Bird,
  Button,
  Field,
  Chips,
  Avatar,
  Frame,
  Image,
} from "./src/ui";

const sessionStore = {
  get: () =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.getItem("luvbird-session"))
      : SecureStore.getItemAsync("luvbird-session"),
  set: (v: string) =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.setItem("luvbird-session", v))
      : SecureStore.setItemAsync("luvbird-session", v),
  clear: () =>
    Platform.OS === "web"
      ? Promise.resolve(sessionStorage.removeItem("luvbird-session"))
      : SecureStore.deleteItemAsync("luvbird-session"),
};
export default function App() {
  return (
    <SafeAreaProvider>
      <Main />
    </SafeAreaProvider>
  );
}
function Main() {
  const [lang, setLang] = useState<Lang>("ko"),
    t = useCallback((key: MessageKey) => messages[lang][key], [lang]);
  const accountCopy = accountMessages[lang];
  const journeyCopy = journeyMessages[lang];
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("dearbird-onboarding-v1").then(value => setIntroSeen(value === "done")).catch(() => setIntroSeen(false));
  }, []);
  const [startupBlocked, setStartupBlocked] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [emailReady, setEmailReady] = useState(true);
  const [accountMode, setAccountMode] = useState<"reset" | "verify" | null>(null);
  const [accountToken, setAccountToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountStatus, setAccountStatus] = useState({ verified: false, emailAvailable: false });
  const closeAccount = () => { setAccountMode(null); setAccountToken(""); setNewPassword(""); setConfirmPassword(""); };
  const [helpPage, setHelpPage] = useState<"guide" | "about" | null>(null);
  const [languagePicker, setLanguagePicker] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem("app-language")
      .then((value) => {
        if (value === "ko" || value === "en" || value === "ja") setLang(value);
      })
      .catch(() => {});
  }, []);
  async function changeLanguage(value: Lang) {
    await AsyncStorage.setItem("app-language", value);
    setLang(value);
    setLanguagePicker(false);
  }
  const [boot, setBoot] = useState(true),
    [me, setMe] = useState<Profile | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const params = useLocalSearchParams<{ screen: string }>();
  const tab = ["map", "pals", "inbox", "me"].includes(params.screen)
    ? params.screen
    : "pals";
  const setTab = (screen: string) => router.setParams({ screen });
  const [profiles, setProfiles] = useState<Profile[]>([]),
    [requests, setRequests] = useState<Connection[]>([]),
    [letters, setLetters] = useState<Letter[]>([]),
    [drafts, setDrafts] = useState<Draft[]>([]),
    [blocks, setBlocks] = useState<Profile[]>([]);
  const [serverClock, setServerClock] = useState(() => ({
      server: Date.now(),
      local: performance.now(),
    })),
    [now, setNow] = useState(() => Date.now()),
    [delivery, setDelivery] = useState(86400);
  const [active, setActive] = useState<string>(),
    [selected, setSelected] = useState<Profile | null>(null),
    [composer, setComposer] = useState<Profile | null>(null),
    [showQuestions, setShowQuestions] = useState(false),
    [draft, setDraft] = useState<Draft | null>(null),
    [draftState, setDraftState] = useState(""),
    [uploading, setUploading] = useState(false),
    [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null);
  const [opened, setOpened] = useState<Letter | null>(null),
    [unsealed, setUnsealed] = useState(false),
    [sent, setSent] = useState(false),
    [zoomPhoto, setZoomPhoto] = useState<string | null>(null),
    [editing, setEditing] = useState(false),
    [form, setForm] = useState<any>(emptyProfile),
    [notice, setNotice] = useState<"privacy" | "terms" | null>(null),
    [reportTarget, setReportTarget] = useState<Profile | null>(null),
    [reason, setReason] = useState(""),
    [deleteMode, setDeleteMode] = useState(false),
    [deletePassword, setDeletePassword] = useState(""),
    [notify, setNotify] = useState(false);
  const [purposeFilter, setPurposeFilter] = useState("");
  const [country, setCountry] = useState(""),
    [language, setLanguage] = useState(""),
    [interest, setInterest] = useState(""),
    [folder, setFolder] = useState("incoming");
  const [register, setRegister] = useState(false),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [adult, setAdult] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [motion] = useState(() => new Animated.Value(0));
  const sending = useRef(false),
    draftWrite = useRef(Promise.resolve()),
    localDraftWrite = useRef(Promise.resolve());
  const userId = me?.id;
  const tell = (msg: string) => {
    if (Platform.OS === "web") window.alert(msg);
    else Alert.alert(t("notice"), msg);
  };
  const confirm = (title: string, body: string, action: () => void) => {
    if (Platform.OS === "web") {
      if (window.confirm(title + "\n" + body)) action();
    } else
      Alert.alert(title, body, [
        { text: t("cancel"), style: "cancel" },
        { text: t("continue"), onPress: action },
      ]);
  };
  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e: any) {
      const msg = errorText(e.message, lang);
      setError(msg);
      tell(msg);
    } finally {
      setBusy(false);
    }
  };
  const refresh = useCallback(async () => {
    try {
    const [p, r, l, d, b, m, h, account] = await Promise.all([
      api<Profile[]>("/profiles"),
      api<Connection[]>("/requests"),
      api<{ serverTime: number; letters: Letter[] }>("/letters"),
      api<Draft[]>("/drafts"),
      api<Profile[]>("/blocks"),
      api("/me"),
      api("/health"),
      api("/me/account"),
    ]);
    setProfiles(p);
    setRequests(r);
    setLetters(l.letters);
    setDrafts(d);
    setBlocks(b);
    setMe(m.profile);
    setNotify(m.notify);
    setAccountStatus(account);
    setServerClock({ server: l.serverTime, local: performance.now() });
    setNow(l.serverTime);
    setDelivery(h.deliverySeconds);
    setVerificationRequired(!!h.emailVerificationRequired);
    setEmailReady(!!h.emailAvailable);
    setError("");
    } catch (e: any) {
      if (e.message === "unauthorized") {
        await sessionStore.clear(); setToken(""); setMe(null);
        setLetters([]); setProfiles([]); setRequests([]); setDrafts([]); setBlocks([]);
        setOpened(null); setSelected(null); setComposer(null); setDraft(null);
      }
      throw e;
    }
  }, []);
  const restoreSession = useCallback(async () => {
    try {
      const health = await api("/health");
      setVerificationRequired(!!health.emailVerificationRequired);
      setEmailReady(!!health.emailAvailable);
      const value = await sessionStore.get();
      if (value) { setToken(value); await refresh(); }
      setStartupBlocked(false);
    } catch (e: any) {
      setStartupBlocked(e.message !== "unauthorized");
      setError(errorText(e.message, "ko"));
    } finally { setBoot(false); }
  }, [refresh]);
  useEffect(() => {
    void Promise.resolve().then(restoreSession);
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );
    return () => sub.remove();
  }, [restoreSession]);
  useEffect(() => {
    const timer = setInterval(
      () => setNow(serverClock.server + performance.now() - serverClock.local),
      1000,
    );
    return () => clearInterval(timer);
  }, [serverClock]);
  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh().catch(() => setError(t("offline")));
    });
    const timer = setInterval(() => refresh().catch((e: any) => setError(errorText(e.message, lang))), 60000);
    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [userId, t, refresh, lang]);
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      setTab("inbox");
      setFolder("arrived");
      refresh().catch(() => {});
    });
    return () => sub.remove();
  }, [refresh]);
  useEffect(() => {
    if (!sent && !unsealed) return;
    motion.setValue(0);
    Animated.timing(motion, {
      toValue: 1,
      duration: reduceMotion ? 0 : 650,
      useNativeDriver: true,
    }).start();
  }, [sent, unsealed, reduceMotion, motion]);
  const draftKey = (user: string, recipient: string) =>
    `draft:${user}:${recipient}`;
  useEffect(() => {
    if (!draft || !userId || sending.current) return;
    const value = { ...draft, updated: Date.now() };
    localDraftWrite.current = localDraftWrite.current.catch(() => {}).then(() => AsyncStorage.setItem(
      draftKey(userId, value.recipient), JSON.stringify(value),
    ));
    localDraftWrite.current.catch(() => setDraftState(t("error")));
    setDraftState(t("saving"));
    const timer = setTimeout(() => {
      draftWrite.current = draftWrite.current.then(async () => {
        try {
          await api(`/drafts/${value.recipient}`, "PUT", value);
          setDraftState(t("saved"));
        } catch {
          setDraftState(t("offline"));
        }
      });
    }, 650);
    return () => clearTimeout(timer);
  }, [draft, userId, t]);
  async function signIn() {
    const result = await api(
      `/auth/${register ? "register" : "login"}`,
      "POST",
      register
        ? { email: email.trim(), password, adult, profile: { ...form, interests: form.interests.map((v: string) => v.trim()).filter(Boolean) } }
        : { email: email.trim(), password },
    );
    setToken(result.token);
    await sessionStore.set(result.token);
    setPassword("");
    setMe(result.profile);
    setTab("pals");
    await refresh();
  }
  async function clearLocal() {
    await AsyncStorage.multiRemove(
      (await AsyncStorage.getAllKeys()).filter((k) =>
        k.startsWith(`draft:${me?.id}:`),
      ),
    );
    await sessionStore.clear();
    setToken("");
    setMe(null);
    closeAccount();
    setAccountStatus({ verified: false, emailAvailable: false });
    setLetters([]);
    setProfiles([]);
    setOpened(null);
    setComposer(null);
    setDraft(null);
    setTab("pals");
    setEditing(false);
  }
  async function logout() {
    const deviceToken = await AsyncStorage.getItem("push-token");
    if (deviceToken) await api("/devices", "DELETE", { token: deviceToken });
    await api("/auth/logout", "POST");
    await clearLocal();
  }
  async function compose(p: Profile) {
    setShowQuestions(false);
    await localDraftWrite.current.catch(() => {});
    const remote = drafts.find((d) => d.recipient === p.id),
      raw = await AsyncStorage.getItem(draftKey(me!.id, p.id)),
      local: Draft | undefined = raw ? JSON.parse(raw) : undefined;
    setDraft(
      local && (!remote || (local.updated || 0) > (remote.updated || 0))
        ? local
        : remote || {
            recipient: p.id,
            body: "",
            photos: [],
            paper: "ivory",
            stamp: "bird",
            key: Crypto.randomUUID(),
          },
    );
    setPendingPhoto(await loadPending(me!.id, p.id));
    setComposer(p);
    setSelected(null);
    setOpened(null);
  }
  async function closeComposer() {
    if (uploading) return;
    const value = draft;
    if (value && me) {
      await localDraftWrite.current.catch(() => {});
      await AsyncStorage.setItem(
        draftKey(me.id, value.recipient),
        JSON.stringify({ ...value, updated: Date.now() }),
      );
      await draftWrite.current;
      try {
        await api(`/drafts/${value.recipient}`, "PUT", value);
      } catch {
        /* persisted locally */
      }
    }
    setComposer(null);
    setDraft(null);
    setPendingPhoto(null);
    refresh().catch(() => {});
  }
  async function choosePhoto(avatar = false) {
    setUploading(true);
    try {
      const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!p.granted) {
        tell(t("photoPermission"));
        return;
      }
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: avatar,
      });
      if (r.canceled) return;
      const image = await ImageManipulator.manipulateAsync(
        r.assets[0].uri,
        [{ resize: { width: 1600 } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
          base64: true,
        },
      );
      if (!image.base64) throw new Error("photo");
      if (avatar) {
        await api("/me/avatar", "PUT", { data: image.base64 });
        await refresh();
      } else {
        const pending = { key: Crypto.randomUUID(), data: image.base64 };
        await savePending(me!.id, draft!.recipient, pending);
        setPendingPhoto(pending);
        await uploadPhoto(pending);
      }
    } catch (e: any) {
      tell(errorText(e.message, lang));
    } finally {
      setUploading(false);
    }
  }
  async function uploadPhoto(photo: PendingPhoto) {
    if (!draft || !me) return;
    setUploading(true);
    try {
      const p = await api("/photos", "POST", photo);
      const next = {
        ...draft,
        updated: Date.now(),
        photos: [...new Set([...draft.photos, p.id])].slice(0, 3),
      };
      await AsyncStorage.setItem(
        draftKey(me.id, draft.recipient),
        JSON.stringify(next),
      );
      setDraft(next);
      await clearPending(me.id, draft.recipient);
      setPendingPhoto(null);
    } finally {
      setUploading(false);
    }
  }
  async function sendLetter() {
    if (!draft || sending.current || uploading || pendingPhoto) return;
    sending.current = true;
    try {
      await localDraftWrite.current.catch(() => {});
      await draftWrite.current;
      await api("/letters", "POST", draft);
      await AsyncStorage.removeItem(draftKey(me!.id, draft.recipient));
      setComposer(null);
      setDraft(null);
      setSent(true);
      setTab("map");
      await refresh();
    } finally {
      sending.current = false;
    }
  }
  async function openLetter(l: Letter) {
    if (l.recipient.id === me?.id && now < l.arrives) {
      tell(t("locked"));
      return;
    }
    setOpened(await api<Letter>(`/letters/${l.id}`));
    setUnsealed(false);
  }
  async function enableNotifications(enabled: boolean) {
    if (enabled) {
      if (Platform.OS === "web") {
        tell(extras[0][lang]);
        return;
      }
      if (Platform.OS === "android")
        await Notifications.setNotificationChannelAsync("default", {
          name: "Letters",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      if ((await Notifications.requestPermissionsAsync()).status !== "granted")
        return;
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;
      if (!projectId) {
        tell(extras[1][lang]);
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      await AsyncStorage.setItem("push-token", token);
      await api("/devices", "PUT", { token });
    }
    await api("/me/notifications", "PUT", { enabled });
    setNotify(enabled);
  }
  const date = (ms: number) =>
    new Date(ms).toLocaleString(
      { ko: "ko-KR", en: "en-US", ja: "ja-JP" }[lang],
      {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    );
  const remaining = (l: Letter) => {
    const ms = Math.max(0, l.arrives - now);
    if (!ms) return t("arrived");
    const minutes = Math.ceil(ms / 60000);
    return `${Math.floor(minutes / 60)}${t("hours")} ${String(minutes % 60).padStart(2, "0")}${extras[2][lang]}`;
  };
  const pals = requests
      .filter((r) => r.status === "accepted")
      .map((r) => (r.sender.id === me?.id ? r.recipient : r.sender)),
    inbound = requests.filter(
      (r) => r.status === "pending" && r.recipient.id === me?.id,
    );
  const outbound = requests.filter(r => r.status === "pending" && r.sender.id === me?.id);
  const arrivedForMe = letters.find(l => l.recipient.id === me?.id && l.arrives <= now);
  const firstPal = pals.find(p => !letters.some(l => l.sender.id === me?.id && l.recipient.id === p.id));
  const nextStep = verificationRequired && !accountStatus.verified ? "verify"
    : arrivedForMe ? "received" : inbound.length ? "inbound" : firstPal ? "write"
    : letters.length ? "waiting" : outbound.length ? "pending" : "discover";
  const nextAction = () => {
    if (nextStep === "verify") setAccountMode("verify");
    else if (nextStep === "received" && arrivedForMe) void run(() => openLetter(arrivedForMe));
    else if (nextStep === "write" && firstPal) void run(() => compose(firstPal));
    else if (nextStep === "waiting") { setFolder("arrived"); setTab("inbox"); }
    else setTab("pals");
  };
  const flight =
    letters.find((l) => l.id === active) ||
    letters.find((l) => l.arrives > now) ||
    letters[0];
  const filtered = profiles.filter(
    (p) =>
      !pals.some((pal) => pal.id === p.id) &&
      !requests.some(r => r.status === "pending" && (r.sender.id === p.id || r.recipient.id === p.id)) &&
      (!country || cities[p.city].country === country) &&
      (!language || p.languages.includes(language)) &&
      (!purposeFilter || (p.purpose || "letters") === purposeFilter) &&
      (!interest ||
        p.interests.some((i) =>
          i.toLowerCase().includes(interest.toLowerCase()),
        )),
  );
  const mailbox = letters.filter((l) =>
    folder === "sent"
      ? l.sender.id === me?.id
      : l.recipient.id === me?.id &&
        (folder === "arrived" ? l.arrives <= now : l.arrives > now),
  );
  function profileFields() {
    return (
      <>
        <Field
          label={t("nickname")}
          value={form.nickname}
          onChange={(v) => setForm({ ...form, nickname: v })}
        />
        <Field
          label={
            lang === "ja"
              ? "MBTI（任意）"
              : lang === "ko"
                ? "MBTI (선택)"
                : "MBTI (optional)"
          }
          value={form.mbti || ""}
          onChange={(v) =>
            setForm({ ...form, mbti: v.toUpperCase().slice(0, 4) })
          }
        />
        <Text style={s.label}>{extras[3][lang]}</Text>
        <Chips
          values={[
            { id: "friendship", label: extras[4][lang] },
            { id: "romance", label: extras[5][lang] },
            { id: "language", label: extras[6][lang] },
            { id: "letters", label: extras[7][lang] },
            { id: "travel", label: extras[8][lang] },
          ]}
          selected={form.purpose || "letters"}
          onChange={(v) => setForm({ ...form, purpose: v })}
        />
        {form.purpose === "travel" && (
          <Field
            label={extras[9][lang]}
            value={form.travelCity || ""}
            onChange={(v) => setForm({ ...form, travelCity: v.slice(0, 60) })}
          />
        )}
        <Text style={s.label}>{t("city")}</Text>
        <Chips
          values={Object.entries(cities).map(([id, v]) => ({
            id,
            label: v.name,
          }))}
          selected={form.city}
          onChange={(v) => setForm({ ...form, city: v })}
        />
        <Field
          label={t("bio")}
          value={form.bio}
          onChange={(v) => setForm({ ...form, bio: v })}
          multiline
        />
        <Field
          label={t("looking")}
          value={form.lookingFor}
          onChange={(v) => setForm({ ...form, lookingFor: v })}
        />
        <Field
          label={extras[10][lang]}
          value={form.interests.join(",")}
          onChange={(v) =>
            setForm({ ...form, interests: v.split(",").slice(0, 8) })
          }
        />
        <Text style={s.label}>{t("language")}</Text>
        <View style={s.rowWrap}>
          {["ko", "en", "ja", "es", "fr", "de"].map((l) => (
            <Pressable
              key={l}
              style={[s.chip, form.languages.includes(l) && s.chipActive]}
              onPress={() =>
                setForm({
                  ...form,
                  languages: form.languages.includes(l)
                    ? form.languages.filter((x: string) => x !== l)
                    : [...form.languages, l],
                })
              }
            >
              <Text
                style={{ color: form.languages.includes(l) ? "#fff" : c.ink }}
              >
                {l.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>
        <Chips
          values={Object.entries(avatarSymbols).map(([id, label]) => ({
            id,
            label,
          }))}
          selected={form.avatar}
          onChange={(v) => setForm({ ...form, avatar: v })}
        />
      </>
    );
  }
  function connectionDetails(p: Profile, detail = false) {
    if (!me || me.id === p.id) return null;
    const shared = commonGround(me, p), copy = connectionCopy[lang];
    const goalIndex = ["friendship", "romance", "language", "letters", "travel"].indexOf(p.purpose || "letters");
    const lines = [
      shared.languages.length ? `${copy.languages} · ${shared.languages.join(" / ").toUpperCase()}` : "",
      shared.interests.length ? `${copy.interests} · ${shared.interests.join(", ")}` : "",
      shared.purpose ? `${copy.purpose} · ${extras[goalIndex + 4][lang].replace(/^\S+\s/, "")}` : "",
    ].filter(Boolean);
    return <View style={{ gap: 6 }}>
      {detail && <Text style={s.label}>{copy.title}</Text>}
      {lines.map(line => <Text key={line} style={s.sharedLine}>{line}</Text>)}
      {detail && !lines.length && <Text style={s.caption}>{copy.none}</Text>}
    </View>;
  }
  function personCard(p: Profile) {
    const purposeIndex = ["friendship", "romance", "language", "letters", "travel"].indexOf(p.purpose || "letters");
    return (
      <Pressable key={p.id} accessibilityRole="button" onPress={() => setSelected(p)} style={({pressed}) => [s.person, {opacity: pressed ? 0.65 : 1}]}>
        <View style={s.row}>
          <Avatar person={p} size={64} />
          <View style={{ flex: 1, gap: 5 }}>
            <Text style={[s.section, {fontSize: 21}]}>{p.nickname}</Text>
            <Text style={s.caption}>{cities[p.city]?.name} · {p.languages.join(" / ").toUpperCase()}</Text>
          </View>
          <Text style={[s.link, {fontSize: 20}]}>›</Text>
        </View>
        <Text style={s.personStory} numberOfLines={3}>{p.bio || p.lookingFor}</Text>
        {connectionDetails(p)}
        <Text style={s.caption}>{[extras[purposeIndex + 4][lang].replace(/^\S+\s/, ""), p.mbti, p.purpose === "travel" ? p.travelCity : ""].filter(Boolean).join(" · ")}</Text>
      </Pressable>
    );
  }

  function envelope(l: Letter) {
    const incoming = l.recipient.id === me?.id,
      other = incoming ? l.sender : l.recipient;
    return (
      <Pressable
        key={l.id}
        style={s.envelope}
        onPress={() => run(() => openLetter(l))}
      >
        <View style={s.row}>
          <Text style={s.eyebrow}>
            {incoming ? t("from") : t("to")} ·{" "}
            {cities[other.city]?.name.toUpperCase()}
          </Text>
          <Text style={s.stamp}>✉</Text>
        </View>
        <Text style={s.envelopeName}>{other.nickname}</Text>
        <View style={s.row}>
          <Text style={s.caption}>{date(l.arrives)}</Text>
          <Text style={s.link}>{remaining(l)} ↗</Text>
        </View>
      </Pressable>
    );
  }
  if (introSeen === false || introOpen) return <Onboarding lang={lang} onLanguage={value => void run(() => changeLanguage(value))} busy={busy} onComplete={() => void run(async () => {
    await AsyncStorage.setItem("dearbird-onboarding-v1", "done");
    setIntroSeen(true); setIntroOpen(false);
  })} />;
  if (boot || introSeen === null)
    return (
      <SafeAreaView style={[s.root, s.center]}>
        <Bird size={90} />
        <ActivityIndicator color={c.ink} />
      </SafeAreaView>
    );
  if (startupBlocked) return (
    <SafeAreaView style={[s.root, s.center, { padding: 24, gap: 20 }]}>
      <Bird size={90} />
      <Text style={s.section}>{journeyCopy.offline}</Text>
      <Text style={s.body}>{journeyCopy.offlineBody}</Text>
      <Button title={journeyCopy.retry} onPress={() => { setBoot(true); void restoreSession(); }} />
    </SafeAreaView>
  );
  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      <View style={s.top}>
        <View style={s.row}>
          <Bird size={32} />
          <Text style={s.wordmark}>
            {brand.app}
            <Text style={{ fontSize: 11, color: c.muted }}>
              {" "}
              by {brand.company}
            </Text>
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="App language"
          onPress={() => setLanguagePicker(true)}
        >
          <Text style={s.link}>
            {{ ko: "한국어", en: "English", ja: "日本語" }[lang]}
          </Text>
        </Pressable>
      </View>
      {error ? (
        <Pressable onPress={() => setError("")} style={s.error}>
          <Text style={{ color: "#8E4735" }}>{error}</Text>
        </Pressable>
      ) : null}
      {!me ? (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={s.content}
          >
            <View style={s.onboardArt}>
              <Bird size={108} />
              <Text style={s.eyebrow}>SEOUL · · · · · SEATTLE</Text>
            </View>
            <Text style={s.hero}>{t("onboard")}</Text>
            <Text style={s.body}>{journeyCopy.intro}</Text>
            <Text style={s.caption}>{journeyCopy.privacy}</Text>
            {!emailReady && <Text style={s.caption}>{journeyCopy.prepare}</Text>}
            <View style={s.softCard}>
              <Text style={s.caption}>{t("rule")}</Text>
            </View>
            <Field label={t("email")} value={email} onChange={setEmail} email />
            <Field
              label={t("password")}
              value={password}
              onChange={setPassword}
              secure
            />
            {register && (
              <>
                {profileFields()}
                <View style={s.row}>
                  <Switch value={adult} onValueChange={setAdult} />
                  <Text style={[s.caption, { flex: 1 }]}>{t("adult")}</Text>
                </View>
              </>
            )}
            <Button
              title={register ? t("register") : t("login")}
              disabled={busy || (register && (!adult || form.nickname.trim().length < 2 || !form.languages.length))}
              onPress={() => run(signIn)}
            />
            <Button
              title={register ? t("login") : t("register")}
              secondary
              onPress={() => setRegister(!register)}
            />
            {!register && <Button title={accountCopy.recover} secondary onPress={() => setAccountMode("reset")} />}
            <Button title={introCopy[lang].replay} secondary onPress={() => setIntroOpen(true)} />
            <View style={s.rowWrap}>
              <Pressable accessibilityRole="button" onPress={() => setHelpPage("guide")}><Text style={s.link}>{guide[lang].title}</Text></Pressable>
              <Pressable accessibilityRole="button" onPress={() => setHelpPage("about")}><Text style={s.link}>{about[lang].title}</Text></Pressable>
              <Pressable onPress={() => setNotice("privacy")}>
                <Text style={s.link}>{t("privacy")}</Text>
              </Pressable>
              <Pressable onPress={() => setNotice("terms")}>
                <Text style={s.link}>{t("terms")}</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={s.content}
            refreshControl={
              <RefreshControl
                refreshing={busy}
                onRefresh={() => run(refresh)}
                tintColor={c.ink}
              />
            }
          >
            {tab === "map" && <View style={s.card}>
              <Text style={s.eyebrow}>{journeyCopy.title}</Text>
              <Text style={s.section}>{journeyCopy[nextStep]}</Text>
              <Text style={s.body}>{journeyCopy[`${nextStep}Body`]}</Text>
              <Button disabled={busy} title={nextStep === "verify" ? accountCopy.verify : nextStep === "received" ? t("open") : nextStep === "write" ? t("write") : nextStep === "waiting" ? t("inbox") : nextStep === "pending" || nextStep === "inbound" ? journeyCopy.requests : t("start")} onPress={nextAction} />
            </View>}
            {tab === "map" && (
              <>
                <Text style={s.eyebrow}>THE WORLD BETWEEN US</Text>
                <Text style={s.hero}>{t("journey")}</Text>
                <Text style={s.subtitle}>{t("mapSub")}</Text>
                <WorldMap letter={flight} now={now} label={t("simulation")} />
                <Text
                  style={[s.caption, { fontSize: 10, textAlign: "center" }]}
                >
                  {t("simulation")}
                </Text>
                {flight ? (
                  <View style={s.card}>
                    <View style={s.row}>
                      <Text style={s.eyebrow}>
                        {flight.sender.id === me.id ? t("to") : t("from")}{" "}
                        {
                          (flight.sender.id === me.id
                            ? flight.recipient
                            : flight.sender
                          ).nickname
                        }
                      </Text>
                      <Text style={s.pill}>{remaining(flight)}</Text>
                    </View>
                    <Text style={s.section}>
                      {flight.origin.name} → {flight.destination.name}
                    </Text>
                    <View style={s.progressTrack}>
                      <View
                        style={[
                          s.progressFill,
                          {
                            width: `${progress(flight.sent, flight.arrives, now) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={s.caption}>
                      {t("eta")} · {date(flight.arrives)}
                    </Text>
                    <Button
                      title={now >= flight.arrives ? t("open") : t("write")}
                      secondary
                      onPress={() =>
                        run(() =>
                          now >= flight.arrives
                            ? openLetter(flight)
                            : compose(
                                flight.sender.id === me.id
                                  ? flight.recipient
                                  : flight.sender,
                              ),
                        )
                      }
                    />
                  </View>
                ) : (
                  <View style={s.card}>
                    <Text style={s.section}>{t("empty")}</Text>
                    <Text style={s.body}>{pals.length ? journeyCopy.writeBody : journeyCopy.discoverBody}</Text>
                    <Button title={t("start")} onPress={() => setTab("pals")} />
                  </View>
                )}
                <Text style={s.section}>{t("incoming")}</Text>
                {letters
                  .filter((l) => l.arrives > now)
                  .map((l) => (
                    <Pressable
                      key={l.id}
                      onPress={() => setActive(l.id)}
                      style={[
                        s.flightRow,
                        active === l.id && { borderColor: c.accent },
                      ]}
                    >
                      <Bird size={38} />
                      <View style={{ flex: 1 }}>
                        <Text style={s.label}>
                          {l.sender.nickname} → {l.recipient.nickname}
                        </Text>
                        <Text style={s.caption}>
                          {l.origin.name} · {l.destination.name}
                        </Text>
                      </View>
                      <Text style={s.link}>{remaining(l)}</Text>
                    </Pressable>
                  ))}
              </>
            )}
            {tab === "pals" && (
              <>
                <Text style={[s.eyebrow, {color: c.accent}]}>DEARBIRD / PEN PALS</Text>
                <Text style={s.hero}>{t("discover")}</Text>
                <Text style={s.subtitle}>{t("discoverSub")}</Text>
                {verificationRequired && !accountStatus.verified && <Button title={accountCopy.verify} secondary onPress={() => setAccountMode("verify")} />}
                {inbound.length > 0 && (
                  <>
                    <Text style={s.section}>{t("requests")}</Text>
                    {inbound.map((r) => (
                      <View key={r.id} style={s.card}>
                        <Pressable
                          style={s.row}
                          onPress={() => setSelected(r.sender)}
                        >
                          <Avatar person={r.sender} />
                          <Text style={s.section}>{r.sender.nickname}</Text>
                        </Pressable>
                        <View style={s.row}>
                          <Button
                            title={t("accept")}
                            onPress={() =>
                              run(async () => {
                                await api(`/requests/${r.id}/respond`, "POST", {
                                  accept: true,
                                });
                                await refresh();
                              })
                            }
                          />
                          <Button
                            title={t("decline")}
                            secondary
                            onPress={() =>
                              run(async () => {
                                await api(`/requests/${r.id}/respond`, "POST", {
                                  accept: false,
                                });
                                await refresh();
                              })
                            }
                          />
                        </View>
                      </View>
                    ))}
                  </>
                )}
                {outbound.length > 0 && <>
                  <Text style={s.section}>{journeyCopy.outbound}</Text>
                  <Text style={s.body}>{journeyCopy.pendingBody}</Text>
                  {outbound.map(r => <View key={r.id} style={s.card}>
                    <Pressable onPress={() => setSelected(r.recipient)} style={s.row}>
                      <Avatar person={r.recipient} /><Text style={s.section}>{r.recipient.nickname}</Text>
                    </Pressable>
                    <Button title={journeyCopy.cancel} secondary disabled={busy} onPress={() => confirm(journeyCopy.cancel, journeyCopy.cancelBody, () => void run(async () => { await api(`/requests/${r.id}`, "DELETE"); await refresh(); }))} />
                  </View>)}
                </>}
                {pals.length > 0 && (
                  <>
                    <Text style={s.section}>{t("connected")}</Text>
                    {pals.map(personCard)}
                  </>
                )}
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: showFilters }} onPress={() => setShowFilters(!showFilters)}><Text style={s.link}>{showFilters ? introCopy[lang].hide : introCopy[lang].filter} {country || language || interest || purposeFilter ? "●" : "⌄"}</Text></Pressable>
                {showFilters && <>
                <Chips
                  values={[
                    { id: "", label: t("all") },
                    { id: "KR", label: {ko:"한국",en:"Korea",ja:"韓国"}[lang] },
                    { id: "US", label: {ko:"미국",en:"United States",ja:"アメリカ"}[lang] },
                    { id: "GB", label: {ko:"영국",en:"UK",ja:"イギリス"}[lang] },
                    { id: "JP", label: {ko:"일본",en:"Japan",ja:"日本"}[lang] },
                  ]}
                  selected={country}
                  onChange={setCountry}
                />
                <Chips
                  values={[
                    { id: "", label: t("language") },
                    { id: "ko", label: "한국어" },
                    { id: "en", label: "English" },
                    { id: "ja", label: "日本語" },
                  ]}
                  selected={language}
                  onChange={setLanguage}
                />
                <Chips values={[{id:"",label:t("all")},...(["friendship","romance","language","letters","travel"]).map((id,index)=>({id,label:extras[index+4][lang]}))]} selected={purposeFilter} onChange={setPurposeFilter} />
                <TextInput
                  accessibilityLabel={t("interest")}
                  placeholder={t("interest")}
                  value={interest}
                  onChangeText={setInterest}
                  style={s.input}
                />
                </>}
                {filtered.length ? (
                  filtered.map(personCard)
                ) : (
                  <View style={s.card}>
                    <Text style={s.section}>{country || language || interest || purposeFilter ? t("filterEmpty") : profiles.length ? journeyCopy.noCandidates : journeyCopy.noPeople}</Text>
                    <Text style={s.body}>{country || language || interest || purposeFilter ? journeyCopy.filterBody : profiles.length ? journeyCopy.noCandidatesBody : journeyCopy.noPeopleBody}</Text>
                    {country || language || interest || purposeFilter ? <Button title={journeyCopy.resetFilters} secondary onPress={() => { setCountry(""); setLanguage(""); setInterest(""); setPurposeFilter(""); }} /> : <Button title={t("editProfile")} secondary onPress={() => { setForm(me); setEditing(true); }} />}
                    {!(country || language || interest || purposeFilter) && <View style={{ gap: 10 }}>
                      <Text style={s.label}>{connectionCopy[lang].prepare}</Text>
                      {([
                        [!!me.bio.trim(), connectionCopy[lang].bio],
                        [me.interests.some(i => i.trim()), connectionCopy[lang].interestsTask],
                        [!!me.lookingFor.trim(), connectionCopy[lang].looking],
                      ] as [boolean, string][]).map(([done, label]) => <Pressable key={label} accessibilityRole="button" onPress={() => { setForm(me); setEditing(true); }}><Text style={s.body}>{done ? "✓" : "○"} {label} ↗</Text></Pressable>)}
                      <Text style={s.caption}>{me.bio.trim() && me.interests.some(i => i.trim()) && me.lookingFor.trim() ? connectionCopy[lang].ready : connectionCopy[lang].help}</Text>
                    </View>}
                    <Button title={t("refresh")} secondary disabled={busy} onPress={() => run(refresh)} />
                  </View>
                )}

              </>
            )}
            {tab === "inbox" && (
              <>
                <Text style={s.eyebrow}>YOUR LITTLE POST OFFICE</Text>
                <Text style={s.hero}>{t("mail")}</Text>
                <Text style={s.subtitle}>{t("mailSub")}</Text>
                <Chips
                  values={["incoming", "arrived", "sent", "drafts"].map(
                    (id) => ({ id, label: t(id as MessageKey) }),
                  )}
                  selected={folder}
                  onChange={setFolder}
                />
                {folder === "drafts"
                  ? drafts.map((d) => (
                      <Pressable
                        key={d.recipient}
                        style={s.card}
                        onPress={() => run(async () => {
                          const p = profiles.find(p => p.id === d.recipient) || pals.find(p => p.id === d.recipient) || await api<Profile>(`/profiles/${d.recipient}`);
                          await compose(p);
                        })}
                      >
                        <Text style={s.section}>
                          {profiles.find((p) => p.id === d.recipient)?.nickname || pals.find((p) => p.id === d.recipient)?.nickname || t("drafts")}
                        </Text>
                        <Text numberOfLines={2} style={s.body}>
                          {d.body}
                        </Text>
                      </Pressable>
                    ))
                  : mailbox.map(envelope)}
                {(folder === "drafts"
                  ? drafts.length === 0
                  : mailbox.length === 0) && (
                  <View style={[s.card, s.center]}>
                    <Bird size={68} />
                    <Text style={s.section}>{t("empty")}</Text>
                    <Button
                      title={t("start")}
                      secondary
                      onPress={() => setTab("pals")}
                    />
                  </View>
                )}
              </>
            )}
            {tab === "me" && (
              <>
                <Text style={s.eyebrow}>A LITTLE ABOUT YOU</Text>
                <Text style={s.hero}>{t("profile")}</Text>
                <View style={s.card}>
                  <View style={s.row}>
                    <Avatar person={me} size={76} />
                    <View style={{ flex: 1 }}>
                      <Text style={s.section}>{me.nickname}</Text>
                      <Text style={s.caption}>{cities[me.city]?.name}</Text>
                    </View>
                  </View>
                  <Text style={s.body}>{me.bio}</Text>
                  <View style={s.rowWrap}>
                    {me.interests.map((v) => (
                      <Text key={v} style={s.tag}>
                        {v}
                      </Text>
                    ))}
                  </View>
                  <Button
                    title={t("editProfile")}
                    secondary
                    onPress={() => {
                      setForm(me);
                      setEditing(true);
                    }}
                  />
                  <Button
                    title={t("photoProfile")}
                    secondary
                    disabled={uploading}
                    onPress={() => choosePhoto(true)}
                  />
                </View>
                <View style={s.card}>
                  <Text style={s.label}>{accountStatus.verified ? accountCopy.verified : accountCopy.verify}</Text>
                  {!accountStatus.verified && (accountStatus.emailAvailable
                    ? <Button title={accountCopy.verify} secondary onPress={() => setAccountMode("verify")} />
                    : <Text style={s.caption}>{accountCopy.unavailable}</Text>)}
                </View>
                <View style={s.card}>
                  <View style={s.row}>
                    <Text style={s.label}>{t("notifications")}</Text>
                    <Switch
                      value={notify}
                      onValueChange={(v) => run(() => enableNotifications(v))}
                    />
                  </View>
                  <Text style={s.caption}>{t("rule")}</Text>
                </View>
                <Button
                  title={
                    {
                      ko: "앱 언어 · 한국어",
                      en: "App language · English",
                      ja: "アプリの言語 · 日本語",
                    }[lang]
                  }
                  secondary
                  onPress={() => setLanguagePicker(true)}
                />
                {blocks.length > 0 && (
                  <>
                    <Text style={s.section}>{t("blocked")}</Text>
                    {blocks.map((p) => (
                      <View key={p.id} style={s.row}>
                        <Text style={s.body}>{p.nickname}</Text>
                        <Button
                          title={t("unblock")}
                          secondary
                          onPress={() =>
                            run(async () => {
                              await api(`/blocks/${p.id}`, "DELETE");
                              await refresh();
                            })
                          }
                        />
                      </View>
                    ))}
                  </>
                )}
                <Button title={introCopy[lang].replay} secondary onPress={() => setIntroOpen(true)} />
                <Button title={guide[lang].title} secondary onPress={() => setHelpPage("guide")} />
                <Button title={about[lang].title} secondary onPress={() => setHelpPage("about")} />
                <Button
                  title={t("privacy")}
                  secondary
                  onPress={() => setNotice("privacy")}
                />
                <Button
                  title={t("terms")}
                  secondary
                  onPress={() => setNotice("terms")}
                />
                <Button
                  title={t("logout")}
                  secondary
                  onPress={() => run(logout)}
                />
                <Pressable onPress={() => setDeleteMode(true)}>
                  <Text
                    style={[
                      s.link,
                      { color: c.accent, textAlign: "center", padding: 16 },
                    ]}
                  >
                    {t("delete")}
                  </Text>
                </Pressable>
                <Text style={[s.caption, { textAlign: "center" }]}>
                  {brand.app} · {brand.company} · 0.1.0
                </Text>
              </>
            )}
          </ScrollView>
          <View style={s.nav}>
            {[
              ["pals", "♧"],
              ["map", "◎"],
              ["inbox", "✉"],
              ["me", "◉"],
            ].map(([id, icon]) => (
              <Pressable
                key={id}
                accessibilityRole="tab"
                aria-selected={tab === id}
                accessibilityState={{ selected: tab === id }}
                onPress={() => setTab(id)}
                style={s.navItem}
              >
                <Text
                  style={{
                    fontSize: 24,
                    color: tab === id ? c.ink : "#A3AAA2",
                  }}
                >
                  {icon}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: tab === id ? "700" : "400",
                    color: tab === id ? c.ink : c.muted,
                  }}
                >
                  {t(id as MessageKey)}
                </Text>
                {tab === id && <View style={s.navDot} />}
              </Pressable>
            ))}
          </View>
        </>
      )}
      {accountMode && (
        <Frame title={accountMode === "reset" ? accountCopy.reset : accountCopy.verify} closeText={t("close")} onClose={closeAccount}>
          <Text style={s.body}>{accountCopy.help}</Text>
          {accountMode === "reset" && <Field label={t("email")} value={email} onChange={setEmail} email />}
          <Button title={accountCopy.request} secondary disabled={busy} onPress={() => run(async () => {
            await api(accountMode === "reset" ? "/auth/password/request" : "/auth/email/request", "POST", { email: email.trim(), lang });
            tell(accountMode === "reset" ? accountCopy.requested : accountCopy.verifyRequested);
          })} />
          <Field label={accountCopy.token} value={accountToken} onChange={setAccountToken} />
          {accountMode === "reset" && <>
            <Field label={accountCopy.password} value={newPassword} onChange={setNewPassword} secure />
            <Field label={accountCopy.confirm} value={confirmPassword} onChange={setConfirmPassword} secure />
          </>}
          <Button title={accountMode === "reset" ? accountCopy.reset : accountCopy.verify}
            disabled={busy || !accountToken.trim() || (accountMode === "reset" && newPassword.length < 12)}
            onPress={() => run(async () => {
              if (accountMode === "reset") {
                if (newPassword !== confirmPassword) { tell(accountCopy.mismatch); return; }
                await api("/auth/password/reset", "POST", { token: accountToken.trim(), password: newPassword });
                setPassword("");
                tell(accountCopy.done);
              } else {
                await api("/auth/email/verify", "POST", { token: accountToken.trim() });
                await refresh();
                tell(accountCopy.verified);
              }
              closeAccount();
            })} />
        </Frame>
      )}
      {selected && (
        <Frame
          title={t("pals")}
          closeText={t("close")}
          onClose={() => setSelected(null)}
        >
          <Avatar person={selected} size={100} />
          <Text style={s.hero}>{selected.nickname}</Text>
          <Text style={s.caption}>
            {cities[selected.city]?.name} · {selected.languages.join(" / ")}
          </Text>
          {connectionDetails(selected, true)}
          <Text style={s.body}>{selected.bio}</Text>
          <Text style={s.label}>{t("looking")}</Text>
          <Text style={s.body}>{selected.lookingFor}</Text>
          <Text style={s.label}>{{ko:"함께 나눈 편지",en:"Your letters together",ja:"二人の手紙"}[lang]}</Text>
          {letters.filter(l => l.sender.id === selected.id || l.recipient.id === selected.id).map(l => <Pressable key={l.id} style={s.card} onPress={() => run(async () => { await openLetter(l); if (l.sender.id === me?.id || l.arrives <= now) setSelected(null); })}><Text style={s.body}>{l.sender.id === me?.id ? t("sent") : t("from")} · {date(l.sent)}</Text><Text style={s.caption}>{remaining(l)}</Text></Pressable>)}

          <View style={s.rowWrap}>
            {selected.interests.map((i) => (
              <Text key={i} style={s.tag}>
                {i}
              </Text>
            ))}
          </View>
          {pals.some((p) => p.id === selected.id) ? (
            <>
              <Text style={s.caption}>{t("waiting")}</Text>
              <Button
                title={t("write")}
                onPress={() => run(() => compose(selected))}
              />
            </>
          ) : (
            <Button
              title={
                requests.some(
                  (r) =>
                    r.status === "pending" &&
                    (r.sender.id === selected.id ||
                      r.recipient.id === selected.id),
                )
                  ? t("pending")
                  : t("request")
              }
              disabled={
                busy ||
                requests.some(
                  (r) =>
                    r.status === "pending" &&
                    (r.sender.id === selected.id ||
                      r.recipient.id === selected.id),
                )
              }
              onPress={() =>
                run(async () => {
                  await api("/requests", "POST", { recipient: selected.id });
                  await refresh();
                })
              }
            />
          )}
          <Button
            title={t("report")}
            secondary
            onPress={() => {
              setReportTarget(selected);
              setSelected(null);
              setReason("");
            }}
          />
          <Button
            title={t("block")}
            secondary
            onPress={() =>
              confirm(t("block"), extras[11][lang], () =>
                run(async () => {
                  await api("/blocks", "POST", { target: selected.id });
                  setSelected(null);
                  await refresh();
                }),
              )
            }
          />
        </Frame>
      )}
      {composer && draft && (
        <Frame
          title={t("write")}
          closeText={t("close")}
          onClose={() => run(closeComposer)}
        >
          <View style={s.row}>
            <Avatar person={composer} />
            <View style={{ flex: 1 }}>
              <Text style={s.section}>
                {t("to")} {composer.nickname}
              </Text>
              <Text style={s.caption}>
                {t("eta")} · {date(now + delivery * 1000)}
              </Text>
            </View>
            <Text style={s.stamp}>
              {draft.stamp === "bird"
                ? "🕊"
                : draft.stamp === "moon"
                  ? "☾"
                  : "✿"}
            </Text>
          </View>
          <View
            style={[
              s.letterPaper,
              {
                backgroundColor:
                  draft.paper === "sky"
                    ? "#EDF3F3"
                    : draft.paper === "rose"
                      ? "#FAEEE8"
                      : "#FFFEF5",
              },
            ]}
          >
            <Pressable accessibilityRole="button" accessibilityState={{expanded: showQuestions}} style={s.questionToggle} onPress={() => setShowQuestions(v => !v)}>
              <Text style={s.caption}>{{ko: "첫 문장이 어려워요", en: "Help me find a first line", ja: "最初の一言に迷ったら"}[lang]} {showQuestions ? "−" : "+"}</Text>
            </Pressable>
            {showQuestions && <View style={{gap: 10}}>

            <Text style={s.caption}>{{ ko: "질문 하나를 골라 내 이야기부터 써보세요. 쓰던 내용 뒤에 추가돼요.", en: "Pick a question and start with your story. It is added after your text.", ja: "質問を選んで自分の話から。書いた文章の後に追加されます。" }[lang]}</Text>
            {questions[lang].map((question) => (
              <Pressable
                key={question}
                style={[s.chip, (draft.body.includes(question) || draft.body.length + question.length + 2 > 10000) && { opacity: 0.45 }]}
                accessibilityRole="button"
                disabled={draft.body.includes(question) || draft.body.length + question.length + 2 > 10000}
                onPress={() => setDraft(current => current ? { ...current, body: [current.body, question].filter(Boolean).join("\n\n") } : current)}
              >
                <Text style={s.body}>{question}</Text>
              </Pressable>
            ))}
            </View>}
            <Text style={s.letterDear}>Dear {composer.nickname},</Text>
            <TextInput
              accessibilityLabel={t("write")}
              multiline
              placeholder={extras[13][lang]}
              placeholderTextColor="#A1A89B"
              value={draft.body}
              maxLength={10000}
              onChangeText={(body) => setDraft({ ...draft, body })}
              style={s.letterInput}
            />
            <Text style={[s.caption, { textAlign: "right" }]}>
              {draft.body.length} / 10,000
            </Text>
            <Text style={s.letterDear}>With love, {me?.nickname}</Text>
          </View>
          <Text style={s.caption}>{draftState}</Text>
          <View style={s.rowWrap}>
            {draft.photos.map((id) => (
              <View key={id}>
                <Pressable onPress={() => setZoomPhoto(id)}>
                  <Image
                    source={imageSource(`/photos/${id}`)}
                    style={s.thumbnail}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    setDraft({
                      ...draft,
                      photos: draft.photos.filter((v) => v !== id),
                    })
                  }
                >
                  <Text style={s.link}>{t("remove")}</Text>
                </Pressable>
              </View>
            ))}
          </View>
          <Button
            title={
              uploading
                ? t("upload")
                : `＋ ${t("photos")} (${draft.photos.length}/3)`
            }
            secondary
            disabled={
              uploading || !!pendingPhoto || draft.photos.length >= 3 || busy
            }
            onPress={() => choosePhoto()}
          />
          {pendingPhoto && (
            <Button
              title={t("retry")}
              secondary
              onPress={() => run(() => uploadPhoto(pendingPhoto))}
            />
          )}
          {pendingPhoto && (
            <Button
              title={t("remove")}
              secondary
              disabled={uploading}
              onPress={() =>
                run(async () => {
                  await clearPending(me!.id, draft.recipient);
                  setPendingPhoto(null);
                })
              }
            />
          )}
          <Text style={s.label}>{t("paper")}</Text>
          <Chips
            values={[
              { id: "ivory", label: "Ivory" },
              { id: "sky", label: "Sky" },
              { id: "rose", label: "Rose" },
            ]}
            selected={draft.paper}
            onChange={(paper) => setDraft({ ...draft, paper })}
          />
          <Text style={s.label}>{t("stamp")}</Text>
          <Chips
            values={[
              { id: "bird", label: "🕊" },
              { id: "moon", label: "☾" },
              { id: "flower", label: "✿" },
            ]}
            selected={draft.stamp}
            onChange={(stamp) => setDraft({ ...draft, stamp })}
          />
          <Text style={s.caption}>{t("seal")}</Text>
          <Button
            title={t("send")}
            disabled={busy || uploading || !!pendingPhoto || !draft.body.trim()}
            onPress={() =>
              confirm(
                t("confirm"),
                `${composer.nickname} · ${t("eta")} ${date(now + delivery * 1000)}\n${t("seal")}`,
                () => run(sendLetter),
              )
            }
          />
        </Frame>
      )}
      {opened && (
        <Frame
          title={t("mail")}
          closeText={t("close")}
          onClose={() => setOpened(null)}
        >
          {!unsealed ? (
            <View style={{ gap: 24, paddingVertical: 40 }}>
              <Bird size={94} />
              <View style={s.envelope}>
                <Text style={s.eyebrow}>
                  {t("from")} · {opened.origin.name}
                </Text>
                <Text style={s.envelopeName}>{opened.sender.nickname}</Text>
                <Text style={s.caption}>
                  {date(opened.sent)} → {date(opened.arrives)}
                </Text>
                <Text style={[s.stamp, { alignSelf: "flex-end" }]}>✉</Text>
              </View>
              <Button title={t("open")} onPress={() => setUnsealed(true)} />
            </View>
          ) : (
            <Animated.View
              style={{
                gap: 20,
                opacity: motion,
                transform: [
                  {
                    translateY: motion.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              }}
            >
              <View
                style={[
                  s.letterPaper,
                  {
                    backgroundColor:
                      opened.paper === "sky"
                        ? "#EDF3F3"
                        : opened.paper === "rose"
                          ? "#FAEEE8"
                          : "#FFFEF5",
                  },
                ]}
              >
                <Text style={s.eyebrow}>
                  {opened.origin.name} · {date(opened.sent)}
                </Text>
                <Text style={s.letterDear}>
                  Dear {opened.recipient.nickname},
                </Text>
                <Text selectable style={s.letterBody}>
                  {opened.body}
                </Text>
                <Text style={s.letterDear}>
                  With love, {opened.sender.nickname}
                </Text>
              </View>
              {opened.photos?.map((id) => (
                <Pressable key={id} onPress={() => setZoomPhoto(id)}>
                  <Image
                    source={imageSource(`/photos/${id}`)}
                    style={{ width: "100%", height: 280, borderRadius: 6 }}
                    resizeMode="cover"
                  />
                </Pressable>
              ))}
              {opened.sender.id !== me?.id && (
                <Button
                  title={t("reply")}
                  onPress={() => run(() => compose(opened.sender))}
                />
              )}
              <Button
                title={t("report")}
                secondary
                onPress={() => {
                  setReportTarget(
                    opened.sender.id === me?.id
                      ? opened.recipient
                      : opened.sender,
                  );
                  setOpened(null);
                }}
              />
            </Animated.View>
          )}
        </Frame>
      )}
      {sent && (
        <Frame
          title={brand.app}
          closeText={t("close")}
          onClose={() => setSent(false)}
        >
          <View style={[s.center, { paddingVertical: 80 }]}>
            <Animated.View
              style={{
                transform: [
                  {
                    translateY: motion.interpolate({
                      inputRange: [0, 1],
                      outputRange: [25, -15],
                    }),
                  },
                ],
              }}
            >
              <Bird size={140} />
            </Animated.View>
            <Text style={s.hero}>{t("sentTitle")}</Text>
            <Text style={[s.body, { textAlign: "center" }]}>
              {t("sentSub")}
            </Text>
            <Button title={t("map")} onPress={() => setSent(false)} />
          </View>
        </Frame>
      )}
      {editing && (
        <Frame
          title={t("profile")}
          closeText={t("close")}
          onClose={() => setEditing(false)}
        >
          {profileFields()}
          <Button
            title={t("save")}
            disabled={busy}
            onPress={() =>
              run(async () => {
                await api("/me", "PUT", form);
                await refresh();
                setEditing(false);
              })
            }
          />
        </Frame>
      )}
      {reportTarget && (
        <Frame
          title={t("report")}
          closeText={t("close")}
          onClose={() => setReportTarget(null)}
        >
          <Text style={s.section}>{reportTarget.nickname}</Text>
          <Field
            label={t("reason")}
            value={reason}
            onChange={setReason}
            multiline
          />
          <Button
            title={t("submit")}
            disabled={busy || reason.trim().length < 5}
            onPress={() =>
              run(async () => {
                await api("/reports", "POST", {
                  target: reportTarget.id,
                  reason,
                });
                setReportTarget(null);
              })
            }
          />
        </Frame>
      )}
      {deleteMode && (
        <Frame
          title={t("delete")}
          closeText={t("close")}
          onClose={() => setDeleteMode(false)}
        >
          <Text style={s.body}>{t("deleteWarning")}</Text>
          <Field
            label={t("password")}
            value={deletePassword}
            onChange={setDeletePassword}
            secure
          />
          <Button
            title={t("deleteConfirm")}
            disabled={busy || !deletePassword}
            onPress={() =>
              run(async () => {
                await api("/me", "DELETE", { password: deletePassword });
                setDeleteMode(false);
                setDeletePassword("");
                await clearLocal();
              })
            }
          />
        </Frame>
      )}
      {notice && (
        <Frame
          title={t(notice)}
          closeText={t("close")}
          onClose={() => setNotice(null)}
        >
          <Text style={s.section}>
            {brand.app} by {brand.company}
          </Text>
          <Text style={s.body}>
            {notice === "privacy" ? extras[14][lang] : extras[15][lang]}
          </Text>
          <Text style={s.caption}>{extras[16][lang]}</Text>
        </Frame>
      )}
      {helpPage && <Frame title={(helpPage === "guide" ? guide : about)[lang].title} closeText={t("close")} onClose={() => setHelpPage(null)}>
        <Bird size={70} />
        <Text style={s.section}>{(helpPage === "guide" ? guide : about)[lang].intro}</Text>
        {(helpPage === "guide" ? guide : about)[lang].sections.map(section => <View key={section.title} style={s.card}><Text style={s.section}>{section.title}</Text><Text style={s.body}>{section.body}</Text></View>)}
      </Frame>}
      {languagePicker && (
        <Frame
          title="한국어 · English · 日本語"
          closeText={t("close")}
          onClose={() => setLanguagePicker(false)}
        >
          {(["ko", "en", "ja"] as Lang[]).map((value) => (
            <Button
              key={value}
              title={{ ko: "한국어", en: "English", ja: "日本語" }[value]}
              secondary={lang !== value}
              onPress={() => run(() => changeLanguage(value))}
            />
          ))}
        </Frame>
      )}
      {zoomPhoto && (
        <Modal transparent onRequestClose={() => setZoomPhoto(null)}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#102326F5",
              justifyContent: "center",
            }}
          >
            <Pressable
              onPress={() => setZoomPhoto(null)}
              style={{ padding: 30, alignSelf: "flex-end" }}
            >
              <Text style={{ color: "#fff" }}>{t("close")}</Text>
            </Pressable>
            <ScrollView
              maximumZoomScale={4}
              minimumZoomScale={1}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
            >
              <Image
                source={imageSource(`/photos/${zoomPhoto}`)}
                style={{ width: "100%", height: 500 }}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
