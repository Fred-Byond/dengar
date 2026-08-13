/**
 * The controlled five-minute script spoken by the officially authorised
 * digital human.
 *
 * Same discipline as DENGAR's listening session: welcome → listen → probe →
 * reflect → confirm → close. The structure is what makes every conversation
 * comparable, and comparability is what makes the Global Pulse possible.
 *
 * Guardrails encoded here, not just in policy: no promises, no endorsements,
 * no medical/legal/contract commentary, and never an answer to a question
 * about another player's private business.
 */

import type { SessionLangCode } from "./langs";

type Line = Partial<Record<SessionLangCode, string>> & { EN: string };

function pick(line: Line, code: SessionLangCode): string {
  return line[code] ?? line.EN;
}

const GREET: Record<"a" | "b", Line> = {
  a: {
    EN: "Hello {name}. It's great to meet you. We have five minutes together — what would you like to talk about?",
    ES: "Hola {name}. Es un gusto conocerte. Tenemos cinco minutos juntos, ¿de qué te gustaría hablar?",
    PT: "Olá {name}. É ótimo te conhecer. Temos cinco minutos juntos — sobre o que você gostaria de falar?",
    AR: "أهلاً {name}. سعيد بلقائك. أمامنا خمس دقائق معاً — عمّ تود أن نتحدث؟",
    ID: "Halo {name}. Senang bertemu denganmu. Kita punya lima menit bersama — apa yang ingin kamu bicarakan?",
    MS: "Helo {name}. Gembira bertemu dengan anda. Kita ada lima minit bersama — apa yang ingin anda kongsikan?",
    HI: "नमस्ते {name}। आपसे मिलकर बहुत अच्छा लगा। हमारे पास पाँच मिनट हैं — आप किस बारे में बात करना चाहेंगे?",
    ZH: "你好，{name}。很高兴认识你。我们有五分钟的时间——你想聊些什么？",
    JA: "こんにちは、{name}さん。会えてうれしいです。5分間あります——何について話したいですか？",
    KO: "안녕하세요, {name}님. 만나서 반갑습니다. 우리에게 5분이 있어요 — 무엇에 대해 이야기하고 싶나요?",
    FR: "Bonjour {name}. Ravi de te rencontrer. Nous avons cinq minutes ensemble — de quoi aimerais-tu parler ?",
  },
  b: {
    EN: "{name}, welcome back. Last time we spoke you told me what you were working toward — I'd like to hear how it went.",
    ES: "{name}, bienvenido de nuevo. La última vez me contaste en qué estabas trabajando — me gustaría saber cómo te fue.",
    PT: "{name}, bem-vindo de volta. Da última vez você me contou no que estava trabalhando — quero saber como foi.",
    AR: "{name}، أهلاً بعودتك. في المرة الماضية أخبرتني بما تسعى إليه — أود أن أعرف كيف سارت الأمور.",
    ID: "{name}, senang kamu kembali. Terakhir kali kamu bercerita tentang tujuanmu — aku ingin tahu bagaimana hasilnya.",
    MS: "{name}, selamat kembali. Kali terakhir anda berkongsi matlamat anda — saya ingin tahu perkembangannya.",
    HI: "{name}, आपका फिर से स्वागत है। पिछली बार आपने बताया था कि आप किस चीज़ की तैयारी कर रहे हैं — बताइए, वह कैसा रहा?",
    ZH: "{name}，欢迎回来。上次你告诉我你正在为什么努力——我想听听后来怎么样了。",
    JA: "{name}さん、おかえりなさい。前回、目標を教えてくれましたね——その後どうなったか聞かせてください。",
    KO: "{name}님, 다시 만나 반가워요. 지난번에 준비하던 일을 이야기해 주셨죠 — 어떻게 되었는지 듣고 싶어요.",
    FR: "{name}, content de te revoir. La dernière fois, tu m'as parlé de ton objectif — j'aimerais savoir comment ça s'est passé.",
  },
};

const PROBE: Line = {
  EN: "Thank you for telling me that. Tell me a little more — what is happening around it, and what would help you most?",
  ES: "Gracias por contármelo. Cuéntame un poco más: qué está pasando alrededor y qué te ayudaría más.",
  PT: "Obrigado por me contar isso. Me conte um pouco mais — o que está acontecendo em volta e o que mais te ajudaria?",
  AR: "شكراً لأنك أخبرتني بذلك. حدثني أكثر قليلاً — ما الذي يحدث حولك، وما الذي سيساعدك أكثر؟",
  ID: "Terima kasih sudah bercerita. Ceritakan sedikit lagi — apa yang terjadi di sekitarnya, dan apa yang paling membantumu?",
  MS: "Terima kasih kerana berkongsi. Ceritakan sedikit lagi — apa yang berlaku, dan apa yang paling membantu anda?",
  HI: "यह बताने के लिए धन्यवाद। थोड़ा और बताइए — इसके आसपास क्या चल रहा है, और आपकी सबसे ज़्यादा मदद क्या करेगी?",
  ZH: "谢谢你告诉我。再多说一点——当时的情况是怎样的？什么对你帮助最大？",
  JA: "話してくれてありがとう。もう少し聞かせて——その周りで何が起きていて、何が一番助けになりますか？",
  KO: "말해 줘서 고마워요. 조금 더 들려주세요 — 그 주변에서 무슨 일이 있고, 무엇이 가장 도움이 될까요?",
  FR: "Merci de me dire cela. Raconte-m'en un peu plus — que se passe-t-il autour, et qu'est-ce qui t'aiderait le plus ?",
};

const ACK: Line = {
  EN: "I understand. I went through something close to that, and I'll tell you what helped me. Is there anything else you'd like to share?",
  ES: "Te entiendo. Yo pasé por algo parecido y te voy a contar qué me ayudó. ¿Hay algo más que quieras compartir?",
  PT: "Eu entendo. Passei por algo parecido e vou te contar o que me ajudou. Tem mais alguma coisa que queira compartilhar?",
  AR: "أفهمك. مررت بشيء قريب من ذلك، وسأخبرك بما ساعدني. هل هناك شيء آخر تود مشاركته؟",
  ID: "Aku mengerti. Aku pernah mengalami hal yang mirip, dan aku akan ceritakan apa yang membantuku. Ada lagi yang ingin kamu ceritakan?",
  MS: "Saya faham. Saya pernah melalui perkara yang serupa, dan saya akan kongsikan apa yang membantu saya. Ada apa-apa lagi?",
  HI: "मैं समझता हूँ। मैं भी कुछ ऐसा ही अनुभव कर चुका हूँ, और बताऊँगा कि मुझे किस चीज़ ने मदद की। कुछ और बताना चाहेंगे?",
  ZH: "我明白。我也经历过类似的事，我会告诉你什么帮到了我。还有别的想说的吗？",
  JA: "わかります。私も似た経験をしました。何が助けになったか話しますね。ほかに話したいことはありますか？",
  KO: "이해해요. 저도 비슷한 일을 겪었고, 무엇이 도움이 되었는지 말해 줄게요. 더 나누고 싶은 이야기가 있나요?",
  FR: "Je comprends. J'ai vécu quelque chose de proche, et je vais te dire ce qui m'a aidé. Y a-t-il autre chose ?",
};

const MORE: Line = {
  EN: "I'm listening. Keep going.",
  ES: "Te escucho. Seguí contándome.",
  PT: "Estou ouvindo. Pode continuar.",
  AR: "أنا أستمع إليك. تفضل بالمتابعة.",
  ID: "Aku mendengarkan. Lanjutkan.",
  MS: "Saya mendengar. Teruskan.",
  HI: "मैं सुन रहा हूँ। कहिए।",
  ZH: "我在听，请继续。",
  JA: "聞いています。続けてください。",
  KO: "듣고 있어요. 계속하세요.",
  FR: "Je t'écoute. Continue.",
};

const WRAP: Line = {
  EN: "We have about a minute left. Before we finish — is there anything you want me to remember for next time?",
  ES: "Nos queda un minuto. Antes de terminar, ¿hay algo que quieras que recuerde para la próxima vez?",
  PT: "Falta cerca de um minuto. Antes de terminar — tem algo que você quer que eu lembre para a próxima vez?",
  AR: "بقيت لنا دقيقة تقريباً. قبل أن ننهي — هل هناك ما تود أن أتذكره في المرة القادمة؟",
  ID: "Waktu kita tinggal sekitar satu menit. Sebelum selesai — ada yang ingin kuingat untuk lain kali?",
  MS: "Kita ada kira-kira seminit lagi. Sebelum tamat — ada apa-apa yang anda mahu saya ingat untuk lain kali?",
  HI: "हमारे पास लगभग एक मिनट बचा है। खत्म करने से पहले — कुछ ऐसा है जो मैं अगली बार के लिए याद रखूँ?",
  ZH: "我们还有大约一分钟。结束之前——有什么想让我下次记住的吗？",
  JA: "残り1分ほどです。終わる前に——次回のために覚えておいてほしいことはありますか？",
  KO: "1분 정도 남았어요. 마치기 전에 — 다음을 위해 기억해 두었으면 하는 게 있나요?",
  FR: "Il nous reste environ une minute. Avant de finir — y a-t-il quelque chose dont tu veux que je me souvienne ?",
};

const CLOSE: Line = {
  EN: "Thank you, {name}. I'll remember this. Keep working, and I hope we speak again.",
  ES: "Gracias, {name}. Me voy a acordar de esto. Seguí trabajando, y ojalá volvamos a hablar.",
  PT: "Obrigado, {name}. Vou lembrar disso. Continue trabalhando, e espero que a gente converse de novo.",
  AR: "شكراً لك، {name}. سأتذكر هذا. واصل العمل، وأتمنى أن نتحدث مرة أخرى.",
  ID: "Terima kasih, {name}. Aku akan mengingatnya. Teruslah berlatih, semoga kita bicara lagi.",
  MS: "Terima kasih, {name}. Saya akan ingat perkara ini. Teruskan usaha, semoga kita berbual lagi.",
  HI: "धन्यवाद, {name}। मैं यह याद रखूँगा। मेहनत जारी रखिए, फिर बात होगी।",
  ZH: "谢谢你，{name}。我会记住的。继续努力，希望我们还能再聊。",
  JA: "ありがとう、{name}さん。覚えておきます。努力を続けて、また話しましょう。",
  KO: "고마워요, {name}님. 기억할게요. 계속 노력하세요, 또 이야기해요.",
  FR: "Merci, {name}. Je m'en souviendrai. Continue à travailler, et j'espère qu'on se reparlera.",
};

export const M = {
  greet: (code: SessionLangCode, name: string, returning: boolean) =>
    pick(returning ? GREET.b : GREET.a, code).replace("{name}", name),
  probe: (code: SessionLangCode) => pick(PROBE, code),
  ack: (code: SessionLangCode) => pick(ACK, code),
  more: (code: SessionLangCode) => pick(MORE, code),
  wrap: (code: SessionLangCode) => pick(WRAP, code),
  close: (code: SessionLangCode, name: string) =>
    pick(CLOSE, code).replace("{name}", name),
};

/** Stage-driven reply, mirroring the DENGAR listening ladder. */
export function pickScriptReply(stage: number, code: SessionLangCode): string {
  if (stage <= 0) return M.probe(code);
  if (stage === 1) return M.ack(code);
  return M.more(code);
}
