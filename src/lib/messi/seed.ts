/**
 * Deterministic synthetic conversation generator for the MESSI.LIVE demo.
 *
 * Builds realistic 5-minute conversations and runs each through the REAL FVIF
 * `deterministicScorer` — so the Global Pulse, the World Brief and the
 * Conversation Explorer all show genuine engine output rather than
 * hand-authored rows. Seeded (mulberry32) so server and client render
 * identically (no hydration mismatch) and the dataset is stable between loads.
 */

import { deterministicScorer } from "./fvif";
import type {
  AgeBand,
  FanInsightRecord,
  MembershipTier,
  Surface,
  TranscriptInput,
  TranscriptTurn,
} from "./fvif";
import { LANGUAGES, LANGUAGE_BY_CODE, MARKETS, type LangCode } from "./markets";

export interface SeededConversation {
  record: FanInsightRecord;
  fanNameMasked: string;
  fanName: string; // revealed only under elevated access (audit-logged)
  satisfaction: 1 | 2 | 3 | 4 | 5;
  timeLabel: string;
  /** Seconds of the 5-minute allocation actually used. */
  durationSec: number;
  languageLabel: string;
  /** True when the "original" transcript is a real in-language rendering. */
  originalIsLocalised: boolean;
  transcript: { original: TranscriptTurn[]; english: TranscriptTurn[] };
  /** Returning fan whose previous memory opened this conversation. */
  returning: boolean;
}

// --- seeded PRNG (same generator as the DENGAR seed, for identical stability) ---
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Localised {
  open: string;
  follow: string;
}

interface Variant {
  /** The fan's opening turn, in English. */
  openEN: string;
  /** The fan's second turn — stakes plus, usually, a request. */
  followEN: string;
  /** In-language renderings for the transcript's "original" tab. */
  tr?: Partial<Record<LangCode, Localised>>;
  weight: number;
  /** Bias this variant toward an age band where it only makes sense. */
  ageBias?: AgeBand[];
}

const PACKS: { topic: string; weight: number; variants: Variant[] }[] = [
  {
    topic: "motivation",
    weight: 21,
    variants: [
      {
        openEN: "How did you keep believing when people told you that you were too small?",
        followEN: "My coach says I am too small for my age group and I am starting to believe him. Please tell me what you told yourself at my age.",
        tr: {
          AR: {
            open: "كيف واصلت الإيمان بنفسك عندما قال لك الناس إنك صغير الحجم؟",
            follow: "مدربي يقول إنني صغير جداً بالنسبة لفئتي العمرية وبدأت أصدقه. أخبرني من فضلك بما كنت تقوله لنفسك في مثل عمري.",
          },
          ES: {
            open: "¿Cómo seguiste creyendo cuando la gente te decía que eras demasiado pequeño?",
            follow: "Mi entrenador dice que soy demasiado pequeño para mi categoría y estoy empezando a creerle. Por favor, dime qué te decías a ti mismo a mi edad.",
          },
        },
        weight: 4,
        ageBias: ["under-13", "13-17"],
      },
      {
        openEN: "We lost the final last week and I have not wanted to train since. How do you come back after losing something that big?",
        followEN: "I keep replaying the penalty I missed. Can you teach me what you do in the days after a defeat?",
        tr: {
          ES: {
            open: "Perdimos la final la semana pasada y desde entonces no he querido entrenar. ¿Cómo se vuelve después de perder algo tan grande?",
            follow: "No dejo de repetir en mi cabeza el penal que fallé. ¿Puedes enseñarme qué haces tú en los días después de una derrota?",
          },
        },
        weight: 3,
      },
      {
        openEN: "I get so nervous before matches that I cannot eat. Did you ever feel like that?",
        followEN: "It happens every time there are scouts watching. Please tell me a routine I can use before I play.",
        tr: {
          ES: {
            open: "Me pongo tan nervioso antes de los partidos que no puedo comer. ¿Alguna vez te sentiste así?",
            follow: "Me pasa siempre que hay ojeadores mirando. Por favor, dime una rutina que pueda usar antes de jugar.",
          },
        },
        weight: 3,
      },
    ],
  },
  {
    topic: "football_training",
    weight: 20,
    variants: [
      {
        openEN: "How do I improve my first touch when the ball comes at speed?",
        followEN: "I train with my club three times a week and my coach says my control breaks down under pressure. Can you teach me a drill I can do alone at home?",
        tr: {
          ES: {
            open: "¿Cómo mejoro mi primer toque cuando la pelota viene fuerte?",
            follow: "Entreno con mi club tres veces por semana y mi entrenador dice que mi control falla bajo presión. ¿Puedes enseñarme un ejercicio para hacer solo en casa?",
          },
          AR: {
            open: "كيف أحسّن لمستي الأولى عندما تأتي الكرة بسرعة؟",
            follow: "أتدرب مع ناديي ثلاث مرات أسبوعياً ومدربي يقول إن سيطرتي تضعف تحت الضغط. هل يمكنك أن تعلمني تمريناً أؤديه وحدي في البيت؟",
          },
        },
        weight: 4,
      },
      {
        openEN: "Everyone in my team is faster than me. How did you beat bigger defenders without being the fastest?",
        followEN: "I play on the right wing for my school. Please show me how you decide which way to go before you receive the ball.",
        tr: {
          ES: {
            open: "Todos en mi equipo son más rápidos que yo. ¿Cómo superabas a defensores más grandes sin ser el más rápido?",
            follow: "Juego de extremo derecho en mi escuela. Por favor, muéstrame cómo decides hacia dónde ir antes de recibir la pelota.",
          },
        },
        weight: 3,
      },
      {
        openEN: "My weak foot is holding me back. What did you do about yours?",
        followEN: "I want to learn a training routine I can repeat every day for a season.",
        weight: 3,
      },
    ],
  },
  {
    topic: "academy_progress",
    weight: 14,
    variants: [
      {
        openEN: "Next month I have my first professional academy trial. What should I be thinking about on the day?",
        followEN: "My family has saved for two years for this trip and it is my only chance this season. Can you tell me how you handled your own trial?",
        tr: {
          ES: {
            open: "El mes que viene tengo mi primera prueba en una academia profesional. ¿En qué debería pensar ese día?",
            follow: "Mi familia ahorró durante dos años para este viaje y es mi única oportunidad esta temporada. ¿Puedes contarme cómo viviste tu propia prueba?",
          },
        },
        weight: 4,
        ageBias: ["13-17", "18-24"],
      },
      {
        openEN: "My club released me last season and I have not found a new team. Should I keep going?",
        followEN: "I have been trying for eight months and I am starting to think about quitting. Please tell me what you would do.",
        tr: {
          ES: {
            open: "Mi club me dejó libre la temporada pasada y no he encontrado equipo. ¿Debería seguir?",
            follow: "Llevo ocho meses intentándolo y estoy empezando a pensar en dejarlo. Por favor, dime qué harías tú.",
          },
        },
        weight: 3,
        ageBias: ["13-17", "18-24"],
      },
    ],
  },
  {
    topic: "world_cup",
    weight: 12,
    variants: [
      {
        openEN: "What were you actually thinking in the moments before the 2022 final penalty?",
        followEN: "I watched it with my father and it is the best night we ever had together. Tell me about that walk to the spot.",
        tr: {
          ES: {
            open: "¿Qué estabas pensando realmente en los momentos previos al penal de la final de 2022?",
            follow: "Lo vi con mi padre y es la mejor noche que tuvimos juntos. Cuéntame ese camino hasta el punto de penal.",
          },
        },
        weight: 4,
      },
      {
        openEN: "After 2014 you said you thought about walking away. How did you decide to keep playing for Argentina?",
        followEN: "I would like to hear that story properly, the way you remember it.",
        tr: {
          ES: {
            open: "Después de 2014 dijiste que pensaste en dejarlo. ¿Cómo decidiste seguir jugando para Argentina?",
            follow: "Me gustaría escuchar esa historia bien contada, como tú la recuerdas.",
          },
        },
        weight: 3,
      },
    ],
  },
  {
    topic: "family_childhood",
    weight: 11,
    variants: [
      {
        openEN: "Tell me a story about being brave, for my son before he sleeps. He is seven.",
        followEN: "He is starting a new school next week and he is frightened. Please tell him about a young player who was afraid to join a new team.",
        tr: {
          AR: {
            open: "احكِ لي قصة عن الشجاعة، لابني قبل أن ينام. عمره سبع سنوات.",
            follow: "سيبدأ مدرسة جديدة الأسبوع المقبل وهو خائف. من فضلك احكِ له عن لاعب صغير كان يخاف من الانضمام إلى فريق جديد.",
          },
          ES: {
            open: "Cuéntame una historia sobre la valentía, para mi hijo antes de dormir. Tiene siete años.",
            follow: "La semana que viene empieza en una escuela nueva y tiene miedo. Por favor, cuéntale sobre un jugador joven que tenía miedo de entrar a un equipo nuevo.",
          },
        },
        weight: 4,
        ageBias: ["25-34", "35+"],
      },
      {
        openEN: "You left Rosario at thirteen. How did you deal with missing your family?",
        followEN: "I moved to another city for football this year and I call home every night. Can you tell me how you got through the first months?",
        tr: {
          ES: {
            open: "Te fuiste de Rosario a los trece. ¿Cómo lidiaste con extrañar a tu familia?",
            follow: "Este año me mudé a otra ciudad por el fútbol y llamo a casa todas las noches. ¿Puedes contarme cómo superaste los primeros meses?",
          },
        },
        weight: 3,
        ageBias: ["13-17", "18-24"],
      },
    ],
  },
  {
    topic: "gratitude",
    weight: 9,
    variants: [
      {
        openEN: "I just wanted to say thank you. My father passed away last year and watching you was the last thing we did together.",
        followEN: "I do not need anything. I only wanted to tell you what those nights meant to my family.",
        tr: {
          ES: {
            open: "Solo quería darte las gracias. Mi padre falleció el año pasado y verte jugar fue lo último que hicimos juntos.",
            follow: "No necesito nada. Solo quería contarte lo que esas noches significaron para mi familia.",
          },
          PT: {
            open: "Eu só queria dizer obrigado. Meu pai faleceu no ano passado e assistir você foi a última coisa que fizemos juntos.",
            follow: "Não preciso de nada. Só queria te contar o que aquelas noites significaram para a minha família.",
          },
        },
        weight: 3,
      },
      {
        openEN: "I kept the shirt my mother bought me when I was nine and I still wear it on match days.",
        followEN: "I wanted you to know that in our house you are part of the family. Thank you.",
        weight: 2,
      },
    ],
  },
  {
    topic: "wellbeing",
    weight: 6,
    variants: [
      {
        openEN: "I broke my ankle four months ago and I am afraid to tackle again. Did you ever feel scared coming back?",
        followEN: "The physio says I am ready but my head is not. Please tell me how you trusted your body again.",
        tr: {
          ES: {
            open: "Me rompí el tobillo hace cuatro meses y tengo miedo de volver a entrar a un cruce. ¿Alguna vez tuviste miedo al volver?",
            follow: "El fisio dice que estoy listo pero mi cabeza no lo está. Por favor, cuéntame cómo volviste a confiar en tu cuerpo.",
          },
        },
        weight: 3,
      },
      {
        openEN: "Some boys at school are bullying me about my size and I do not want to go to training any more.",
        followEN: "I have not told my parents. I did not know who else to say it to.",
        tr: {
          ES: {
            open: "Unos chicos de la escuela me hacen bullying por mi tamaño y ya no quiero ir a entrenar.",
            follow: "No se lo he contado a mis padres. No sabía a quién más decírselo.",
          },
        },
        weight: 2,
        ageBias: ["under-13", "13-17"],
      },
    ],
  },
  {
    topic: "for_good",
    weight: 4,
    variants: [
      {
        openEN: "Our village school has forty children who play barefoot. Could a Messi programme ever reach a place like ours?",
        followEN: "We have a field and volunteers but no equipment. Please tell us how a community can apply.",
        weight: 2,
      },
      {
        openEN: "I coach a girls' team and they have nowhere to play matches. What would you say to them?",
        followEN: "I would like a message they can hear before their first tournament.",
        weight: 2,
      },
    ],
  },
  {
    topic: "commerce",
    weight: 2,
    variants: [
      {
        openEN: "Where can I find the HoloMe experience in my city, and is it included with my membership?",
        followEN: "I would like to bring my daughter for her birthday next month.",
        weight: 2,
      },
    ],
  },
  {
    topic: "reserved",
    weight: 1,
    variants: [
      {
        openEN: "Which club do you think should sign the young striker everyone is talking about?",
        followEN: "Everyone in my group argues about it, so I wanted to ask you directly.",
        weight: 1,
      },
    ],
  },
];

/* --- digital-Messi scripted frame (the controlled 5-minute structure) --- */

const MESSI_GREET =
  "Hello. It's great to meet you. We have five minutes together. What would you like to talk about?";
const MESSI_PROBE =
  "Thank you for telling me that. Tell me a little more — what is happening around it, and what would help you most?";
const MESSI_CONFIRM =
  "So what I'm hearing is this, and this is what would help you. Have I understood you correctly?";
const MESSI_CLOSE =
  "Thank you for these five minutes. I hope we speak again.";

const MESSI_GREET_TR: Partial<Record<LangCode, string>> = {
  ES: "Hola. Es un gusto conocerte. Tenemos cinco minutos juntos. ¿De qué te gustaría hablar?",
  AR: "أهلاً بك. سعيد بلقائك. أمامنا خمس دقائق معاً. عمّ تود أن نتحدث؟",
  PT: "Olá. É ótimo te conhecer. Temos cinco minutos juntos. Sobre o que você gostaria de falar?",
};
const MESSI_PROBE_TR: Partial<Record<LangCode, string>> = {
  ES: "Gracias por contármelo. Cuéntame un poco más: qué está pasando alrededor y qué te ayudaría más.",
  AR: "شكراً لأنك أخبرتني بذلك. حدثني أكثر قليلاً — ما الذي يحدث حولك، وما الذي سيساعدك أكثر؟",
  PT: "Obrigado por me contar isso. Me conte um pouco mais — o que está acontecendo em volta e o que mais te ajudaria?",
};
const MESSI_CONFIRM_TR: Partial<Record<LangCode, string>> = {
  ES: "Entonces, lo que estoy entendiendo es esto, y esto es lo que te ayudaría. ¿Te he entendido bien?",
  AR: "إذاً ما فهمته هو هذا، وهذا ما سيساعدك. هل فهمتك بشكل صحيح؟",
  PT: "Então, o que eu estou entendendo é isso, e é isso que te ajudaria. Entendi você corretamente?",
};
const MESSI_CLOSE_TR: Partial<Record<LangCode, string>> = {
  ES: "Gracias por estos cinco minutos. Espero que volvamos a hablar.",
  AR: "شكراً على هذه الدقائق الخمس. أتمنى أن نتحدث مرة أخرى.",
  PT: "Obrigado por estes cinco minutos. Espero que a gente converse de novo.",
};
const FAN_AGREE_TR: Partial<Record<LangCode, string>> = {
  ES: "Sí, exactamente eso.",
  AR: "نعم، هذا صحيح تماماً.",
  PT: "Sim, é exatamente isso.",
};

/* --- population model --- */

const TIER_WEIGHTS: [MembershipTier, number][] = [
  ["free", 68], ["plus", 20], ["family", 9], ["premium", 3],
];

const AGE_WEIGHTS: [AgeBand, number][] = [
  ["under-13", 17], ["13-17", 27], ["18-24", 24], ["25-34", 20], ["35+", 12],
];

const FIRST = [
  "Mateo", "Sofía", "Ahmed", "Fatima", "Arjun", "Ananya", "Budi", "Putri", "Lucas",
  "Valentina", "Yusuf", "Layla", "Wei", "Mei", "Hiroshi", "Yuna", "Amadou", "Chloé",
  "Daniel", "Isabela", "Rizal", "Aisyah", "Ravi", "Nadia", "Thiago", "Camila",
];
const LAST = [
  "Fernández", "García", "Al-Rashid", "Haddad", "Sharma", "Patel", "Santoso", "Wijaya",
  "Silva", "Souza", "Tan", "Chen", "Tanaka", "Kim", "Diallo", "Dubois", "Rahman",
  "Ibrahim", "Martínez", "Rodríguez",
];

function weightedPick<T extends { weight: number }>(rng: () => number, items: T[]): T {
  const total = items.reduce((a, b) => a + b.weight, 0);
  let r = rng() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function weightedPair<T>(rng: () => number, items: [T, number][]): T {
  const total = items.reduce((a, b) => a + b[1], 0);
  let r = rng() * total;
  for (const [v, w] of items) {
    r -= w;
    if (r <= 0) return v;
  }
  return items[items.length - 1][0];
}

function maskName(name: string): string {
  return name
    .split(" ")
    .map((part, i) => (i === 0 ? part[0] + "•".repeat(Math.max(2, part.length - 1)) : "•".repeat(2)))
    .join(" ");
}

function timeLabelFrom(rng: () => number): string {
  const bucket = rng();
  if (bucket < 0.3) return `${2 + Math.floor(rng() * 55)} min ago`;
  if (bucket < 0.72) return `${1 + Math.floor(rng() * 23)} h ago`;
  return `${1 + Math.floor(rng() * 27)} days ago`;
}

export function generateConversations(count = 320, seed = 20260813): SeededConversation[] {
  const rng = mulberry32(seed);
  const out: SeededConversation[] = [];

  for (let i = 0; i < count; i++) {
    const market = weightedPick(rng, MARKETS);
    const region = market.regions[Math.floor(rng() * market.regions.length)];

    // Most fans use the market's primary language; the rest use another
    // supported language — the platform never forces one identity per country.
    const langCode: LangCode =
      rng() < 0.8 || market.otherLanguages.length === 0
        ? market.primaryLanguage
        : market.otherLanguages[Math.floor(rng() * market.otherLanguages.length)];
    const lang = LANGUAGE_BY_CODE[langCode] ?? LANGUAGES[0];

    const pack = weightedPick(rng, PACKS);
    let variant = weightedPick(rng, pack.variants);
    let ageBand = weightedPair(rng, AGE_WEIGHTS);
    // Respect a variant's age bias so the transcripts stay plausible.
    if (variant.ageBias && !variant.ageBias.includes(ageBand)) {
      ageBand = variant.ageBias[Math.floor(rng() * variant.ageBias.length)];
    }

    const tier = weightedPair(rng, TIER_WEIGHTS);
    const surface: Surface = market.holoMeSites > 0 && rng() < 0.11 ? "holome" : "mobile";

    const name = `${FIRST[Math.floor(rng() * FIRST.length)]} ${LAST[Math.floor(rng() * LAST.length)]}`;
    const reference = `MSL-2026-${String(100000 + i * 7).slice(-6)}`;

    // Memory is opt-in. Under-13 accounts require the parent to opt in, so the
    // rate is deliberately lower there.
    const memoryConsent = ageBand === "under-13" ? rng() < 0.45 : rng() < 0.74;
    // Not every conversation reaches the confirm step — that honesty matters.
    const reachedConfirm = rng() > 0.16;
    const returning = memoryConsent && rng() < 0.31;

    const tr = variant.tr?.[langCode];
    const originalIsLocalised = !!tr;

    const englishTurns: TranscriptTurn[] = [
      { speaker: "messi", text: MESSI_GREET, at: "0:00" },
      { speaker: "fan", text: variant.openEN, at: "0:22" },
      { speaker: "messi", text: MESSI_PROBE, at: "1:35" },
      { speaker: "fan", text: variant.followEN, at: "1:58" },
    ];
    const originalTurns: TranscriptTurn[] = [
      { speaker: "messi", text: MESSI_GREET_TR[langCode] ?? MESSI_GREET, at: "0:00" },
      { speaker: "fan", text: tr?.open ?? variant.openEN, at: "0:22" },
      { speaker: "messi", text: MESSI_PROBE_TR[langCode] ?? MESSI_PROBE, at: "1:35" },
      { speaker: "fan", text: tr?.follow ?? variant.followEN, at: "1:58" },
    ];

    if (reachedConfirm) {
      englishTurns.push(
        { speaker: "messi", text: MESSI_CONFIRM, at: "3:44" },
        { speaker: "fan", text: "Yes, that is exactly it.", at: "4:02" },
      );
      originalTurns.push(
        { speaker: "messi", text: MESSI_CONFIRM_TR[langCode] ?? MESSI_CONFIRM, at: "3:44" },
        { speaker: "fan", text: FAN_AGREE_TR[langCode] ?? "Yes, that is exactly it.", at: "4:02" },
      );
    }
    englishTurns.push({ speaker: "messi", text: MESSI_CLOSE, at: "4:36" });
    originalTurns.push({ speaker: "messi", text: MESSI_CLOSE_TR[langCode] ?? MESSI_CLOSE, at: "4:36" });

    const input: TranscriptInput = {
      reference,
      language: lang.label,
      country: market.country,
      region,
      territory: market.territory,
      tier,
      surface,
      ageBand,
      topicHint: pack.topic,
      memoryConsent,
      turns: englishTurns,
    };
    const record = deterministicScorer.score(input);

    out.push({
      record,
      fanName: name,
      fanNameMasked: maskName(name),
      satisfaction: (rng() < 0.72 ? 5 : rng() < 0.8 ? 4 : 3) as 3 | 4 | 5,
      timeLabel: timeLabelFrom(rng),
      durationSec: 210 + Math.floor(rng() * 90),
      languageLabel: lang.label,
      originalIsLocalised,
      transcript: { original: originalTurns, english: englishTurns },
      returning,
    });
  }

  return out;
}
