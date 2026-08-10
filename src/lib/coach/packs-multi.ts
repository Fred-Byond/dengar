/**
 * Cross-division, multi-language sample packs — SEED CONTENT ONLY.
 *
 * Demonstrates the group shape: one product per division, each with its own
 * advisor type and claim regime, plus market-approved language packs so the
 * language layer can be tested end to end. Replace every line with
 * brand-approved copy during Brand Enablement.
 */

import type { LaunchPack, Product } from "./types";
import type { TranslationStatus } from "./languages";

export interface SeedProduct extends Product {
  brandId: string;
  divisionId: string;
}

export const CATALOGUE: SeedProduct[] = [
  {
    id: "lrp-effaclar-duo", brandId: "la-roche-posay", divisionId: "derm",
    brand: "La Roche-Posay", category: "skincare",
    name: "Effaclar Duo+M Anti-Imperfection Care",
    tagline: "Corrects and unclogs — for blemish-prone skin",
    launchLabel: "Priority Launch",
  },
  {
    id: "lancome-genifique", brandId: "lancome", divisionId: "luxe",
    brand: "Lancôme", category: "skincare",
    name: "Advanced Génifique Radiance Serum",
    tagline: "Skin looks visibly radiant in 7 days",
    launchLabel: "Priority Launch",
  },
  {
    id: "kerastase-gloss-absolu", brandId: "kerastase", divisionId: "ppd",
    brand: "Kérastase", category: "haircare",
    name: "Gloss Absolu Shine Gloss Service",
    tagline: "Salon gloss service — mirror shine for 6 weeks",
    launchLabel: "Priority Launch",
  },
  {
    id: "maybelline-sky-high", brandId: "maybelline", divisionId: "cpd",
    brand: "Maybelline New York", category: "makeup",
    name: "Lash Sensational Sky High Mascara",
    tagline: "Limitless length, no clumps",
    launchLabel: null,
  },
];

type PackBody = Omit<LaunchPack, "id" | "version" | "productId">;

/** productId -> language -> pack body (+ governance status). */
export const CATALOGUE_PACKS: Record<
  string,
  Record<string, PackBody & { status: TranslationStatus }>
> = {
  "lrp-effaclar-duo": {
    EN: {
      language: "EN", status: "source",
      sections: [
        { id: "positioning", title: "Positioning",
          content: "Effaclar Duo+M is the dermatological reference for blemish-prone skin. The one-line message: corrects imperfections and unclogs pores, while helping limit marks from coming back. Position it as pharmacy-grade correction, not a cosmetic quick fix.",
          keywords: ["positioning","message","story","about","what is","introduce"] },
        { id: "claims", title: "Hero claims (approved wording)",
          content: "Approved claims: formulated with niacinamide and salicylic acid. Visibly corrects imperfections. Helps unclog pores. Helps limit the reappearance of marks. Tested on sensitive, blemish-prone skin under dermatological control. Non-comedogenic.",
          keywords: ["claim","results","proof","works","evidence","niacinamide","salicylic"] },
        { id: "ingredients", title: "Ingredient story",
          content: "Salicylic acid gently exfoliates and helps unclog pores; niacinamide helps soothe visible redness; the formula is built on La Roche-Posay Thermal Spring Water for tolerance on sensitive skin.",
          keywords: ["ingredient","formula","inside","contains","active"] },
        { id: "routine", title: "Routine placement",
          content: "Apply morning and evening to cleansed skin, on the whole face rather than as a spot treatment. Layer under sunscreen in the morning — exfoliating actives make daily SPF essential.",
          keywords: ["routine","apply","use","when","how","steps","morning","night"] },
        { id: "price", title: "Price positioning",
          content: "Pharmacy positioning: a dermatologist-recommended formula at a fraction of a prescription course, and a single tube typically lasts two months at twice-daily use.",
          keywords: ["price","cost","expensive","value","compare"] },
        { id: "upsell", title: "Complete the routine",
          content: "Pair with Effaclar Foaming Gel cleanser and Anthelios UVMune SPF50+ Fluid. The routine is what delivers results — cleanse, correct, protect.",
          keywords: ["upsell","companion","also","together","recommend","pair"] },
      ],
      objections: [
        { objection: "It's too strong for my sensitive skin.",
          keywords: ["strong","sensitive","irritate","harsh","react","burn"],
          approvedResponse: "This formula was tested on sensitive, blemish-prone skin under dermatological control and is non-comedogenic. Start once daily in the evening for the first week, then build to twice daily as tolerance allows." },
        { objection: "I can buy a cheaper acne cream.",
          keywords: ["cheaper","price","expensive","cost","pharmacy","brand"],
          approvedResponse: "The difference is tolerance and testing. This combines salicylic acid with niacinamide on a thermal spring water base, tested under dermatological control — which matters when skin is already reactive." },
      ],
      doNotSay: ["cures acne","medical treatment","prescription strength","guaranteed results","clears skin permanently"],
      approvedClaims: ["niacinamide and salicylic acid","visibly corrects imperfections","helps unclog pores","helps limit the reappearance of marks","under dermatological control","non-comedogenic"],
    },
    FR: {
      language: "FR", status: "approved",
      sections: [
        { id: "positioning", title: "Positionnement",
          content: "Effaclar Duo+M est la référence dermatologique pour les peaux à imperfections. Le message clé : corrige les imperfections et désobstrue les pores, tout en aidant à limiter la réapparition des marques. À positionner comme une correction de qualité pharmacie, non comme un geste cosmétique ponctuel.",
          keywords: ["positionnement","message","présenter","qu'est-ce","introduire"] },
        { id: "claims", title: "Allégations approuvées",
          content: "Allégations approuvées : formulé avec de la niacinamide et de l'acide salicylique. Corrige visiblement les imperfections. Aide à désobstruer les pores. Aide à limiter la réapparition des marques. Testé sous contrôle dermatologique sur peaux sensibles à imperfections. Non comédogène.",
          keywords: ["allégation","preuve","résultat","efficace","niacinamide","salicylique"] },
        { id: "routine", title: "Place dans la routine",
          content: "Appliquer matin et soir sur peau nettoyée, sur l'ensemble du visage plutôt qu'en traitement local. Superposer sous une protection solaire le matin : les actifs exfoliants rendent le SPF quotidien indispensable.",
          keywords: ["routine","appliquer","utiliser","quand","comment","matin","soir"] },
        { id: "price", title: "Positionnement prix",
          content: "Positionnement pharmacie : une formule recommandée par les dermatologues, et un tube dure généralement deux mois à raison de deux applications par jour.",
          keywords: ["prix","coût","cher","valeur","comparer"] },
      ],
      objections: [
        { objection: "C'est trop fort pour ma peau sensible.",
          keywords: ["fort","sensible","irrite","agressif","réaction"],
          approvedResponse: "Cette formule est testée sous contrôle dermatologique sur peaux sensibles à imperfections et elle est non comédogène. Commencez une fois par jour le soir la première semaine, puis passez à deux fois par jour selon la tolérance." },
      ],
      doNotSay: ["guérit l'acné","traitement médical","résultats garantis"],
      approvedClaims: ["niacinamide et acide salicylique","corrige visiblement les imperfections","aide à désobstruer les pores","sous contrôle dermatologique","non comédogène"],
    },
    AR: {
      language: "AR", status: "approved",
      sections: [
        { id: "positioning", title: "التموضع",
          content: "إيفاكلار ديو+ إم هو المرجع الطبي للبشرة المعرضة للعيوب. الرسالة الأساسية: يصحح العيوب ويساعد على فتح المسام، ويحد من عودة الآثار. قدّميه كعلاج تصحيحي من الصيدلية وليس كمستحضر تجميلي سريع.",
          keywords: ["تموضع","رسالة","تعريف","ما هو","المنتج"] },
        { id: "claims", title: "الادعاءات المعتمدة",
          content: "الادعاءات المعتمدة: يحتوي على النياسيناميد وحمض الساليسيليك. يصحح العيوب بشكل مرئي. يساعد على فتح المسام. يساعد على الحد من عودة الآثار. تم اختباره تحت إشراف طبي على البشرة الحساسة. لا يسد المسام.",
          keywords: ["ادعاء","نتائج","فعالية","نياسيناميد","ساليسيليك"] },
        { id: "routine", title: "مكانه في الروتين",
          content: "يُستخدم صباحاً ومساءً على بشرة نظيفة، على الوجه كاملاً وليس كعلاج موضعي. ضعي واقي الشمس فوقه في الصباح — فالمكونات المقشّرة تجعل الحماية اليومية ضرورية.",
          keywords: ["روتين","استخدام","كيف","متى","صباح","مساء"] },
      ],
      objections: [
        { objection: "هذا المنتج قوي جداً على بشرتي الحساسة.",
          keywords: ["قوي","حساسة","تهيج","حرقان"],
          approvedResponse: "تم اختبار هذه التركيبة تحت إشراف طبي على البشرة الحساسة المعرضة للعيوب، وهي لا تسد المسام. ابدئي بمرة واحدة مساءً في الأسبوع الأول، ثم مرتين يومياً حسب التحمل." },
      ],
      doNotSay: ["يعالج حب الشباب","علاج طبي","نتائج مضمونة"],
      approvedClaims: ["النياسيناميد وحمض الساليسيليك","يصحح العيوب بشكل مرئي","يساعد على فتح المسام","تحت إشراف طبي"],
    },
  },

  "lancome-genifique": {
    EN: {
      language: "EN", status: "source",
      sections: [
        { id: "positioning", title: "Positioning",
          content: "Advanced Génifique is Lancôme's icon of radiance and the entry point to the ritual. The one-line message: skin looks visibly radiant and feels stronger in seven days. Sell the ritual and the diagnosis, never the ingredient list alone.",
          keywords: ["positioning","message","story","about","what is","introduce"] },
        { id: "claims", title: "Hero claims (approved wording)",
          content: "Approved claims: powered by a probiotic-derived fractions and prebiotic complex. Skin looks visibly radiant in seven days. Skin feels stronger and more resilient. Suitable for all skin types and tones. Fragrance formulated for sensitive skin.",
          keywords: ["claim","results","proof","works","evidence","probiotic","radiance"] },
        { id: "ingredients", title: "Ingredient story",
          content: "A complex of probiotic-derived fractions and prebiotics supports the skin's natural barrier and microbiome balance, which is what drives the visible radiance result.",
          keywords: ["ingredient","formula","inside","contains","active","microbiome"] },
        { id: "routine", title: "Routine placement",
          content: "The first step after cleansing, morning and evening — seven drops, warmed between the palms and pressed into the skin. It preps skin so everything applied after performs better.",
          keywords: ["routine","apply","use","when","how","steps","morning","night","ritual"] },
        { id: "price", title: "Price positioning",
          content: "Luxury positioning justified by the ritual and the results timeline. Frame the conversation around the seven-day result and the size options rather than defending the price outright.",
          keywords: ["price","cost","expensive","value","compare","worth"] },
        { id: "upsell", title: "Complete the ritual",
          content: "Layer with Génifique Eye Cream and finish with Absolue or Rénergie moisturiser. Offer the ritual as a diagnosis-led routine, not a bundle.",
          keywords: ["upsell","companion","also","together","recommend","pair","ritual"] },
      ],
      objections: [
        { objection: "It's very expensive for a small bottle.",
          keywords: ["expensive","price","cost","small","afford","worth"],
          approvedResponse: "I understand. Seven drops is one application, so the 50ml lasts about three months — and it is the step that makes everything after it work harder. May I show you how it changes the feel of your skin right now?" },
        { objection: "I already have a serum I like.",
          keywords: ["already","have","serum","using","another","brand"],
          approvedResponse: "That's a great starting point. May I ask what result you want next — radiance, comfort or firmness? Génifique is a first-step serum, so it often layers under what you already use rather than replacing it." },
      ],
      doNotSay: ["anti-ageing cure","medical treatment","guaranteed results","erases wrinkles"],
      approvedClaims: ["probiotic-derived fractions","skin looks visibly radiant in seven days","skin feels stronger","all skin types and tones"],
    },
    ZH: {
      language: "ZH", status: "approved",
      sections: [
        { id: "positioning", title: "产品定位",
          content: "小黑瓶精华是兰蔻的光泽象征，也是整套护肤仪式的第一步。核心信息：七天后肌肤看起来明显焕发光泽，触感更强韧。销售的是仪式感与肌肤诊断，而不仅仅是成分表。",
          keywords: ["定位","信息","介绍","是什么","产品"] },
        { id: "claims", title: "官方认可宣称",
          content: "认可宣称：含益生菌衍生物与益生元复合成分。七天后肌肤看起来明显焕发光泽。肌肤触感更强韧。适合所有肤质与肤色。香氛专为敏感肌配方设计。",
          keywords: ["宣称","效果","功效","证明","益生菌","光泽"] },
        { id: "routine", title: "使用步骤",
          content: "洁面后的第一步，早晚各一次——取七滴于掌心温热后按压于肌肤。它为后续护肤品打底，让后续产品效果更好。",
          keywords: ["步骤","使用","怎么用","何时","早晚","仪式"] },
        { id: "price", title: "价格沟通",
          content: "奢华定位源于仪式感与七天见效的时间承诺。请围绕七天效果与规格选择展开对话，而不是直接为价格辩护。",
          keywords: ["价格","贵","价值","比较","值得"] },
      ],
      objections: [
        { objection: "这么小一瓶太贵了。",
          keywords: ["贵","价格","小","划算","值得"],
          approvedResponse: "我理解您的顾虑。每次七滴，50毫升大约可以使用三个月，而且它是让后续所有产品发挥更好效果的关键一步。我可以现在为您试用，让您感受一下肌肤的变化吗？" },
      ],
      doNotSay: ["抗衰老治疗","医疗功效","保证效果","去除皱纹"],
      approvedClaims: ["益生菌衍生物","七天后肌肤看起来明显焕发光泽","肌肤触感更强韧","适合所有肤质"],
    },
    JA: {
      language: "JA", status: "approved",
      sections: [
        { id: "positioning", title: "ポジショニング",
          content: "ジェニフィックはランコムの輝きの象徴であり、スキンケア儀式の第一歩です。キーメッセージ：7日間で肌が見た目に輝き、より健やかな手触りに。成分の羅列ではなく、儀式とカウンセリングを提案してください。",
          keywords: ["ポジショニング","メッセージ","紹介","とは","商品"] },
        { id: "claims", title: "承認されたクレーム",
          content: "承認クレーム：プロバイオティクス由来成分とプレバイオティクス複合体を配合。7日間で肌が見た目に輝きます。肌がより健やかな手触りに。すべての肌質・肌色に。敏感肌にも配慮した香料設計。",
          keywords: ["クレーム","効果","結果","証明","プロバイオティクス","輝き"] },
        { id: "routine", title: "使用手順",
          content: "洗顔後の最初のステップとして、朝晩に7滴を手のひらで温めてから肌に押し込むようになじませます。後に使う製品の効果を高めます。",
          keywords: ["手順","使い方","いつ","朝","夜","儀式"] },
        { id: "price", title: "価格の伝え方",
          content: "価格ではなく、7日間の結果とサイズ展開を軸に会話を進めてください。7滴で1回分のため、50mlは約3か月お使いいただけます。",
          keywords: ["価格","高い","価値","比較"] },
      ],
      objections: [
        { objection: "小さいボトルなのに高いですね。",
          keywords: ["高い","価格","小さい","値段"],
          approvedResponse: "ごもっともです。1回7滴ですので、50mlで約3か月お使いいただけます。そして後に重ねる製品の効果を高める一歩でもあります。よろしければ今、お肌で感触をお試しいただけますか。" },
      ],
      doNotSay: ["アンチエイジング治療","医薬的効果","効果を保証","シワを消す"],
      approvedClaims: ["プロバイオティクス由来成分","7日間で肌が見た目に輝き","肌がより健やかな手触り","すべての肌質"],
    },
  },

  "kerastase-gloss-absolu": {
    EN: {
      language: "EN", status: "source",
      sections: [
        { id: "positioning", title: "Positioning",
          content: "Gloss Absolu is an in-salon shine service, not a retail bottle. The one-line message to the client: mirror-like shine that lasts up to six weeks, with no change to hair colour. Position it as a bookable service that adds value to every colour appointment.",
          keywords: ["positioning","message","story","about","what is","introduce","service"] },
        { id: "claims", title: "Hero claims (approved wording)",
          content: "Approved claims: professional in-salon gloss service. Delivers mirror-like shine. Shine lasts up to six weeks. Can be used on natural or coloured hair. Seals the cuticle for smoother feel.",
          keywords: ["claim","results","proof","works","evidence","shine","weeks"] },
        { id: "routine", title: "Service protocol",
          content: "Apply to towel-dried, shampooed hair. Respect the mixing ratio and the processing time on the technical sheet, then rinse and finish. Sell the follow-up: the client rebooks the gloss with each colour service.",
          keywords: ["routine","apply","protocol","mixing","processing","time","how","steps"] },
        { id: "price", title: "Service pricing",
          content: "Priced as an add-on service to colour. The stylist's message is the six-week shine result and the rebooking rhythm — it raises the average ticket without extra chair time.",
          keywords: ["price","cost","ticket","charge","value","add-on"] },
        { id: "upsell", title: "Take-home recommendation",
          content: "Recommend the matching shine-maintenance shampoo and conditioner at the chair. Home care is what protects the six-week result the client is paying for.",
          keywords: ["upsell","companion","also","together","recommend","retail","home"] },
      ],
      objections: [
        { objection: "My client won't pay for an extra service.",
          keywords: ["pay","expensive","extra","cost","client","afford"],
          approvedResponse: "Frame it as protecting the colour they already paid for. The gloss adds shine for up to six weeks and brings them back on a rhythm — it raises the ticket without extra chair time." },
      ],
      doNotSay: ["permanent shine","changes hair colour","damage-free guarantee","lasts forever"],
      approvedClaims: ["professional in-salon gloss service","mirror-like shine","lasts up to six weeks","natural or coloured hair","seals the cuticle"],
    },
  },

  "maybelline-sky-high": {
    EN: {
      language: "EN", status: "source",
      sections: [
        { id: "positioning", title: "Positioning",
          content: "One line, said fast: limitless length and volume, no clumps. This is an impulse aisle purchase — lead with the result and the price point, not the technology.",
          keywords: ["positioning","message","about","what is","introduce"] },
        { id: "claims", title: "Hero claims (approved wording)",
          content: "Approved claims: flexible bristle brush for full lash coverage. Formula with bamboo extract and fibres. Delivers limitless length and volume. Washes off with warm water and cleanser.",
          keywords: ["claim","results","proof","works","bamboo","length","volume"] },
        { id: "routine", title: "How to use",
          content: "Wiggle the brush at the root and comb through to the tip. Two coats for volume. Remove with warm water and your normal cleanser.",
          keywords: ["routine","apply","use","how","steps","remove"] },
        { id: "price", title: "Price positioning",
          content: "Mass price point with a result shoppers associate with premium mascaras — that contrast is the whole pitch.",
          keywords: ["price","cost","cheap","value","compare"] },
        { id: "upsell", title: "Complete the look",
          content: "Add the micellar water for easy removal, or the brow pencil to finish the eye. Keep the add-on to one item at the till.",
          keywords: ["upsell","also","together","recommend","pair"] },
      ],
      objections: [
        { objection: "Does it smudge or flake?",
          keywords: ["smudge","flake","run","last","wear"],
          approvedResponse: "The formula is built to hold length through the day and washes off with warm water and your cleanser — no oil remover needed." },
      ],
      doNotSay: ["waterproof","lash growth","permanent","medical"],
      approvedClaims: ["flexible bristle brush","bamboo extract","limitless length and volume","washes off with warm water"],
    },
    HI: {
      language: "HI", status: "approved",
      sections: [
        { id: "positioning", title: "पोज़िशनिंग",
          content: "एक ही लाइन में, तेज़ी से: बेहिसाब लंबाई और वॉल्यूम, बिना क्लंप्स के। यह इम्पल्स खरीद है — टेक्नोलॉजी नहीं, नतीजा और कीमत सबसे पहले बताएं।",
          keywords: ["पोज़िशनिंग","संदेश","परिचय","क्या है","प्रोडक्ट"] },
        { id: "claims", title: "स्वीकृत दावे",
          content: "स्वीकृत दावे: पूरी लैश कवरेज के लिए फ्लेक्सिबल ब्रिसल ब्रश। बांस के अर्क और फाइबर वाला फॉर्मूला। बेहिसाब लंबाई और वॉल्यूम देता है। गुनगुने पानी और क्लेंज़र से आसानी से निकल जाता है।",
          keywords: ["दावा","नतीजा","असर","बांस","लंबाई","वॉल्यूम"] },
        { id: "routine", title: "इस्तेमाल कैसे करें",
          content: "ब्रश को जड़ों पर हिलाते हुए लगाएं और सिरे तक कंघी करें। वॉल्यूम के लिए दो कोट। गुनगुने पानी और सामान्य क्लेंज़र से हटाएं।",
          keywords: ["रूटीन","लगाना","कैसे","इस्तेमाल","हटाना"] },
        { id: "price", title: "कीमत की बात",
          content: "मास कीमत पर वह नतीजा जो ग्राहक प्रीमियम मस्कारा से जोड़ते हैं — यही पूरा पिच है।",
          keywords: ["कीमत","महंगा","सस्ता","तुलना"] },
      ],
      objections: [
        { objection: "क्या यह फैलता या झड़ता है?",
          keywords: ["फैलता","झड़ता","टिकता","चलता"],
          approvedResponse: "यह फॉर्मूला दिन भर लंबाई बनाए रखने के लिए बना है और गुनगुने पानी तथा आपके क्लेंज़र से निकल जाता है — किसी ऑयल रिमूवर की ज़रूरत नहीं।" },
      ],
      doNotSay: ["वॉटरप्रूफ","लैश ग्रोथ","स्थायी","मेडिकल"],
      approvedClaims: ["फ्लेक्सिबल ब्रिसल ब्रश","बांस के अर्क","बेहिसाब लंबाई और वॉल्यूम","गुनगुने पानी से निकल जाता है"],
    },
  },
};
