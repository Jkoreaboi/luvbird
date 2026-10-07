import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Lang } from "./i18n";
import { Bird, Button, s, c } from "./ui";

export const introCopy = {
  ko: { replay: "처음 사용법 다시 보기", next: "다음", back: "이전", skip: "건너뛰기", start: "시작하기", example: "사용 방법 예시 · 실제 회원이 아니에요", filter: "조건으로 찾기", hide: "검색 조건 닫기", steps: [
    ["먼저, 펜팔을 만나요", "언어와 관심사를 살펴보고, 하루가 궁금해지는 펜팔을 골라보세요.", "Hana · Tokyo", "한국어 · 日本語  /  사진 · 산책", "프로필을 눌러 더 알아보기"],
    ["작은 인사로 연결돼요", "프로필에서 펜팔 요청을 보내세요. 상대가 수락하면 서로 편지를 쓸 수 있어요.", "Hana에게 인사하기", "요청 보내기 → 상대의 수락", "수락 전에는 편지를 보낼 수 없어요"],
    ["사진에 하루를 담아요", "연결된 펜팔의 프로필에서 ‘편지 쓰기’를 누르세요. 사진과 글로 평범한 하루를 나눠요.", "Dear Hana,", "오늘 산책길에서 작은 꽃을 봤어요.\n당신의 하루는 어땠나요?", "사진을 더하고, 편지 보내기"],
    ["하루 뒤, 편지가 도착해요", "보낸 편지는 월드맵에서, 도착한 편지는 편지함에서 확인해요. 답장도 24시간을 여행해요.", "Seoul → Tokyo", "보내기 → 24시간 → 도착", "읽음 표시는 없어요 · 정확한 위치는 공개하지 않아요"],
  ] },
  en: { replay: "Replay the introduction", next: "Next", back: "Back", skip: "Skip", start: "Get started", example: "How it works · example profile", filter: "Find by preferences", hide: "Hide filters", steps: [
    ["Meet someone before you write", "Explore languages and interests. Find a pen pal whose everyday life makes you curious.", "Hana · Tokyo", "Korean · Japanese  /  Photos · Walks", "Open a profile to learn more"],
    ["Start with a little hello", "Send a pen pal request from their profile. Once they accept, you can exchange letters.", "Say hello to Hana", "Send request → They accept", "Letters unlock after acceptance"],
    ["A photo, a story, your day", "Open a connected pen pal’s profile and choose Write a letter. Share your day in photos and words.", "Dear Hana,", "I spotted a tiny flower on my walk today.\nHow was your day?", "Add a photo and send your letter"],
    ["Your day arrives in 24 hours", "Follow sent letters on the world map and open arrivals in your inbox. Replies travel for 24 hours too.", "Seoul → Tokyo", "Send → 24 hours → Arrival", "No read receipts · No precise location shared"],
  ] },
  ja: { replay: "はじめての使い方を見る", next: "次へ", back: "戻る", skip: "スキップ", start: "はじめる", example: "使い方の例 · 実際の会員ではありません", filter: "条件で探す", hide: "検索条件を閉じる", steps: [
    ["手紙の前に、人と出会う", "言語や趣味を見ながら、日常を知りたくなるペンパルを探しましょう。", "Hana · Tokyo", "韓国語 · 日本語  /  写真 · 散歩", "プロフィールを開いて詳しく見る"],
    ["小さな挨拶でつながる", "プロフィールからリクエストを送ります。相手が承認すると手紙を交換できます。", "Hanaに挨拶する", "リクエスト → 相手が承認", "承認後に手紙を送れます"],
    ["写真に今日の物語を添えて", "つながった相手のプロフィールから「手紙を書く」を選び、写真と言葉で一日を伝えましょう。", "Dear Hana,", "散歩で小さな花を見つけました。\nどんな一日でしたか？", "写真を添えて手紙を送る"],
    ["24時間後、あなたの一日が届く", "送った手紙は世界地図で、届いた手紙は受信箱で確認。返信も24時間かけて旅をします。", "Seoul → Tokyo", "送信 → 24時間 → 到着", "既読表示なし · 正確な位置は公開しません"],
  ] },
};

export default function Onboarding({ lang, onLanguage, onComplete, busy }: {
  lang: Lang; onLanguage: (lang: Lang) => void; onComplete: () => void; busy: boolean;
}) {
  const [step, setStep] = useState(0);
  const copy = introCopy[lang], page = copy.steps[step];
  return <SafeAreaView style={s.root}>
    <View style={s.top}><View style={s.row}><Bird size={32} /><Text style={s.wordmark}>DearBird</Text></View>
      <Pressable accessibilityRole="button" disabled={busy} onPress={onComplete}><Text style={s.link}>{copy.skip}</Text></Pressable>
    </View>
    <ScrollView contentContainerStyle={[s.content, { flexGrow: 1, justifyContent: "center", gap: 16 }]}>
      <View style={s.rowWrap}>{(["ko", "en", "ja"] as Lang[]).map(value => <Pressable key={value} accessibilityRole="button" accessibilityState={{ selected: value === lang }} onPress={() => onLanguage(value)} style={[s.chip, value === lang && s.chipActive]}><Text style={{ color: value === lang ? "white" : c.ink }}>{ { ko: "한국어", en: "English", ja: "日本語" }[value]}</Text></Pressable>)}</View>
      <Text style={s.eyebrow}>HOW DEARBIRD WORKS · {step + 1} / 4</Text>
      <Text accessibilityRole="header" style={s.hero}>{page[0]}</Text>
      <Text style={s.body}>{page[1]}</Text>
      <View style={[s.card, { backgroundColor: step === 2 ? "#FFFCF1" : c.sky, padding: 22, gap: 16 }]}>
        <View style={s.row}><Text style={[s.stamp, { borderWidth: 0 }]}>{["✿", "♡", "✉", "24h"][step]}</Text><Bird size={54} /></View>
        <Text style={step === 2 ? s.letterDear : s.section}>{page[2]}</Text>
        <Text style={s.body}>{page[3]}</Text>
        <View style={{ height: 1, backgroundColor: "#C5D3CF" }} />
        <Text style={s.label}>{page[4]}</Text>
        <Text style={s.caption}>{copy.example}</Text>
      </View>
      <View style={[s.rowWrap, { justifyContent: "center" }]}>{copy.steps.map((_, i) => <View key={i} style={{ width: i === step ? 28 : 8, height: 6, borderRadius: 6, backgroundColor: i === step ? c.accent : c.line }} />)}</View>
      <Button title={step === 3 ? copy.start : copy.next} disabled={busy} onPress={() => step === 3 ? onComplete() : setStep(step + 1)} />
      {step > 0 && <Button title={copy.back} secondary onPress={() => setStep(step - 1)} />}
    </ScrollView>
  </SafeAreaView>;
}
