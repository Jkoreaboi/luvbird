// Exact user-entered overlap only; no inferred personality or compatibility score.
type Person = { languages: string[]; interests: string[]; purpose?: string; bio?: string; lookingFor?: string };
const normalized = (s: string) => s.trim().normalize('NFKC').toLocaleLowerCase();
export function commonGround(me: Person, other: Person) {
  const overlap = (a: string[], b: string[]) => [...new Set(b.map(v => v.trim()).filter(v => v && a.some(x => normalized(x) === normalized(v))))];
  return { languages: overlap(me.languages, other.languages), interests: overlap(me.interests, other.interests), purpose: !!me.purpose && me.purpose === other.purpose };
}
export const connectionCopy = {
  ko: { title: '이야기를 시작할 공통점', languages: '함께 쓰는 언어', interests: '공통 관심사', purpose: '같은 교류 목적', none: '공통점이 달라도 괜찮아요. 자기소개를 읽고 대화를 시작해보세요.', prepare: '기다리는 동안, 나를 소개해요', bio: '내 일상을 소개하는 문장 쓰기', interestsTask: '좋아하는 관심사 추가하기', looking: '어떤 편지 친구를 찾는지 적기', ready: '소개가 준비됐어요. 새로운 펜팔이 들어오면 목록에서 찾아보세요.', help: '예: 주말에 산책하며 사진 찍는 걸 좋아해요. 서로의 평범한 하루를 나누고 싶어요.' },
  en: { title: 'Something to talk about', languages: 'Shared languages', interests: 'Shared interests', purpose: 'Same connection goal', none: 'Different interests are welcome too. Read their story to start a conversation.', prepare: 'While you wait, tell your story', bio: 'Write a little about your day', interestsTask: 'Add your interests', looking: 'Describe the pen pal you hope to meet', ready: 'Your introduction is ready. Check the list for new pen pals.', help: 'For example: I enjoy weekend walks and photography. I would love to share the little things in our days.' },
  ja: { title: '会話のきっかけになる共通点', languages: '共通の言語', interests: '共通の興味', purpose: '同じ交流の目的', none: '興味が違っても大丈夫。自己紹介を読んで会話を始めましょう。', prepare: '待つ間に、自分のことを紹介', bio: '日常を紹介する文章を書く', interestsTask: '好きなことを追加する', looking: 'どんな文通相手を探しているか書く', ready: '自己紹介の準備ができました。新しい仲間を一覧で探しましょう。', help: '例：週末の散歩と写真が好きです。お互いの日常の小さなことを話したいです。' },
};
