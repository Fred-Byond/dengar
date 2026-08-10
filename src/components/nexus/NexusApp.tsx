"use client";

/**
 * Product Nexus — the product team's console.
 * Weekly flow: sign in with a product-team code → library of every product
 * and its live pack version → upload a new product (or open one) → edit the
 * governed pack (positioning, claims, routine, objections, do-not-say, photo)
 * → publish. Publishing creates a new immutable pack version that the Beauty
 * Coach starts using immediately.
 */

import { useCallback, useEffect, useState } from "react";
import { PACK_SECTION_FRAME } from "@/lib/coach/packbuild";
import type { LaunchPack, Product } from "@/lib/coach/types";

type PackLang = { language: string; status: string; version: number };
type Summary = Product & {
  packVersion: number | null;
  packUpdatedAt: string | null;
  hasImage: boolean;
  languages: PackLang[];
};
type Brand = { id: string; name: string; divisionId: string };
type Division = { id: string; name: string; shortName: string; advisorType: string };
type Lang = { code: string; englishName: string; nativeName: string; rtl: boolean };

type View = "signin" | "library" | "edit";

async function api<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

interface FormState {
  id: string;
  name: string;
  brandId: string;
  category: string;
  tagline: string;
  launchLabel: string;
  language: string;
  translationStatus: string;
  sections: Record<string, string>;
  claims: string;
  doNotSay: string;
  objections: Array<{ objection: string; approvedResponse: string }>;
  imageBase64: string | null;
  imageMime: string | null;
  imagePreview: string | null;
}

const EMPTY_FORM: FormState = {
  id: "", name: "", brandId: "loreal-paris", category: "skincare",
  tagline: "", launchLabel: "", language: "EN", translationStatus: "source",
  sections: {}, claims: "", doNotSay: "",
  objections: [{ objection: "", approvedResponse: "" }],
  imageBase64: null, imageMime: null, imagePreview: null,
};

const STATUS_STYLE: Record<string, string> = {
  source: "bg-stone-800 text-white",
  approved: "bg-emerald-100 text-emerald-800 border border-emerald-300",
  draft: "bg-amber-100 text-amber-800 border border-amber-300",
};

const box = "w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-[15px] text-stone-900 outline-none focus:border-amber-600";
const label = "mt-4 mb-1 block text-[11px] font-bold uppercase tracking-widest text-amber-700";

export function NexusApp() {
  const [view, setView] = useState<View>("signin");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [editor, setEditor] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [products, setProducts] = useState<Summary[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [langs, setLangs] = useState<Lang[]>([]);
  const [divFilter, setDivFilter] = useState<string>("all");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isNew, setIsNew] = useState(true);

  const loadLibrary = useCallback(async () => {
    const d = await api<{
      products: Summary[]; brands: Brand[]; divisions: Division[]; languages: Lang[];
    }>("/api/nexus/products");
    setProducts(d.products);
    setBrands(d.brands);
    setDivisions(d.divisions);
    setLangs(d.languages);
  }, []);

  const signIn = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const r = await api<{ editorName: string }>("/api/nexus/auth", { code, name });
      setEditor(r.editorName);
      await loadLibrary();
      setView("library");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally { setBusy(false); }
  }, [code, name, loadLibrary]);

  const openNew = useCallback(() => {
    setForm({ ...EMPTY_FORM, sections: {}, objections: [{ objection: "", approvedResponse: "" }] });
    setIsNew(true); setError(null); setNotice(null);
    setView("edit");
  }, []);

  const openProduct = useCallback(async (id: string, language = "EN") => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const { product, pack } = await api<{
        product: Product; pack: LaunchPack | null;
      }>(`/api/nexus/products/${id}?language=${language}`);
      const sections: Record<string, string> = {};
      pack?.sections.forEach((s) => { sections[s.id] = s.content; });
      setForm({
        id: product.id, name: product.name,
        brandId: product.brandId ?? "loreal-paris",
        category: product.category, tagline: product.tagline,
        launchLabel: product.launchLabel ?? "",
        language,
        translationStatus:
          pack?.translationStatus ?? (language === "EN" ? "source" : "approved"),
        sections,
        claims: (pack?.approvedClaims ?? []).join("\n"),
        doNotSay: (pack?.doNotSay ?? []).join("\n"),
        objections: pack?.objections.length
          ? pack.objections.map((o) => ({ objection: o.objection, approvedResponse: o.approvedResponse }))
          : [{ objection: "", approvedResponse: "" }],
        imageBase64: null, imageMime: null,
        imagePreview: `/api/coach/product-image/${product.id}`,
      });
      setIsNew(false);
      setView("edit");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open product.");
    } finally { setBusy(false); }
  }, []);

  const onImage = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const base64 = url.split(",")[1] ?? null;
      setForm((f) => ({ ...f, imageBase64: base64, imageMime: file.type, imagePreview: url }));
    };
    reader.readAsDataURL(file);
  }, []);

  const publish = useCallback(async () => {
    setBusy(true); setError(null); setNotice(null);
    try {
      const r = await api<{ productId: string; version: number }>("/api/nexus/products", {
        product: {
          id: form.id || undefined, name: form.name, brandId: form.brandId,
          category: form.category, tagline: form.tagline,
          launchLabel: form.launchLabel || null,
        },
        pack: {
          language: form.language,
          sections: form.sections,
          approvedClaims: form.claims.split("\n").map((s) => s.trim()).filter(Boolean),
          doNotSay: form.doNotSay.split("\n").map((s) => s.trim()).filter(Boolean),
          objections: form.objections,
        },
        imageBase64: form.imageBase64,
        imageMime: form.imageMime,
        translationStatus: form.translationStatus,
      });
      await loadLibrary();
      setNotice(
        form.translationStatus === "draft"
          ? `Saved as draft — ${form.language} pack v${r.version}. Advisors cannot train on a draft; mark it market-approved to go live.`
          : `Published — ${form.language} pack v${r.version} is live. The Beauty Coach now trains on it.`
      );
      setForm((f) => ({ ...f, id: r.productId }));
      setIsNew(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publish failed.");
    } finally { setBusy(false); }
  }, [form, loadLibrary]);

  /* try resuming an existing cookie session */
  useEffect(() => {
    (async () => {
      try {
        await loadLibrary();
        setView((v) => (v === "signin" ? "library" : v));
      } catch { /* not signed in — stay on signin */ }
    })();
  }, [loadLibrary]);

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-stone-900">
      <header className="border-b border-stone-200 bg-[#0c0b09] px-6 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div>
            <div className="text-sm font-bold tracking-[.3em]">L&apos;ORÉAL</div>
            <div className="text-[10px] uppercase tracking-[.35em] text-amber-400">Product Nexus</div>
          </div>
          <div className="text-right text-xs text-stone-300">
            {editor ? <>Signed in · <b className="text-white">{editor}</b></> : "Product-team console"}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {view === "signin" && (
          <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-7 shadow-sm">
            <h1 className="font-serif text-2xl">Product team sign-in</h1>
            <p className="mt-1 text-sm text-stone-500">
              Upload weekly launches and maintain the product knowledge library
              the Beauty Coach trains every advisor on.
            </p>
            <label className={label}>Team access code</label>
            <input className={box} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. LOREAL-PM-2026" />
            <label className={label}>Your name</label>
            <input className={box} value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Full name" />
            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button onClick={signIn} disabled={busy || !code.trim() || !name.trim()}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 py-3 font-bold text-white disabled:opacity-40">
              {busy ? "Checking…" : "Enter the Nexus"}
            </button>
            <p className="mt-4 text-center text-xs text-stone-400">Demo code: LOREAL-PM-2026</p>
          </div>
        )}

        {view === "library" && (
          <>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h1 className="font-serif text-3xl">Product library</h1>
                <p className="mt-1 text-sm text-stone-500">
                  {products.length} products across {divisions.length} divisions ·
                  every pack version is immutable and auditable.
                </p>
              </div>
              <button onClick={openNew}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 px-5 py-3 font-bold text-white">
                + Upload new product
              </button>
            </div>
            <div className="mb-6 flex flex-wrap gap-2">
              {[{ id: "all", shortName: "All divisions" }, ...divisions].map((d) => (
                <button key={d.id} onClick={() => setDivFilter(d.id)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${
                    divFilter === d.id
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-stone-300 bg-white text-stone-600 hover:border-amber-500"
                  }`}>
                  {d.shortName}
                </button>
              ))}
            </div>
            {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products
                .filter((p) => divFilter === "all" || p.divisionId === divFilter)
                .map((p) => (
                <button key={p.id} onClick={() => openProduct(p.id)}
                  className="group overflow-hidden rounded-2xl border border-stone-200 bg-white text-left shadow-sm transition hover:border-amber-500 hover:shadow-md">
                  <div className="flex h-36 items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200">
                    {p.hasImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/coach/product-image/${p.id}`} alt=""
                        className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-serif text-4xl text-stone-300">{p.brand.slice(0, 1)}</span>
                    )}
                  </div>
                  <div className="p-4">
                    {p.launchLabel && (
                      <span className="mb-1 inline-block rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        {p.launchLabel}
                      </span>
                    )}
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                      {p.brand}
                    </div>
                    <div className="font-semibold leading-snug">{p.name}</div>
                    <div className="mt-0.5 text-xs text-stone-500">{p.tagline}</div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(p.languages ?? []).map((l) => (
                        <span key={l.language}
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_STYLE[l.status] ?? "bg-stone-200"}`}>
                          {l.language}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-stone-400">
                      {p.packVersion
                        ? <>Pack v{p.packVersion} · {p.packUpdatedAt ? new Date(p.packUpdatedAt).toLocaleDateString() : ""}</>
                        : "No pack yet"} · {p.category}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {view === "edit" && (
          <div className="mx-auto max-w-3xl">
            <button onClick={() => { setView("library"); setNotice(null); }}
              className="mb-4 text-sm text-stone-500 hover:text-stone-800">← Back to library</button>
            <h1 className="font-serif text-3xl">{isNew ? "Upload new product" : form.name}</h1>
            <p className="mt-1 text-sm text-stone-500">
              Publishing creates a new pack version. The Beauty Coach answers only
              from this content — what you write here is the message every advisor learns.
            </p>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">Product</h2>
              <div className="grid gap-x-5 sm:grid-cols-2">
                <div>
                  <label className={label}>Product name *</label>
                  <input className={box} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Tagline</label>
                  <input className={box} value={form.tagline}
                    onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Brand · division</label>
                  <select className={box} value={form.brandId}
                    onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
                    {divisions.map((d) => (
                      <optgroup key={d.id} label={`${d.name} — ${d.advisorType}`}>
                        {brands.filter((b) => b.divisionId === d.id).map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={label}>Category</label>
                  <select className={box} value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    <option value="skincare">Skincare</option>
                    <option value="haircare">Haircare</option>
                    <option value="makeup">Makeup</option>
                  </select>
                </div>
                <div>
                  <label className={label}>Launch label</label>
                  <input className={box} placeholder="e.g. Priority Launch" value={form.launchLabel}
                    onChange={(e) => setForm({ ...form, launchLabel: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Product photo (PNG/JPEG/WebP, &lt;3 MB)</label>
                  <input type="file" accept="image/png,image/jpeg,image/webp"
                    className="mt-1 block w-full text-sm text-stone-500 file:mr-3 file:rounded-lg file:border-0 file:bg-stone-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
                    onChange={(e) => onImage(e.target.files?.[0] ?? null)} />
                  {form.imagePreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imagePreview} alt="preview"
                      className="mt-3 h-28 rounded-xl border border-stone-200 object-cover" />
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">Launch knowledge pack</h2>
              <p className="mt-1 text-xs text-stone-500">
                Fixed six-section frame so every product is taught the same way, in every market.
              </p>

              <label className={label}>Language pack</label>
              <div className="flex flex-wrap gap-2">
                {langs.map((l) => (
                  <button key={l.code}
                    onClick={() => { if (!isNew) openProduct(form.id, l.code);
                      else setForm({ ...form, language: l.code,
                        translationStatus: l.code === "EN" ? "source" : "approved" }); }}
                    className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold ${
                      form.language === l.code
                        ? "border-amber-600 bg-amber-600 text-white"
                        : "border-stone-300 bg-white text-stone-600 hover:border-amber-500"
                    }`}>
                    {l.nativeName}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-stone-500">
                Each language is authored and approved separately — approved claim wording is a
                regulatory artifact per market, never a machine translation of English.
              </p>

              <label className={label}>Governance status</label>
              <select className={box} value={form.translationStatus}
                onChange={(e) => setForm({ ...form, translationStatus: e.target.value })}>
                <option value="source">Source of truth (master language)</option>
                <option value="approved">Market-approved — advisors may train on it</option>
                <option value="draft">Draft — not for coaching</option>
              </select>
              {PACK_SECTION_FRAME.map((f) => (
                <div key={f.id}>
                  <label className={label}>{f.title}</label>
                  <textarea className={`${box} min-h-[76px]`} placeholder={f.hint}
                    value={form.sections[f.id] ?? ""}
                    onChange={(e) => setForm({ ...form, sections: { ...form.sections, [f.id]: e.target.value } })} />
                </div>
              ))}
              <label className={label}>Approved claim phrases * (one per line — fidelity scoring keys on these)</label>
              <textarea className={`${box} min-h-[90px]`} placeholder={"1.5% pure hyaluronic acid\nvisibly plumped"}
                value={form.claims} onChange={(e) => setForm({ ...form, claims: e.target.value })} />
              <label className={label}>Do-not-say list (one per line)</label>
              <textarea className={`${box} min-h-[64px]`} placeholder={"guaranteed results\ncures"}
                value={form.doNotSay} onChange={(e) => setForm({ ...form, doNotSay: e.target.value })} />
            </div>

            <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-xl">Objection library</h2>
              {form.objections.map((o, i) => (
                <div key={i} className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4">
                  <label className={label} style={{ marginTop: 0 }}>Customer says…</label>
                  <input className={box} placeholder="It's too expensive." value={o.objection}
                    onChange={(e) => {
                      const next = [...form.objections];
                      next[i] = { ...next[i], objection: e.target.value };
                      setForm({ ...form, objections: next });
                    }} />
                  <label className={label}>Approved response</label>
                  <textarea className={`${box} min-h-[64px]`} value={o.approvedResponse}
                    onChange={(e) => {
                      const next = [...form.objections];
                      next[i] = { ...next[i], approvedResponse: e.target.value };
                      setForm({ ...form, objections: next });
                    }} />
                  {form.objections.length > 1 && (
                    <button className="mt-2 text-xs text-red-600"
                      onClick={() => setForm({ ...form, objections: form.objections.filter((_, j) => j !== i) })}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button className="mt-3 text-sm font-semibold text-amber-700"
                onClick={() => setForm({ ...form, objections: [...form.objections, { objection: "", approvedResponse: "" }] })}>
                + Add objection
              </button>
            </div>

            {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {notice && <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{notice}</p>}
            <button onClick={publish} disabled={busy || !form.name.trim()}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-700 py-3.5 font-bold text-white disabled:opacity-40">
              {busy ? "Publishing…" : isNew ? "Publish product + pack v1" : "Publish new pack version"}
            </button>
            <p className="mt-3 text-center text-xs text-stone-400">
              Each publish is a new immutable version — previous versions stay in the audit history.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
