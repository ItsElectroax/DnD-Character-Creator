# 2014 PHB catalog source audit

Audited on 16 October 2026. The application uses original explanations, canonical English option identifiers, and Croatian display explanations. It excludes 2024 rules and later expansion options. This document records coverage rather than certifying every rule as fully implemented.

## Implemented catalog structure

| Category | Entries |
| --- | ---: |
| Races | 9, including the PHB subrace/variant and ten dragon-ancestry branches |
| Classes / class-level rows | 12 / 240 |
| Subclass families | 40 |
| Background families | 13, with Spy, Gladiator, Guild Merchant, Knight and Pirate variant definitions |
| Optional feats | 42 |
| Provisional canonical spell inventory / bilingual summaries | 360 / 360 |
| Spells with checked public 2014 metadata | 360 |
| Spells whose full PHB rules still require verification | 56 |
| Skills / languages | 18 / 16 |
| Weapons / armor and shields | 37 / 13 |
| Equipment packs / starting class equipment groups | 7 / 47 |
| Tools | 37 separate purchasable artisan tools, games, instruments and kits |
| Adventuring gear | 106, including tack, saddle and feed entries |
| Mounts / ordinary services / barding / trade goods | 8 / 7 / 12 / 23 |
| Total purchasable equipment records | 262 |
| Eldritch Invocations | 32 |

The spell inventory is provisional. Its numeric total is **not** an independent completeness check against the licensed PHB index. SRD aliases such as Arcane Hand and Black Tentacles resolve to canonical PHB names without adding duplicate records. Every spell has an individual original summary; a summary does not by itself certify every targeting interaction, component, upcast effect, or subclass interaction as automated.

## Primary sources checked

- [Official Player's Handbook (2014) compendium index](https://www.dndbeyond.com/sources/dnd/phb-2014) and [chapter 11](https://www.dndbeyond.com/sources/dnd/phb-2014/spells): attempted; in this environment they redirect to the marketplace. No local PHB copy was supplied.
- [Official PHB errata, version 3.0](https://media.wizards.com/2021/dnd/downloads/PH-Errata.pdf): checked for the corrected Elemental Discipline prerequisites and action type, subclass changes, feat wording, multiclass rules, spell rules and racial spell recovery.
- [Official Basic Rules (2014), Spells](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/spells): checked spell class-list membership, level, school, casting time, range, components, duration, ritual/concentration and publicly available mechanical effects. The Nystul's Magic Aura index link lacked an accessible description and is not counted as verified metadata.
- [Official Basic Rules (2014), Equipment](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/equipment): checked weapons, armor, gear, pack contents, tools, mounts, vehicles, ordinary service prices and trade goods. This public version shows the starting-wealth values for Cleric, Fighter, Rogue and Wizard; the remaining class wealth values still need a direct PHB-table comparison.
- [Official Basic Rules (2014), Classes](https://www.dndbeyond.com/sources/dnd/basic-rules-2014/classes): used for the publicly available class progression and class rules. Public coverage is a subset of the PHB.
- [Official SRD 5.1](https://media.wizards.com/2016/downloads/DND/SRD-OGL_V5.1.pdf): located as a supplementary 2014 source. Several proprietary-name spells have public SRD counterparts; those counterparts have not all been individually cross-checked here, so they remain unverified rather than being falsely certified.

## Remaining authority and coverage dependencies

The full licensed PHB index and text must be available to independently reconcile every spell name and confirm the PHB-only race, feat, background, subclass and starting-equipment text. The existing detailed original explanations and independent structural tests do not replace that comparison. The 56 spell entries whose full PHB wording still needs comparison are individually listed by `getCatalogAudit()`; the UI can expose selected unverified spells as unresolved.

The coverage report deliberately stays incomplete while these dependencies remain. It separates missing original explanations and malformed catalog data from source-verification dependencies; a player or DM decision cannot resolve missing implementation. Mechanically relevant support is distinct from reproducing optional narrative tables, such as the PHB's full personality, name and trinket tables; those tables are not copied into this catalog. Player-authored narrative is preserved verbatim.

Static catalog checks cover names, all 240 class rows, all 40 subclass unlock schedules, branch selection counts, discipline/invocation prerequisites, bilingual feat/spell explanations, gear mechanics, starting grants, unique IDs, and verified-spell metadata. Engine and PDF regression tests cover supported calculation and round-trip behavior. Passing those checks does not constitute an exhaustive licensed-book rules audit.

## Spell detail correction

All 56 formerly flagged metadata records were checked against official D&D Beyond school listings on 16 October 2026, using only Legacy rows. All 360 catalog entries now contain the five displayed metadata fields. Concentration and ritual flags were corrected from those same rows. See SPELL_METADATA_AUDIT.md for every updated entry and its primary source. These public listing checks do not certify full original summaries, material costs, targeting exceptions, or higher-slot effects; full PHB review remains open for those 56 entries. The UI distinguishes checked metadata from that remaining review. Canonical class-list and school restrictions now apply even when a full-text review is pending.
