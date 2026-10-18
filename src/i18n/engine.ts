export type Locale = "en" | "hr";
const LOCALE_KEY = "dnd-creator-language";
let currentLocale: Locale = (() => {
  try {
    return localStorage.getItem(LOCALE_KEY) === "hr"
      ? "hr"
      : localStorage.getItem(LOCALE_KEY) === "en"
        ? "en"
        : navigator.language.toLowerCase().startsWith("hr")
          ? "hr"
          : "en";
  } catch {
    return "en";
  }
})();
const translations = new Map<string, string>();
const missing = new Set<string>();
const translatedOutputs = new Set<string>();
const translationCache = new Map<string, string>();
let proseEntries: [string, string][] = [];
export function registerTranslations(values: Record<string, string>) {
  for (const [en, hr] of Object.entries(values))
    if (hr.trim()) {
      translations.set(en.trim().replace(/\s+/g, " "), hr);
      translatedOutputs.add(hr.trim());
    }
  proseEntries = [...translations]
    .filter(([en]) => en.length >= 40 && en.split(/\s+/).length >= 5)
    .sort(([a], [b]) => b.length - a.length);
  translationCache.clear();
}
export function registerDynamicTranslations(values: [RegExp, string][]) {
  dynamicTranslations.unshift(...values);
  translationCache.clear();
}
export function getLocale() {
  return currentLocale;
}
export function setLocale(value: Locale) {
  currentLocale = value;
  try {
    localStorage.setItem(LOCALE_KEY, value);
  } catch {
    /* Locale still works without storage. */
  }
}
export function translationGaps() {
  return [...missing].sort();
}
export function t(value: string, locale = currentLocale): string {
  if (locale === "en" || !/[A-Za-z]/.test(value)) return value;
  const cached = translationCache.get(value);
  if (cached !== undefined) return cached;
  const result = translateFragment(value, 0);
  translationCache.set(value, result);
  return result;
}
function translateFragment(value: string, depth: number): string {
  if (depth > 64 || !/[A-Za-z]/.test(value)) return value;
  const trimmed = value.trim();
  const raw = trimmed.replace(/\s+/g, " ");
  const wrap = (text: string) =>
    `${value.slice(0, value.indexOf(trimmed))}${text}${value.slice(value.indexOf(trimmed) + trimmed.length)}`;
  if (translatedOutputs.has(raw)) return value;
  const exact = translations.get(raw);
  if (exact) return wrap(exact);
  // Known generated clauses can end immediately before another translated
  // clause. Keep their punctuation without making it part of the lookup key.
  const punctuated = raw.match(/^(.+\S)([;,:])$/);
  if (punctuated)
    return wrap(
      `${translateFragment(punctuated[1], depth + 1)}${punctuated[2]}`,
    );
  const namedSource = raw.match(/^(.+) \(([^()]*)\)$/);
  if (namedSource && translations.has(namedSource[1]))
    return wrap(
      `${translations.get(namedSource[1])} (${translateFragment(namedSource[2], depth + 1)})`,
    );
  // A surrounding generated sentence may own the final full stop outside a
  // captured clause. Match that clause against sentence translations as well.
  const sentenceExact = !/[.!?]$/.test(raw)
    ? translations.get(`${raw}.`)
    : undefined;
  if (sentenceExact) return wrap(sentenceExact.replace(/\.$/, ""));
  const joinedNames = raw.match(/^(.+) (and|or) (.+)$/);
  if (
    joinedNames &&
    translations.has(joinedNames[1]) &&
    translations.has(joinedNames[3])
  )
    return wrap(
      `${translations.get(joinedNames[1])} ${joinedNames[2] === "and" ? "i" : "ili"} ${translations.get(joinedNames[3])}`,
    );
  const runDynamic = (broad: boolean): string | undefined => {
    for (const [pattern, replacement] of dynamicTranslations) {
      if (pattern.source.includes("(.*)") !== broad) continue;
      pattern.lastIndex = 0;
      let match = pattern.exec(raw);
      let implicitStop = false;
      if (!match && !/[.!?]$/.test(raw)) {
        pattern.lastIndex = 0;
        match = pattern.exec(`${raw}.`);
        implicitStop = Boolean(match);
      }
      if (!match) continue;
      const text = replacement.replace(/\$(\d{1,2})/g, (_, index: string) => {
        const captured = match[Number(index)] || "";
        return captured && captured !== raw
          ? translateFragment(captured, depth + 1)
          : captured;
      });
      const output =
        raw.slice(0, match.index) +
        text +
        raw.slice(match.index + match[0].length);
      return wrap(implicitStop ? output.replace(/\.$/, "") : output);
    }
    return undefined;
  };
  const dynamic = runDynamic(false);
  if (dynamic !== undefined) return dynamic;
  if (/\n/.test(trimmed))
    return wrap(
      trimmed
        .split(/(\n+)/)
        .map((part) =>
          /^\n+$/.test(part) ? part : translateFragment(part, depth + 1),
        )
        .join(""),
    );
  // Complete catalog paragraphs are often followed by live numeric resource text.
  // Translate that known paragraph as a unit before considering short labels.
  for (const [en, hr] of proseEntries) {
    const index = raw.indexOf(en);
    if (index < 0) continue;
    if (index > 0 && /[A-Za-z]/.test(raw[index - 1])) continue;
    if (
      index + en.length < raw.length &&
      /[A-Za-z]/.test(raw[index + en.length])
    )
      continue;
    return wrap(
      translateFragment(raw.slice(0, index), depth + 1) +
        hr +
        translateFragment(raw.slice(index + en.length), depth + 1),
    );
  }
  const sentences = raw.split(/(?<=[.!?])\s+(?=[A-Za-z0-9+])/);
  if (sentences.length > 1)
    return wrap(
      sentences.map((part) => translateFragment(part, depth + 1)).join(" "),
    );
  const pieces = raw.split(/( · | • | \/ |: |, |; | \+ )/);
  if (pieces.length > 1) {
    const result = pieces
      .map((piece) =>
        /^( · | • | \/ |: |, |; | \+ )$/.test(piece)
          ? piece
          : translateFragment(piece, depth + 1),
      )
      .join("");
    if (result !== raw) return wrap(result);
  }
  const numericLabel = raw.match(/^(.+?)\s+([+-]?\d+(?:\s*\/\s*\d+)?)$/);
  if (numericLabel && translations.has(numericLabel[1]))
    return wrap(`${translations.get(numericLabel[1])} ${numericLabel[2]}`);
  const broad = runDynamic(true);
  if (broad !== undefined) return broad;
  if (raw.length > 2) missing.add(raw);
  return value;
}
const dynamicTranslations: [RegExp, string][] = [];
