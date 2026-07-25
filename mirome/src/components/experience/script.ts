import type { SessionLangCode } from "./langs";

/**
 * What the digital human says. Structured interviewing means every participant
 * hears the same sequence, which is what makes the responses comparable (§1).
 *
 * The lines are deliberately non-evaluative: the interviewer never praises,
 * advises or judges the participant — see TEAM_DIAGNOSIS_PROFILE.guardrails.
 */
export type InterviewerLines = {
  greet: Record<SessionLangCode, (n: string) => string>;
  experience: Record<SessionLangCode, () => string>;
  probe: Record<SessionLangCode, () => string>;
  ack: Record<SessionLangCode, () => string>;
  scenarioIntro: Record<SessionLangCode, (s: string) => string>;
  scenarioProbe: Record<SessionLangCode, () => string>;
  wrap: Record<SessionLangCode, () => string>;
  close: Record<SessionLangCode, (n: string) => string>;
};

export const M: InterviewerLines = {
  greet: {
    EN: (n) =>
      `Thank you for making the time, ${n}. This is a team diagnosis, not an assessment of you. Nothing you say is reported against your name, and your manager sees team-level results only. Let us start with how the work actually flows in your team.`,
    MS: (n) =>
      `Terima kasih kerana meluangkan masa, ${n}. Ini diagnosis pasukan, bukan penilaian terhadap anda. Tiada apa yang anda katakan dilaporkan atas nama anda, dan pengurus anda hanya melihat keputusan peringkat pasukan. Mari kita mulakan dengan bagaimana kerja sebenarnya mengalir dalam pasukan anda.`,
    ZH: (n) =>
      `谢谢您抽出时间，${n}。这是团队诊断，不是对您个人的评估。您所说的一切都不会具名报告，您的主管只会看到团队层面的结果。我们先从您团队的工作实际如何流转开始。`,
    TA: (n) =>
      `நேரம் ஒதுக்கியதற்கு நன்றி, ${n}. இது குழு பரிசோதனை; உங்களைப் பற்றிய மதிப்பீடு அல்ல. நீங்கள் சொல்வது உங்கள் பெயருடன் பதிவு செய்யப்படாது; உங்கள் மேலாளர் குழு அளவிலான முடிவுகளை மட்டுமே பார்ப்பார். உங்கள் குழுவில் வேலை உண்மையில் எப்படி நகர்கிறது என்பதிலிருந்து தொடங்குவோம்.`,
  },
  experience: {
    EN: () =>
      `Tell me about a recent piece of work that did not go smoothly. What happened, and where did it get stuck?`,
    MS: () =>
      `Ceritakan tentang satu kerja baru-baru ini yang tidak berjalan lancar. Apa yang berlaku, dan di mana ia tersekat?`,
    ZH: () => `请说说最近一件不太顺利的工作。发生了什么？卡在哪里？`,
    TA: () =>
      `சமீபத்தில் சுமூகமாக நடக்காத ஒரு வேலையைப் பற்றி சொல்லுங்கள். என்ன நடந்தது, எங்கே தடைபட்டது?`,
  },
  probe: {
    EN: () =>
      `Who was supposed to decide, and how did you find out? Keep it to what happened, not who is at fault.`,
    MS: () =>
      `Siapa sepatutnya membuat keputusan, dan bagaimana anda mengetahuinya? Fokus pada apa yang berlaku, bukan siapa yang bersalah.`,
    ZH: () => `本来应该由谁决定？您是怎么知道的？请说事情经过，不必指出是谁的错。`,
    TA: () =>
      `யார் முடிவு எடுக்க வேண்டியிருந்தது, நீங்கள் எப்படி அறிந்தீர்கள்? யார் தவறு என்பதை விட என்ன நடந்தது என்பதைச் சொல்லுங்கள்.`,
  },
  ack: {
    EN: () =>
      `Noted, thank you. Is there anything about how the team works together that you would add?`,
    MS: () =>
      `Saya catatkan, terima kasih. Ada apa-apa lagi tentang cara pasukan bekerjasama yang ingin anda tambah?`,
    ZH: () => `我记下了，谢谢。关于团队如何协作，您还有什么要补充的吗？`,
    TA: () =>
      `பதிவு செய்தேன், நன்றி. குழு எப்படி இணைந்து செயல்படுகிறது என்பதில் சேர்க்க ஏதேனும் உள்ளதா?`,
  },
  scenarioIntro: {
    EN: (s) =>
      `Now a short workplace situation. There is no right answer — tell me what you would actually do. ${s}`,
    MS: (s) =>
      `Sekarang satu situasi tempat kerja yang ringkas. Tiada jawapan yang betul — beritahu apa yang anda benar-benar akan lakukan. ${s}`,
    ZH: (s) => `接下来是一个简短的职场情境。没有标准答案——请说说您实际会怎么做。${s}`,
    TA: (s) =>
      `இப்போது ஒரு சிறிய பணியிட சூழல். சரியான பதில் என்று ஒன்றில்லை — நீங்கள் உண்மையில் என்ன செய்வீர்கள் என்பதைச் சொல்லுங்கள். ${s}`,
  },
  scenarioProbe: {
    EN: () => `And if it happened again the following week — what changes?`,
    MS: () => `Dan jika ia berlaku sekali lagi minggu berikutnya — apa yang berubah?`,
    ZH: () => `如果下周又发生一次——您会有什么不同的做法？`,
    TA: () => `அடுத்த வாரம் மீண்டும் நடந்தால் — என்ன மாறும்?`,
  },
  wrap: {
    EN: () =>
      `We are close to time. Before we finish — one thing you would change about how this team works?`,
    MS: () =>
      `Masa kita hampir tamat. Sebelum kita akhiri — satu perkara yang anda ingin ubah tentang cara pasukan ini bekerja?`,
    ZH: () => `时间快到了。结束之前——您最想改变这个团队的哪一件事？`,
    TA: () =>
      `நேரம் முடியப் போகிறது. முடிப்பதற்கு முன் — இந்தக் குழுவின் செயல்பாட்டில் நீங்கள் மாற்ற விரும்பும் ஒரு விஷயம்?`,
  },
  close: {
    EN: (n) =>
      `Thank you, ${n}. I will show you a short summary of what I recorded so you can correct anything that is wrong. Your responses go into the team-level results only.`,
    MS: (n) =>
      `Terima kasih, ${n}. Saya akan tunjukkan ringkasan pendek apa yang saya catatkan supaya anda boleh betulkan jika ada yang salah. Jawapan anda hanya masuk ke keputusan peringkat pasukan.`,
    ZH: (n) =>
      `谢谢您，${n}。我会给您看一份简短的记录摘要，您可以更正其中不准确的地方。您的回答只会进入团队层面的结果。`,
    TA: (n) =>
      `நன்றி, ${n}. நான் பதிவு செய்ததின் சுருக்கத்தைக் காட்டுவேன்; தவறு இருந்தால் திருத்தலாம். உங்கள் பதில்கள் குழு அளவிலான முடிவுகளுக்கு மட்டுமே செல்லும்.`,
  },
};

/**
 * The structured turn ladder. Stage 0–1 are the open experience questions,
 * 2–3 the scenario, 4+ the wrap — the same order for every participant.
 */
export function pickScriptReply(stage: number, code: SessionLangCode): string {
  if (stage <= 0) return M.probe[code]();
  if (stage === 1) return M.ack[code]();
  if (stage === 2) return M.scenarioProbe[code]();
  return M.ack[code]();
}
