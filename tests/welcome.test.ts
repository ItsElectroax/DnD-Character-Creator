import test from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import "../src/i18n/register";
import { getLocale, setLocale, t, type Locale } from "../src/i18n/engine";
import {
  WelcomeScreen,
  type SavedCharacterSummary,
} from "../src/ui/components/WelcomeScreen";

const noAction = () => {};
const saved: SavedCharacterSummary = {
  id: "saved-character-one",
  name: "Rage & Štef <Lv 8>",
  race: "Elf",
  lineage: "High Elf",
  classSummary: "Wizard 8",
  updatedAt: "2026-10-18T12:34:56.000Z",
  unfinished: false,
  active: true,
};

function render({
  locale = "en",
  initialView = "actions",
  savedCharacters = [saved],
}: {
  locale?: Locale;
  initialView?: "actions" | "saved";
  savedCharacters?: SavedCharacterSummary[];
} = {}) {
  const previous = getLocale();
  setLocale(locale);
  try {
    return renderToStaticMarkup(
      createElement(WelcomeScreen, {
        locale,
        onLocaleChange: noAction,
        onNew: noAction,
        onJSON: noAction,
        onPDF: noAction,
        savedCharacters,
        onOpenSaved: noAction,
        onDeleteSaved: noAction,
        initialView,
        leaving: false,
        loading: false,
      }),
    );
  } finally {
    setLocale(previous);
  }
}

test("welcome offers exactly four starting actions with the approved import badges", () => {
  const html = render();
  const optionButtons =
    html.match(/class="welcome-option welcome-option-[^"]+"/g) || [];
  assert.equal(optionButtons.length, 4);
  for (const action of ["saved", "new", "json", "pdf"]) {
    assert.ok(html.includes(`class="welcome-option welcome-option-${action}"`));
  }
  for (const title of [
    "Saved characters",
    "Create a new character",
    "Import JSON",
    "Import PDF",
    "Recommended",
    "May need review",
  ]) {
    assert.ok(html.includes(`>${title}<`), title);
  }
  assert.ok(!html.includes("Continue saved character"));
  assert.ok(!html.includes("Restore session"));
  assert.ok(!html.includes("welcome-option-resume"));
  assert.ok(!html.includes("saved-character-scroll"));
});

test("saved view replaces the starting actions and keeps its heading and Back outside the scrolling cards", () => {
  const html = render({ initialView: "saved" });
  assert.ok(
    html.includes('id="welcome-title"'),
    "Welcome copy remains visible",
  );
  assert.ok(html.includes('id="saved-characters-title"'));
  assert.ok(html.includes('class="quiet-button saved-character-back"'));
  assert.ok(html.includes('class="saved-character-scroll"'));
  assert.ok(!html.includes('class="welcome-options"'));
  assert.ok(!html.includes("welcome-option-json"));
  const heading = html.indexOf('class="saved-character-heading"');
  const back = html.indexOf('class="quiet-button saved-character-back"');
  const headerEnd = html.indexOf("</header>", heading);
  const scroll = html.indexOf('class="saved-character-scroll"');
  assert.ok(heading < back && back < headerEnd && headerEnd < scroll);
  assert.ok(
    !html.includes("data-fade-top"),
    "Fade awaits actual measured overflow",
  );
  assert.ok(!html.includes("data-fade-bottom"));
});

test("an empty library gives a useful empty state without a dead continuation action", () => {
  const html = render({ initialView: "saved", savedCharacters: [] });
  assert.ok(html.includes("No saved characters yet."));
  assert.ok(
    html.includes("Create a character or import a file to start your library."),
  );
  assert.ok(html.includes("saved-character-back"));
  assert.ok(!html.includes('class="saved-character-open"'));
  assert.ok(!html.includes('class="saved-character-delete"'));
  assert.ok(!html.includes("Continue saved character"));
});

test("unfinished and active badges reflect each summary independently", () => {
  const html = render({
    initialView: "saved",
    savedCharacters: [
      saved,
      {
        ...saved,
        id: "saved-character-two",
        name: "Incomplete",
        unfinished: true,
        active: false,
      },
    ],
  });
  assert.equal(
    (html.match(/class="saved-character-tag unfinished"/g) || []).length,
    1,
  );
  assert.equal((html.match(/>Current character</g) || []).length, 1);
  assert.equal((html.match(/class="saved-character-open"/g) || []).length, 2);
});

test("each saved character has separate open and named delete buttons without nested controls", () => {
  const html = render({ initialView: "saved" });
  assert.equal((html.match(/class="saved-character-open"/g) || []).length, 1);
  assert.equal((html.match(/class="saved-character-delete"/g) || []).length, 1);
  assert.ok(
    html.includes(
      'aria-label="Delete character: Rage &amp; Štef &lt;Lv 8&gt;"',
    ),
  );
  let buttonDepth = 0;
  for (const tag of html.match(/<\/?button\b[^>]*>/g) || []) {
    buttonDepth += tag.startsWith("</") ? -1 : 1;
    assert.ok(
      buttonDepth >= 0 && buttonDepth <= 1,
      "Buttons must never be nested",
    );
  }
  assert.equal(buttonDepth, 0);
  const open = html.indexOf('class="saved-character-open"');
  const openEnd = html.indexOf("</button>", open);
  const remove = html.indexOf('class="saved-character-delete"');
  assert.ok(open < openEnd && openEnd < remove);
});

test("Croatian saved cards translate interface labels while preserving authored names", () => {
  const html = render({ locale: "hr", initialView: "saved" });
  assert.ok(
    html.includes(
      'data-player-text="true">Rage &amp; Štef &lt;Lv 8&gt;</span>',
    ),
  );
  for (const label of [
    "Back",
    "Saved characters",
    "Choose a character to continue.",
    "Last saved",
    "Current character",
  ]) {
    assert.notEqual(t(label, "hr"), label, `Missing Croatian label: ${label}`);
    assert.ok(html.includes(t(label, "hr")), label);
  }
  assert.ok(
    html.includes('aria-label="Izbriši lika: Rage &amp; Štef &lt;Lv 8&gt;"'),
  );
  assert.ok(!html.includes(">Bijes &amp; Štef"));
});

test("saved cards expose the exact ISO timestamp and a localized readable date", () => {
  for (const locale of ["en", "hr"] as const) {
    const html = render({ locale, initialView: "saved" });
    const expected = new Intl.DateTimeFormat(
      locale === "hr" ? "hr-HR" : "en-GB",
      { dateStyle: "medium", timeStyle: "short" },
    ).format(new Date(saved.updatedAt));
    assert.ok(
      html.includes(
        `<time dateTime="2026-10-18T12:34:56.000Z">${expected}</time>`,
      ),
    );
  }
});
