# Source organization

## Owners

```text
src/
  main.tsx                 Application startup and global initialization
  catalog/                PHB definitions and their localized catalog text
    races.ts              Race cards, profiles, traits and subraces
    classes.ts            Class cards, training, levels, subclasses and choices
    backgrounds.ts        Backgrounds and variants
    proficiencies.ts      Abilities, skills, languages and tool choice lists
    equipment.ts          Weapons, armor, gear, packs and starting equipment
    spells.ts             Spell definitions, names, explanations and aliases
    feats.ts              Feats, prerequisites and options
    audit.ts              Independent inventory and catalog coverage checks
  engine/
    types.ts              Saved character and sheet-entry types
    character.ts          Character initialization, calculations and validation
  i18n/
    engine.ts             Lookup, formatting, language preference and gap tracking
    hr.ts                 Interface dictionary, terminology and sentence patterns
    register.ts           One initialization point for interface and catalog text
    jsx-runtime.ts        Localized JSX adapter; authored text can opt out
    jsx-dev-runtime.ts    Development adapter for the same JSX implementation
  storage/                Draft migration/recovery and stored PDF templates
  pdf/                    Fillable-sheet import/export and fixed-page layout
  ui/
    App.tsx               Application state, navigation and import/export actions
    components/           Reusable controls, inventory editor and welcome screen
    stages/               One component file for each of the nine stages
    motion.ts             Shared pointer and stage animation
    styles.css            Shared visual design
```

## Consolidation

- `data.ts` and `progression.ts` no longer divide race/class information. Each domain owns its summaries and detailed definitions.
- Class training and progression supply the Hit Dice, saves, skill choices and subclass unlocks used in class cards. The Bard retains its concise “Any three skills” presentation. Subclass names come from the subclass definitions.
- Land Circle spell grants now have one definition; the sheet's acquisition-ordered array is derived from that definition.
- Equipment and spell Croatian name supplements have been absorbed into their respective catalogs.
- Translation corrections were resolved into one dictionary, preserving the previous final values and sentence-pattern priority. There are no separate refinement, rule-name, interface-translation or rule-translation patch files.
- Catalog descriptions stay with their catalog. `i18n/register.ts` combines their translations with interface text once. Components do not register translations when imported.
- The former large `main.tsx` is now a startup file. All nine stages use the same extraction pattern; common editors are shared components.
- Imports point to the owning module. No old-path compatibility files or re-export-only layers were added.

## Boundaries

Catalogs define options; the engine calculates the sheet; UI and PDF read those shared results. Storage owns persistence and migration. The character format and PDF payload version are unchanged; the new library uses a separate storage key while preserving legacy keys.

The saved-character library now has its own versioned browser-storage envelope in `storage/drafts.ts`, containing stable entry IDs, timestamps, an active ID and existing version-2 characters. It becomes authoritative after one-time migration of the old draft/recovery slots. Legacy bytes remain preserved; a valid empty library is intentional and never triggers migration again. JSON/PDF character payloads do not contain library IDs. Save/switch/delete/resume operations share this storage owner, including quarantine, write verification and safe merging after a storage failure.

`WelcomeScreen` owns the actions/saved-card view and scroll-edge masks; `App` owns character switching, import confirmation and deletion confirmation. Required-choice completion comes from `isCharacterUnfinished` in the engine. Spell editors, validation and resolved spell output use the same active-source eligibility helpers. Read-only rendering entry options on `App` support the isolated UI audit fixture; normal startup retains the welcome screen.

The standard blank fillable sheet lives in `public/templates/`. `storage/templates.ts` loads it automatically, with an optional browser-stored custom template taking precedence. Importing a character does not replace the export template.

## Player PDF presentation

- Race, class and feat catalogs own each generated feature's sheet destination and any bilingual play-only wording. The engine attaches this metadata to acquired features; PDF formatting does not infer acquisition history or recalculate bonuses. Authored/imported descriptions and notes remain separate.
- Spell definitions own compact row references for effect type and targets alongside their full explanations. Export fills native single-line spell fields with `Name | save/attack/effect | target | casting (components) | damage | range`. Prepared/book duplicates share one record. Full explanations remain in the catalog and app.
- `pdf/characterSheet.ts` maps the calculated sheet and embeds the complete character and visible-field baseline. `pdf/layout.ts` fills original spell widgets without drawing, moving, resizing, wrapping or shrinking their rows. Production exports never append continuation pages. Existing continuation helpers remain for compatibility checks; prior generated pages are removed when an old export is reused.
- Previously redesigned app exports are detected by their spell-overlay marker and returned to the bundled original template before mapping. Fresh exports leave page drawing streams and all widget rectangles unchanged. Preparation checkboxes are matched to their original rows and cleared when the corresponding spells are removed.
- Spell-row overflow is explicitly allowed. When a spell level has more choices than native rows, excess records stay in that level's last field, separated by ` || `; the app reports that capacity limit. Complete field values and the full character remain available even where the native field clips the visible text.
- Layout reports identify text that cannot print completely within the fixed sheet at the minimum size. Its complete editable value and character data are retained; the app displays the report after export. The fixed page count is not a promise that arbitrarily long authored text can all be printed.

The translation engine still supports the existing English-text lookup keys. This reorganization preserves that behavior; it does not claim a complete migration to message IDs or completion of outstanding PHB source reviews.

The original source and test files are preserved under `tmp/source-before-organization/`. Comparison results are in `tmp/source-organization-comparison.json`.
