import fontkit from "@pdf-lib/fontkit";
import {
  defaultTextFieldAppearanceProvider,
  PDFDocument,
  PDFCheckBox,
  PDFField,
  PDFHexString,
  PDFFont,
  PDFName,
  PDFPage,
  PDFString,
  PDFTextField,
  TextAlignment,
  layoutMultilineText,
  rgb,
} from "pdf-lib";

export type PDFLocale = "en" | "hr";
export type PDFLayoutReport = {
  pageCount: number;
  smallestFont: number;
  warnings: string[];
};
export const continuationMarker = PDFName.of("DnDCreatorContinuation");
export const safePDFText = (value: unknown) =>
  String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .replace(/\r\n?/g, "\n");

const fontBytes = new Map<string, Promise<Uint8Array>>();
export async function embedCharacterFont(
  pdf: PDFDocument,
  filename = "DejaVuSans.ttf",
): Promise<PDFFont> {
  pdf.registerFontkit(fontkit);
  const baseURL =
    (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env
      ?.BASE_URL || "/";
  if (!fontBytes.has(filename))
    fontBytes.set(
      filename,
      fetch(`${baseURL}fonts/${filename}`)
        .then(async (response) => {
          if (!response.ok)
            throw new Error(
              "The PDF font could not be loaded. Reload the app and try again.",
            );
          return new Uint8Array(await response.arrayBuffer());
        })
        .catch((error) => {
          fontBytes.delete(filename);
          throw error;
        }),
    );
  return pdf.embedFont(await fontBytes.get(filename)!, { subset: true });
}

export function wrapPDFText(
  text: string,
  font: PDFFont,
  size: number,
  width: number,
): string[] {
  const result: string[] = [];
  for (const paragraph of safePDFText(text).split("\n")) {
    if (!paragraph) {
      result.push("");
      continue;
    }
    const indent = /^\s*•\s/.test(paragraph) ? "  " : "";
    let current = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= width) {
        current = candidate;
        continue;
      }
      if (current) result.push(current);
      current = indent;
      for (const char of word) {
        if (
          current.trim() &&
          font.widthOfTextAtSize(current + char, size) > width
        ) {
          result.push(current);
          current = indent;
        }
        current += char;
      }
    }
    if (current) result.push(current);
  }
  return result;
}

export type ContinuationSection = {
  title: string;
  text: string;
  field?: PDFTextField;
  preview?: string;
  pageBreakBefore?: boolean;
  entries?: ReferenceEntry[];
  stats?: { label: string; value: string }[];
  appendToPreview?: boolean;
  fixedText?: string;
};
export type ReferenceEntry = {
  title: string;
  subtitle: string;
  metadata: string[];
  text: string;
  spell?: {
    levelNumber?: number;
    level: string;
    status: string;
    source: string;
    prepared: boolean;
    castingTime: string;
    range: string;
    components: string;
    duration: string;
    combat: string;
    damage?: string;
    check?: string;
    ritual?: boolean;
    saveAbility?: string;
    attackKind?: "melee" | "ranged";
    rowEffect?: string;
    target?: string;
  };
  notes?: string[];
  indexFields?: { field: PDFTextField; label: string }[];
};
function applyFieldFontSize(field: PDFTextField, font: PDFFont, size: number) {
  if (!field.acroField.getDefaultAppearance())
    field.acroField.setDefaultAppearance(`/${font.name} ${size} Tf 0 g`);
  field.setFontSize(size);
  // The source template can define /DA on individual widgets; those take precedence.
  for (const widget of field.acroField.getWidgets())
    widget.dict.set(
      PDFName.of("DA"),
      PDFString.of(`/${font.name} ${size} Tf 0 g`),
    );
}

/** A compact label only; its complete value must also appear in the play notes. */
export function fitSingleLineText(
  field: PDFTextField,
  text: string,
  font: PDFFont,
) {
  const rect = field.acroField.getWidgets()[0]?.getRectangle();
  const width = Math.max(1, (rect?.width || 150) - 4);
  const clean = safePDFText(text).replace(/\s+/g, " ").trim();
  applyFieldFontSize(field, font, 9);
  field.disableScrolling();
  let display = clean;
  while (display && font.widthOfTextAtSize(display, 9) > width)
    display = display.slice(0, -1);
  if (display !== clean) {
    while (display && font.widthOfTextAtSize(`${display}…`, 9) > width)
      display = display.slice(0, -1);
    display = `${display.trimEnd()}…`;
  }
  field.setText(display);
}

/** Keep complete bullets in the form, with full explanations in one reference section. */
export function fitSummaryText(
  field: PDFTextField,
  summary: string,
  reference: string,
  font: PDFFont,
  title: string,
  overflow: ContinuationSection[],
) {
  const pending: ContinuationSection[] = [];
  fitFormText(field, summary, font, title, pending);
  if (!pending.length && reference === summary) return;
  const widget = field.acroField.getWidgets()[0];
  const rect = widget?.getRectangle();
  const inset = (widget?.getBorderStyle()?.getWidth() || 0) + 1;
  const bounds = {
    x: 0,
    y: 0,
    width: Math.max(1, (rect?.width || 150) - inset * 2),
    height: Math.max(1, (rect?.height || 80) - inset * 2),
  };
  const descent =
    font.heightAtSize(9) - font.heightAtSize(9, { descender: false });
  const blocks: string[] = [];
  const candidates = summary.split("\n\n").flatMap((paragraph, index) => {
    const parts = paragraph.split(/\n(?=• )/);
    // Keep a category heading with its first bullet, but let subsequent bullets fit independently.
    if (parts.length > 1 && !parts[0].startsWith("• "))
      parts.splice(0, 2, `${parts[0]}\n${parts[1]}`);
    if (index && parts[0]) parts[0] = `\n${parts[0]}`;
    return parts;
  });
  for (const block of candidates) {
    const candidate = [...blocks, block, "Pg. 999 →"].join("\n");
    const lines = layoutMultilineText(candidate, {
      font,
      fontSize: 9,
      alignment: field.getAlignment(),
      bounds,
    }).lines;
    if (
      lines.some((line) => line.y < descent + 0.1 || line.width > bounds.width)
    )
      break;
    blocks.push(block);
  }
  overflow.push({
    title,
    text: safePDFText(reference),
    field,
    preview: blocks.join("\n"),
  });
}
export function fitFormText(
  field: PDFTextField,
  text: string,
  font: PDFFont,
  title: string,
  overflow: ContinuationSection[],
  compact = false,
) {
  applyFieldFontSize(field, font, 9);
  const clean = safePDFText(text);
  const widgets = field.acroField.getWidgets();
  const rect = widgets[0]?.getRectangle();
  if (!rect || !clean) {
    field.setText(clean);
    return;
  }
  const border = widgets[0]?.getBorderStyle()?.getWidth() || 0;
  const inset = border + (field.isCombed() ? 0 : 1);
  const width = Math.max(1, rect.width - (compact ? 0 : inset * 2));
  const height = Math.max(1, rect.height - inset * 2);
  const multiline = field.isMultiline();
  if (compact) field.setAlignment(TextAlignment.Center);
  // All content is preserved at a readable size, even when the original box is small.
  for (
    let size = Math.min(11, Math.max(9, height / 1.2));
    size >= 9;
    size -= 0.5
  ) {
    const descent =
      font.heightAtSize(size) - font.heightAtSize(size, { descender: false });
    const maxRows = Math.max(
      0,
      Math.floor((height - descent) / (font.heightAtSize(size) * 1.2)),
    );
    const fits = multiline
      ? wrapPDFText(clean, font, size, width - 0.1).length <= maxRows &&
        layoutMultilineText(clean, {
          font,
          fontSize: size,
          alignment: field.getAlignment(),
          bounds: { x: 0, y: 0, width, height },
        }).lines.every((line) => line.y >= descent + 0.1 && line.width <= width)
      : !clean.includes("\n") && font.widthOfTextAtSize(clean, size) <= width;
    if (fits) {
      field.setText(clean);
      applyFieldFontSize(field, font, size);
      field.disableScrolling();
      return;
    }
  }
  applyFieldFontSize(field, font, 9);
  field.disableScrolling();
  field.setText("");
  const lineHeight = font.heightAtSize(9) * 1.2;
  const descent =
    font.heightAtSize(9) - font.heightAtSize(9, { descender: false });
  const rows = multiline
    ? Math.max(0, Math.floor((height - descent) / lineHeight) - 1)
    : 0;
  const preview = rows
    ? wrapPDFText(clean, font, 9, width - 0.1)
        .slice(0, rows)
        .join("\n")
    : "";
  overflow.push({ title, text: clean, field, preview });
}

/** Fill consecutive boxes with complete entries; only the unread remainder goes to an appendix. */
export function fitAcrossFormFields(
  pdf: PDFDocument,
  fields: PDFTextField[],
  text: string,
  font: PDFFont,
  title: string,
  overflow: ContinuationSection[],
  locale: PDFLocale,
  spaced = false,
) {
  const blocks: { heading: string; body: string }[] = [];
  let heading = "";
  for (const paragraph of safePDFText(text).split("\n\n")) {
    const parts = paragraph.split(/\n(?=• )/);
    if (parts.length > 1 && !parts[0].startsWith("• "))
      heading = parts.shift()!;
    for (const body of parts) {
      if (!body.trim()) continue;
      if (!body.startsWith("• ") && blocks.length)
        blocks[blocks.length - 1].body += `\n\n${body}`;
      else blocks.push({ heading, body });
    }
  }
  const render = (items: typeof blocks) => {
    let previous = "";
    return items
      .map((item, index) => {
        const prefix =
          item.heading && item.heading !== previous ? `${item.heading}\n` : "";
        const separator = index
          ? spaced || item.heading !== previous
            ? "\n\n"
            : "\n"
          : "";
        previous = item.heading;
        return `${separator}${prefix}${item.body}`;
      })
      .join("");
  };
  const fits = (field: PDFTextField, value: string) => {
    const widget = field.acroField.getWidgets()[0];
    const rect = widget?.getRectangle();
    const inset = (widget?.getBorderStyle()?.getWidth() || 0) + 1;
    const bounds = {
      x: 0,
      y: 0,
      width: Math.max(1, (rect?.width || 150) - inset * 2),
      height: Math.max(1, (rect?.height || 80) - inset * 2),
    };
    const descent =
      font.heightAtSize(9) - font.heightAtSize(9, { descender: false });
    return layoutMultilineText(value, {
      font,
      fontSize: 9,
      alignment: field.getAlignment(),
      bounds,
    }).lines.every(
      (line) => line.y >= descent + 0.1 && line.width <= bounds.width,
    );
  };
  let remaining = blocks;
  for (const [index, field] of fields.entries()) {
    applyFieldFontSize(field, font, 9);
    field.disableScrolling();
    const complete = render(remaining);
    if (!complete || fits(field, complete)) {
      field.setText(complete);
      remaining = [];
      continue;
    }
    const next = fields[index + 1];
    const pageRef = next?.acroField.getWidgets()[0]?.dict.get(PDFName.of("P"));
    const pageIndex = pageRef
      ? pdf
          .getPages()
          .findIndex((page) => page.ref.toString() === pageRef.toString())
      : -1;
    const marker = next
      ? pageIndex >= 0
        ? `${locale === "hr" ? "Str." : "Pg."} ${pageIndex + 1} →`
        : locale === "hr"
          ? "Dodatne sposobnosti →"
          : "Additional features →"
      : "Pg. 999 →";
    let count = 0;
    while (
      count < remaining.length &&
      fits(
        field,
        [render(remaining.slice(0, count + 1)), marker]
          .filter(Boolean)
          .join("\n"),
      )
    )
      count++;
    const preview = render(remaining.slice(0, count));
    remaining = remaining.slice(count);
    if (next) field.setText([preview, marker].filter(Boolean).join("\n"));
    else
      overflow.push({
        title,
        text: render(remaining),
        field,
        preview,
        appendToPreview: true,
        fixedText: complete,
      });
  }
  if (!fields.length && text) overflow.push({ title, text });
}

export function removeGeneratedPages(pdf: PDFDocument) {
  for (let i = pdf.getPageCount() - 1; i >= 0; i--) {
    if (pdf.getPage(i).node.has(continuationMarker)) pdf.removePage(i);
  }
}

/** Fixed-page exports keep complete values editable, and report any unprintable excess. */
export function fitFixedFormText(
  field: PDFTextField,
  text: string,
  font: PDFFont,
  label: string,
  report: PDFLayoutReport,
  locale: PDFLocale,
) {
  const widget = field.acroField.getWidgets()[0];
  const rect = widget?.getRectangle();
  const inset = (widget?.getBorderStyle()?.getWidth() || 0) + 1;
  const bounds = {
    x: 0,
    y: 0,
    width: Math.max(1, (rect?.width || 150) - inset * 2),
    height: Math.max(1, (rect?.height || 80) - inset * 2),
  };
  const value = safePDFText(text);
  for (let size = 9; size >= 6.5; size -= 0.25) {
    const descent =
      font.heightAtSize(size) - font.heightAtSize(size, { descender: false });
    const fits = field.isMultiline()
      ? wrapPDFText(value, font, size, bounds.width).length <=
          Math.floor(
            (bounds.height - descent - 0.1) / (font.heightAtSize(size) * 1.2),
          ) &&
        layoutMultilineText(value, {
          font,
          fontSize: size,
          alignment: field.getAlignment(),
          bounds,
        }).lines.every(
          (line) => line.y >= descent + 0.1 && line.width <= bounds.width,
        )
      : !value.includes("\n") &&
        font.widthOfTextAtSize(value, size) <= bounds.width;
    if (fits) {
      applyFieldFontSize(field, font, size);
      field.disableScrolling();
      field.setText(value);
      report.smallestFont = Math.min(report.smallestFont, size);
      return;
    }
  }
  applyFieldFontSize(field, font, 6.5);
  field.setText(value);
  field.enableScrolling();
  report.smallestFont = Math.min(report.smallestFont, 6.5);
  report.warnings.push(
    locale === "hr"
      ? `${label}: tekst prelazi područje za ispis; cijeli je tekst sačuvan u polju i podacima lika.`
      : `${label}: text exceeds the printable box; the full text is preserved in its editable field and character data.`,
  );
}

/** Draw only printable rows for oversized fields, while retaining their complete editable value. */
export function updateFixedTextAppearance(field: PDFTextField, font: PDFFont) {
  field.updateAppearances(font, (actual, widget, appearanceFont) => {
    const rect = widget.getRectangle(),
      inset = (widget.getBorderStyle()?.getWidth() || 0) + 1;
    const size =
      Number(
        / ([\d.]+) Tf/.exec(
          String(
            widget.dict.get(PDFName.of("DA")) ||
              actual.acroField.getDefaultAppearance(),
          ),
        )?.[1],
      ) || 6.5;
    const descent =
      appearanceFont.heightAtSize(size) -
      appearanceFont.heightAtSize(size, { descender: false });
    const rows = Math.max(
      0,
      Math.floor(
        (rect.height - inset * 2 - descent - 0.1) /
          (appearanceFont.heightAtSize(size) * 1.2),
      ),
    );
    const wrapped = wrapPDFText(
      actual.getText() || "",
      appearanceFont,
      size,
      Math.max(1, rect.width - inset * 2 - 0.1),
    );
    const display = Object.create(actual) as PDFTextField;
    display.getText = () => wrapped.slice(0, rows).join("\n");
    return defaultTextFieldAppearanceProvider(display, widget, appearanceFont);
  });
}

/** Fill the original spell widgets without drawing, moving, wrapping or shrinking rows. */
export function formatSpellRow(entry: ReferenceEntry, locale: PDFLocale) {
  const spell = entry.spell;
  if (!spell) return entry.text.replace(/\s*\n\s*/g, " / ") || entry.title;
  const abilities: Record<string, string> =
    locale === "hr"
      ? {
          Strength: "SNA",
          Dexterity: "SPR",
          Constitution: "IZD",
          Intelligence: "INT",
          Wisdom: "MUD",
          Charisma: "KAR",
        }
      : {
          Strength: "STR",
          Dexterity: "DEX",
          Constitution: "CON",
          Intelligence: "INT",
          Wisdom: "WIS",
          Charisma: "CHA",
        };
  const effect = (
    spell.saveAbility
      ? abilities[spell.saveAbility] || spell.saveAbility
      : spell.attackKind
        ? `${locale === "hr" ? "napad" : "spell atk"}: ${spell.attackKind === "ranged" ? (locale === "hr" ? "daljina" : "ranged") : locale === "hr" ? "bliski" : "melee"}`
        : spell.rowEffect
          ? spell.rowEffect
          : ""
  )
    .replace(/^(?:save|effect|učinak):\s*/i, "")
    .replace(/^(STR|DEX|CON|INT|WIS|CHA)\b/i, (value) => value.toUpperCase());
  const time = spell.castingTime
    .split(",")[0]
    .replace(/^(?:1 action|1 radnja)$/i, "1")
    .replace(/^(?:1 bonus action|1 bonus radnja)$/i, "bonus")
    .replace(/^1 reaction\b.*$/i, "reaction")
    .replace(/^1 reakcija\b.*$/i, "reakcija")
    .replace(/minutes?|minuta/gi, "min")
    .replace(/hours?|sati?/gi, "h");
  const components = spell.components.replace(/\s+/g, "");
  const range = spell.range.replace(/feet|foot|stopa/g, "ft");
  const repeatsName = entry.title
    .split(/[()]/)
    .some(
      (name) =>
        name.trim().toLocaleLowerCase(locale) ===
        effect.trim().toLocaleLowerCase(locale),
    );
  return [
    entry.title,
    repeatsName ? "" : effect,
    spell.target,
    `${time || "?"}${components ? ` (${components})` : ""}`,
    spell.damage,
    range,
  ]
    .filter(Boolean)
    .join(" | ");
}

/** The 2014 form's field IDs are stable; row ordering follows the original coordinates. */
function originalSpellLevel(name: string) {
  const suffix = Number(name.replace(/^Spells 10/, ""));
  const index = suffix >= 1010 ? suffix - 900 : suffix;
  if (index === 14 || (index >= 16 && index <= 22)) return 0;
  if (index === 15 || (index >= 23 && index <= 33)) return 1;
  for (const [level, from, to] of [
    [2, 34, 46],
    [3, 47, 59],
    [4, 60, 72],
    [5, 73, 81],
    [6, 82, 90],
    [7, 91, 99],
    [8, 100, 106],
    [9, 107, 113],
  ])
    if (index >= from && index <= to) return level;
  return -1;
}

export function fillOriginalSpellRows(
  fields: PDFField[],
  font: PDFFont,
  sections: ContinuationSection[],
  report: PDFLayoutReport,
  locale: PDFLocale,
) {
  const rows = fields.filter(
    (field): field is PDFTextField =>
      field instanceof PDFTextField && /^Spells /i.test(field.getName()),
  );
  const entries = sections.flatMap((section) => section.entries || []);
  const checks = fields.filter(
    (field): field is PDFCheckBox => field instanceof PDFCheckBox,
  );
  const rowCheck = (field: PDFTextField) => {
    if (originalSpellLevel(field.getName()) === 0) return undefined;
    const widget = field.acroField.getWidgets()[0],
      box = widget?.getRectangle(),
      pageRef = widget?.dict.get(PDFName.of("P"))?.toString();
    if (!box) return undefined;
    return checks.find((check) =>
      check.acroField.getWidgets().some((w) => {
        const r = w.getRectangle();
        return (
          w.dict.get(PDFName.of("P"))?.toString() === pageRef &&
          box.x - r.x >= -2 &&
          box.x - r.x <= 18 &&
          Math.abs(r.y + r.height / 2 - box.y - box.height / 2) < 5
        );
      }),
    );
  };
  for (const row of rows) {
    row.disableMultiline();
    row.enableScrolling();
    row.setText("");
    rowCheck(row)?.uncheck();
    applyFieldFontSize(row, font, 9);
    row.setAlignment(TextAlignment.Left);
  }
  const rect = (field: PDFField) =>
    field.acroField.getWidgets()[0]?.getRectangle();
  for (let level = 0; level <= 9; level++) {
    const slots = rows
      .filter((row) => originalSpellLevel(row.getName()) === level)
      .sort((a, b) => (rect(b)?.y || 0) - (rect(a)?.y || 0));
    const choices = entries.filter(
      (entry) => entry.spell?.levelNumber === level,
    );
    if (!choices.length) continue;
    if (!slots.length) {
      report.warnings.push(
        locale === "hr"
          ? `Razina ${level}: predložak nema redaka; odluke su sačuvane u podacima lika.`
          : `Level ${level}: the template has no rows; decisions remain in the character data.`,
      );
      continue;
    }
    slots.forEach((field, index) => {
      const selected =
        index === slots.length - 1
          ? choices.slice(index)
          : choices.slice(index, index + 1);
      if (!selected.length) return;
      field.setText(
        selected.map((entry) => formatSpellRow(entry, locale)).join(" || "),
      );
      field.acroField.dict.set(
        PDFName.of("TU"),
        PDFHexString.fromText(selected.map((entry) => entry.title).join(" / ")),
      );
      const checkbox = rowCheck(field);
      if (checkbox) {
        if (selected.some((entry) => entry.spell?.prepared)) checkbox.check();
        else checkbox.uncheck();
      }
    });
    if (choices.length > slots.length)
      report.warnings.push(
        locale === "hr"
          ? `Razina ${level}: ${choices.length} čarolija / ${slots.length} izvornih redaka; dodatni zapisi ostaju u zadnjem retku.`
          : `Level ${level}: ${choices.length} spells / ${slots.length} original rows; additional entries remain in the final row.`,
      );
  }
  const unknown = entries.filter(
    (entry) => entry.spell?.levelNumber === undefined,
  );
  if (unknown.length) {
    const freeRows = rows.filter((row) => !row.getText());
    const free = freeRows[freeRows.length - 1];
    if (free)
      free.setText(
        unknown
          .map((entry) => `? | ${formatSpellRow(entry, locale)}`)
          .join(" || "),
      );
    report.warnings.push(
      locale === "hr"
        ? "Uvezenim čarolijama nedostaje potvrđena razina; izvorni tekst ostaje sačuvan."
        : "Imported spells lack a confirmed level; their original text is preserved.",
    );
  }
}

export function addContinuationPages(
  pdf: PDFDocument,
  font: PDFFont,
  sections: ContinuationSection[],
  characterName: string,
  locale: PDFLocale,
) {
  const margin = 42;
  const width = 612;
  const height = 792;
  const textSize = 10;
  const lineHeight = 14;
  let page: PDFPage | undefined;
  let y = 0;
  const newPage = (title: string) => {
    page = pdf.addPage([width, height]);
    page.node.set(continuationMarker, PDFName.of("V2"));
    page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(1, 1, 1) });
    page.drawText(
      locale === "hr" ? "DODATAK LISTU LIKA" : "CHARACTER SHEET CONTINUATION",
      {
        x: margin,
        y: height - 39,
        size: 9,
        font,
        color: rgb(0.35, 0.35, 0.35),
      },
    );
    const name = wrapPDFText(
      characterName ||
        (locale === "hr" ? "Neimenovani lik" : "Unnamed character"),
      font,
      14,
      width - margin * 2,
    )[0];
    page.drawText(name, { x: margin, y: height - 61, size: 14, font });
    let titleY = height - 86;
    for (const line of wrapPDFText(title, font, 11, width - margin * 2)) {
      page.drawText(line, { x: margin, y: titleY, size: 11, font });
      titleY -= 15;
    }
    page.drawLine({
      start: { x: margin, y: titleY + 5 },
      end: { x: width - margin, y: titleY + 5 },
      thickness: 0.6,
      color: rgb(0.4, 0.4, 0.4),
    });
    page.drawText(
      `${locale === "hr" ? "Stranica" : "Page"} ${pdf.getPageCount()} • ${locale === "hr" ? "PHB 2014 • nastavak bez skraćivanja" : "PHB 2014 • full content continuation"}`,
      { x: margin, y: 23, size: 8, font, color: rgb(0.4, 0.4, 0.4) },
    );
    y = titleY - 15;
  };
  for (const section of sections) {
    const firstLines = wrapPDFText(
      section.text.split("\n\n")[0],
      font,
      textSize,
      width - margin * 2,
    ).length;
    const firstBlockHeight = Math.min(firstLines, 20) * lineHeight + 48 + 47;
    if (!page || section.pageBreakBefore || y < Math.max(130, firstBlockHeight))
      newPage(section.title);
    else {
      y -= 20;
      page.drawLine({
        start: { x: margin, y: y + 12 },
        end: { x: width - margin, y: y + 12 },
        thickness: 0.4,
        color: rgb(0.65, 0.65, 0.65),
      });
      for (const line of wrapPDFText(
        section.title,
        font,
        11,
        width - margin * 2,
      )) {
        page.drawText(line, { x: margin, y, size: 11, font });
        y -= 16;
      }
      y -= 8;
    }
    const firstPage = pdf.getPageCount();
    if (section.field) {
      const rect = section.field.acroField.getWidgets()[0]?.getRectangle();
      const marker =
        locale === "hr" ? `Str. ${firstPage} →` : `Pg. ${firstPage} →`;
      const lines = wrapPDFText(
        marker,
        font,
        9,
        Math.max(1, (rect?.width || 150) - 4),
      );
      const text = [section.preview, ...lines]
        .filter(Boolean)
        .join(section.field.isMultiline() ? "\n" : " ");
      section.field.setText(text);
      applyFieldFontSize(section.field, font, 9);
    }
    if (section.stats?.length) {
      const cellWidth = (width - margin * 2) / section.stats.length;
      section.stats.forEach((stat, index) => {
        const x = margin + index * cellWidth;
        page!.drawRectangle({
          x,
          y: y - 36,
          width: cellWidth,
          height: 47,
          borderWidth: 0.5,
          borderColor: rgb(0.65, 0.65, 0.65),
        });
        page!.drawText(stat.label, {
          x: x + 8,
          y: y - 1,
          size: 8,
          font,
          color: rgb(0.35, 0.35, 0.35),
        });
        for (const [i, line] of wrapPDFText(
          stat.value,
          font,
          10,
          cellWidth - 16,
        ).entries())
          page!.drawText(line, {
            x: x + 8,
            y: y - 17 - i * 12,
            size: 10,
            font,
          });
      });
      y -= 56;
    }
    if (section.entries) {
      const contentWidth = width - margin * 2 - 16;
      const continuedTitle = `${section.title} (${locale === "hr" ? "nastavak" : "continued"})`;
      for (const entry of section.entries) {
        const headingLines = wrapPDFText(entry.title, font, 11, contentWidth);
        const subtitleLines = wrapPDFText(
          entry.subtitle,
          font,
          9,
          contentWidth,
        );
        const metaLines = entry.metadata.flatMap((line) =>
          wrapPDFText(line, font, 9, contentWidth),
        );
        const bodyLines = wrapPDFText(entry.text, font, textSize, contentWidth);
        const noteLines = (entry.notes || []).flatMap((note) =>
          wrapPDFText(note, font, 9, contentWidth),
        );
        const headingHeight =
          headingLines.length * 16 + subtitleLines.length * 13 + 8;
        const fullHeight =
          headingHeight +
          metaLines.length * 13 +
          bodyLines.length * lineHeight +
          noteLines.length * 13 +
          30;
        const minimumHeight =
          headingHeight +
          metaLines.length * 13 +
          Math.min(3, bodyLines.length) * lineHeight +
          16;
        if (y - Math.min(fullHeight, 620) < 47 || y - minimumHeight < 47)
          newPage(continuedTitle);
        const entryPage = pdf.getPageCount();
        for (const index of entry.indexFields || []) {
          const suffix = ` ${locale === "hr" ? "str." : "p."} ${entryPage}`;
          const rect = index.field.acroField.getWidgets()[0]?.getRectangle();
          let label = index.label;
          const fieldWidth = Math.max(1, (rect?.width || 150) - 4);
          while (
            label &&
            font.widthOfTextAtSize(
              `${label}${label === index.label ? "" : "…"}${suffix}`,
              9,
            ) > fieldWidth
          )
            label = label.slice(0, -1);
          applyFieldFontSize(index.field, font, 9);
          index.field.disableScrolling();
          index.field.setText(
            `${label.trimEnd()}${label === index.label ? "" : "…"}${suffix}`,
          );
          index.field.acroField.dict.set(
            PDFName.of("TU"),
            PDFHexString.fromText(
              `${entry.title} - ${locale === "hr" ? "stranica" : "page"} ${entryPage}`,
            ),
          );
        }
        const drawHeading = (continued = false) => {
          const lines = continued
            ? wrapPDFText(
                `${entry.title} (${locale === "hr" ? "nastavak" : "continued"})`,
                font,
                11,
                contentWidth,
              )
            : headingLines;
          const h = lines.length * 16 + subtitleLines.length * 13 + 8;
          page!.drawRectangle({
            x: margin,
            y: y - h + 13,
            width: width - margin * 2,
            height: h,
            color: rgb(0.94, 0.94, 0.94),
          });
          for (const line of lines) {
            page!.drawText(line, { x: margin + 8, y, size: 11, font });
            y -= 16;
          }
          for (const line of subtitleLines) {
            page!.drawText(line, {
              x: margin + 8,
              y,
              size: 9,
              font,
              color: rgb(0.3, 0.3, 0.3),
            });
            y -= 13;
          }
          y -= 9;
        };
        const drawLine = (line: string, size: number, leading: number) => {
          if (y < 47) {
            newPage(continuedTitle);
            drawHeading(true);
          }
          if (line) page!.drawText(line, { x: margin + 8, y, size, font });
          y -= leading;
        };
        drawHeading();
        for (const line of metaLines) drawLine(line, 9, 13);
        y -= 7;
        for (const line of bodyLines) drawLine(line, textSize, lineHeight);
        if (noteLines.length) y -= 5;
        for (const line of noteLines) drawLine(line, 9, 13);
        y -= 18;
      }
      continue;
    }
    for (const paragraph of safePDFText(section.text).split("\n\n")) {
      const lines = wrapPDFText(paragraph, font, textSize, width - margin * 2);
      // Keep short feature/spell blocks together instead of stranding their headings.
      if (
        lines.length <= 20 &&
        y - lines.length * lineHeight < 47 &&
        y < height - 116
      )
        newPage(
          `${section.title} (${locale === "hr" ? "nastavak" : "continued"})`,
        );
      for (const line of lines) {
        if (y < 47)
          newPage(
            `${section.title} (${locale === "hr" ? "nastavak" : "continued"})`,
          );
        if (line) page!.drawText(line, { x: margin, y, size: textSize, font });
        y -= lineHeight;
      }
      y -= 8;
    }
  }
}
