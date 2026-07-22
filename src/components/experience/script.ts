import type { SessionLangCode } from "./langs";

export type MinisterLines = {
  greet: Record<SessionLangCode, (n: string) => string>;
  probe: Record<SessionLangCode, () => string>;
  ack: Record<SessionLangCode, () => string>;
  more: Record<SessionLangCode, () => string>;
  wrap: Record<SessionLangCode, () => string>;
  close: Record<SessionLangCode, (n: string) => string>;
};

export const M: MinisterLines = {
  greet: {
    EN: (n) =>
      `Welcome, ${n}. This session is for you to tell me what you think of the government — what we can improve, and your suggestions. Please, share with me.`,
    MS: (n) =>
      `Selamat datang, ${n}. Sesi ini untuk anda berkongsi pandangan tentang kerajaan — apa yang boleh kami perbaiki, dan cadangan anda. Silakan, kongsikan dengan saya.`,
    ZH: (n) =>
      `欢迎您，${n}。这次会面是想听听您对政府的看法——我们可以改进什么，以及您的建议。请与我分享。`,
    TA: (n) =>
      `வணக்கம், ${n}. இந்த அமர்வு, அரசாங்கத்தைப் பற்றிய உங்கள் கருத்துகளையும் ஆலோசனைகளையும் பகிர்வதற்காக. தயவுசெய்து பகிருங்கள்.`,
    AR: (n) =>
      `أهلاً بك، ${n}. هذه الجلسة لتخبرني برأيك في الحكومة — ما الذي يمكننا تحسينه، وما هي اقتراحاتك. تفضل، شاركني.`,
  },
  probe: {
    EN: () =>
      `Thank you. Which area does this affect, and what would you like to see done?`,
    MS: () =>
      `Terima kasih. Kawasan mana yang terlibat, dan apakah tindakan yang anda harapkan?`,
    ZH: () => `谢谢您。这主要影响哪个地区？您希望看到什么样的改进？`,
    TA: () =>
      `நன்றி. இது எந்தப் பகுதியை பாதிக்கிறது? என்ன நடவடிக்கை வேண்டும் என விரும்புகிறீர்கள்?`,
    AR: () =>
      `شكراً لك. أي منطقة يؤثر عليها هذا الأمر، وما الذي تود أن يتم عمله؟`,
  },
  ack: {
    EN: () =>
      `I hear you. Let me note this down for my team. Is there anything else you would like me to record?`,
    MS: () =>
      `Saya faham. Saya akan catatkan untuk pasukan saya. Ada apa-apa lagi yang ingin anda sampaikan?`,
    ZH: () => `我明白了。我会记录下来交给我的团队。您还有其他想反映的吗？`,
    TA: () =>
      `புரிகிறது. இதை என் குழுவிற்காக பதிவு செய்கிறேன். வேறு ஏதேனும் தெரிவிக்க விரும்புகிறீர்களா?`,
    AR: () =>
      `فهمت. سأدوّن هذا لفريقي. هل هناك شيء آخر تود أن أسجله؟`,
  },
  more: {
    EN: () => `Noted. Please continue.`,
    MS: () => `Baik, saya catat. Sila teruskan.`,
    ZH: () => `好的，我记下了。请继续。`,
    TA: () => `சரி, பதிவு செய்தேன். தொடருங்கள்.`,
    AR: () => `تم التدوين. تفضل بالمتابعة.`,
  },
  wrap: {
    EN: () =>
      `Before we finish — is there anything else you'd like me to note?`,
    MS: () =>
      `Sebelum kita akhiri — ada perkara lain yang ingin anda kongsikan?`,
    ZH: () => `在结束之前——还有什么想让我记录的吗？`,
    TA: () =>
      `முடிப்பதற்கு முன் — வேறு ஏதேனும் குறிப்பிட விரும்புகிறீர்களா?`,
    AR: () => `قبل أن ننهي — هل هناك أي شيء آخر تود أن أدوّنه؟`,
  },
  close: {
    EN: (n) =>
      `Thank you, ${n}, for contributing your views to make our government better. I take note of what you have raised, and my team will review it. Please keep in touch.`,
    MS: (n) =>
      `Terima kasih, ${n}, atas sumbangan pandangan anda untuk menjadikan kerajaan kita lebih baik. Saya ambil maklum perkara yang anda bangkitkan, dan pasukan saya akan menelitinya. Kekal berhubung.`,
    ZH: (n) =>
      `谢谢您，${n}，为建设更好的政府贡献您的意见。我已记下您提出的内容，我的团队会认真跟进。请保持联系。`,
    TA: (n) =>
      `நன்றி, ${n}. நமது அரசாங்கத்தை மேம்படுத்த உங்கள் கருத்துகளைப் பகிர்ந்தமைக்கு நன்றி. என் குழு அவற்றை ஆய்வு செய்யும். தொடர்பில் இருங்கள்.`,
    AR: (n) =>
      `شكراً لك، ${n}، على مساهمتك بآرائك لجعل حكومتنا أفضل. لقد أخذت علماً بما طرحته، وسيقوم فريقي بمراجعته. ابقَ على تواصل.`,
  },
};

export function pickScriptReply(
  stage: number,
  code: SessionLangCode
): string {
  if (stage <= 0) return M.probe[code]();
  if (stage === 1) return M.ack[code]();
  return M.more[code]();
}
