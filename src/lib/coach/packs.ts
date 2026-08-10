/**
 * Sample launch knowledge packs — SEED CONTENT ONLY.
 *
 * These packs are written as placeholders in the shape real brand content
 * will take. Before any pilot with L'Oréal, every section must be replaced
 * with brand-approved copy through the pack-ingestion step (One-Time Brand
 * Enablement). The conversation engine refuses to answer outside the pack,
 * so pack quality IS product quality.
 */

import type { LaunchPack, Product } from "./types";

export const SEED_PRODUCTS: Product[] = [
  {
    id: "revitalift-ha-serum",
    brand: "L'Oréal Paris",
    category: "skincare",
    name: "Revitalift 1.5% Pure Hyaluronic Acid Serum",
    tagline: "Visibly plumped, hydrated skin",
    launchLabel: "Priority Launch",
  },
  {
    id: "age-perfect-serum",
    brand: "L'Oréal Paris",
    category: "skincare",
    name: "Age Perfect Cell Renewal Midnight Serum",
    tagline: "Wake up to visibly renewed skin",
    launchLabel: null,
  },
  {
    id: "elvive-bond-repair",
    brand: "L'Oréal Paris",
    category: "haircare",
    name: "Elvive Bond Repair Shampoo",
    tagline: "Repairs damaged hair bonds",
    launchLabel: null,
  },
];

export const SEED_PACKS: LaunchPack[] = [
  {
    id: "pack-revitalift-ha-en-v1",
    productId: "revitalift-ha-serum",
    version: 1,
    language: "EN",
    sections: [
      {
        id: "positioning",
        title: "Positioning",
        content:
          "Revitalift 1.5% Pure Hyaluronic Acid Serum is our most concentrated hyaluronic serum, positioned as the accessible dermatological choice: validated ingredients at a fair price. The one-line message is: intense hydration that visibly plumps skin and reduces fine lines in two weeks.",
        keywords: ["positioning", "message", "story", "about", "what is"],
      },
      {
        id: "claims",
        title: "Hero claims (approved wording)",
        content:
          "Approved claims: contains 1.5% pure hyaluronic acid with two molecular weights. Skin is intensely hydrated. Skin looks visibly plumped. Fine lines are reduced in two weeks. Dermatologist validated for all skin types, including sensitive skin. Fragrance-free formula.",
        keywords: ["claim", "results", "proof", "hyaluronic", "percentage", "works"],
      },
      {
        id: "ingredients",
        title: "Ingredient story",
        content:
          "Two molecular weights of hyaluronic acid work together: macro hyaluronic acid hydrates and smooths at the surface, micro hyaluronic acid penetrates deeper into the epidermis to replump from within. The formula is fragrance-free, paraben-free and suitable for sensitive skin.",
        keywords: ["ingredient", "molecular", "formula", "inside", "contains", "sensitive"],
      },
      {
        id: "routine",
        title: "Routine placement",
        content:
          "Apply 2–3 drops on clean skin morning and night, before moisturiser. Pairs with Revitalift Filler Eye Cream for the eye area, and always with UV Defender SPF in the morning, because hydrated skin still needs daily UV protection.",
        keywords: ["routine", "apply", "use", "when", "how", "steps", "moisturiser"],
      },
      {
        id: "price",
        title: "Price positioning",
        content:
          "Positioned in masstige: dermatological-grade actives at an accessible price. When a customer compares with premium serums: the concentration of 1.5% pure hyaluronic acid matches or exceeds serums at three times the price. Value message: proven science, honest price.",
        keywords: ["price", "cost", "expensive", "cheap", "value", "compare"],
      },
      {
        id: "upsell",
        title: "Routine completion (upsell)",
        content:
          "Natural companions: UV Defender SPF 50 in the morning (hydration plus protection story), Revitalift Filler Eye Cream for targeted eye care, and Micellar Water as the cleansing first step. Recommend the routine, not just the product.",
        keywords: ["upsell", "companion", "also", "together", "routine", "recommend"],
      },
    ],
    objections: [
      {
        objection: "It's too expensive.",
        keywords: ["expensive", "price", "cost", "much", "afford"],
        approvedResponse:
          "I understand price matters. This serum contains 1.5% pure hyaluronic acid — a concentration you would normally find in serums at three times the price. One bottle lasts about two months at 2–3 drops per day, so it is proven science at an honest price.",
      },
      {
        objection: "My skin is sensitive; serums irritate it.",
        keywords: ["sensitive", "irritate", "react", "allergy", "breakout"],
        approvedResponse:
          "This formula was validated by dermatologists for all skin types, including sensitive skin. It is fragrance-free and paraben-free. Start with 2 drops at night for the first week so your skin adjusts comfortably.",
      },
      {
        objection: "I already use a moisturiser. Why do I need a serum?",
        keywords: ["moisturiser", "already", "need", "difference", "why"],
        approvedResponse:
          "A moisturiser seals hydration at the surface; this serum delivers hyaluronic acid deeper into the epidermis to replump from within. They work together — serum first, moisturiser after — which is why fine lines look reduced in two weeks.",
      },
    ],
    doNotSay: [
      "cures",
      "medical treatment",
      "removes wrinkles permanently",
      "better than every competitor",
      "guaranteed results",
    ],
    approvedClaims: [
      "1.5% pure hyaluronic acid",
      "two molecular weights",
      "intensely hydrated",
      "visibly plumped",
      "fine lines are reduced in two weeks",
      "dermatologist validated",
      "fragrance-free",
    ],
  },
  {
    id: "pack-age-perfect-en-v1",
    productId: "age-perfect-serum",
    version: 1,
    language: "EN",
    sections: [
      {
        id: "positioning",
        title: "Positioning",
        content:
          "Age Perfect Cell Renewal Midnight Serum works with the skin's own night-time renewal cycle. The one-line message: wake up to visibly renewed, radiant skin.",
        keywords: ["positioning", "message", "story", "about", "what is"],
      },
      {
        id: "claims",
        title: "Hero claims (approved wording)",
        content:
          "Approved claims: powered by an antioxidant recovery complex. Supports the skin's night-time cell renewal. Skin looks visibly renewed and radiant. Skin feels stronger and more resilient. Suitable for mature skin.",
        keywords: ["claim", "results", "proof", "renewal", "works"],
      },
      {
        id: "routine",
        title: "Routine placement",
        content:
          "Apply at night on clean skin as the last treatment step before night cream. Pairs with Age Perfect day cream with SPF in the morning.",
        keywords: ["routine", "apply", "use", "when", "how", "night"],
      },
      {
        id: "price",
        title: "Price positioning",
        content:
          "Premium of the masstige range: advanced anti-ageing science, accessible compared with department-store serums with similar antioxidant complexes.",
        keywords: ["price", "cost", "expensive", "value", "compare"],
      },
    ],
    objections: [
      {
        objection: "Anti-ageing serums never show results.",
        keywords: ["results", "work", "nothing", "sceptic", "believe"],
        approvedResponse:
          "That is a fair concern. This serum works with your skin's own overnight renewal cycle rather than against it, and most users describe visibly renewed, more radiant skin. Consistency matters: nightly use as the last step before night cream.",
      },
    ],
    doNotSay: ["reverses ageing", "clinical cure", "guaranteed results"],
    approvedClaims: [
      "antioxidant recovery complex",
      "night-time cell renewal",
      "visibly renewed",
      "radiant",
      "stronger and more resilient",
    ],
  },
  {
    id: "pack-elvive-bond-en-v1",
    productId: "elvive-bond-repair",
    version: 1,
    language: "EN",
    sections: [
      {
        id: "positioning",
        title: "Positioning",
        content:
          "Elvive Bond Repair brings professional bond-repair technology to the mass market. One-line message: repairs damaged hair bonds from the very first wash.",
        keywords: ["positioning", "message", "story", "about", "what is"],
      },
      {
        id: "claims",
        title: "Hero claims (approved wording)",
        content:
          "Approved claims: contains citric acid complex that penetrates the hair fibre. Repairs damaged bonds inside the hair. Hair is stronger, smoother and shinier from the first wash. Suitable for all damaged hair types, including coloured and bleached hair.",
        keywords: ["claim", "results", "bond", "repair", "works", "citric"],
      },
      {
        id: "routine",
        title: "Routine placement",
        content:
          "Use shampoo and conditioner together, followed weekly by the Bond Repair pre-shampoo treatment for intensive recovery. For heat styling, always add the leave-in serum for protection.",
        keywords: ["routine", "use", "how", "conditioner", "treatment"],
      },
      {
        id: "price",
        title: "Price positioning",
        content:
          "Salon bond-repair technology at a supermarket price: the reference professional bond treatments cost five to eight times more per wash.",
        keywords: ["price", "cost", "expensive", "salon", "value", "compare"],
      },
    ],
    objections: [
      {
        objection: "Supermarket shampoo can't really repair hair.",
        keywords: ["really", "repair", "gimmick", "marketing", "believe"],
        approvedResponse:
          "It is a fair question. The citric acid complex penetrates the hair fibre and repairs damaged bonds inside the hair — the same repair mechanism popularised by professional salon treatments, now at an accessible price. Customers feel stronger, smoother hair from the first wash.",
      },
    ],
    doNotSay: ["identical to salon brands", "permanent repair", "guaranteed"],
    approvedClaims: [
      "citric acid complex",
      "repairs damaged bonds",
      "stronger, smoother and shinier",
      "from the first wash",
      "coloured and bleached hair",
    ],
  },
];
