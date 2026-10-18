# Interface color theme

The app uses Radix Colors' dark **Tomato**, **Amber**, and **Sand** scales, with a pure-black OLED canvas. These are color values only; the app does not load an external theme service or change its typography.

## Roles

| Role | Color | Use |
| --- | --- | --- |
| OLED canvas | `#000000` | Page background |
| Sand 1 / 2 | `#111110` / `#191918` | Panels and cards |
| Sand 3 / 4 | `#222221` / `#2A2A28` | Hover and raised controls |
| Sand 6 / 9 | `#3B3A37` / `#6F6D66` | Dividers / interactive borders |
| Sand 12 / 11 | `#EEEEEC` / `#B5B3AD` | Primary / secondary text |
| Tomato 9 / 10 | `#E54D2E` / `#EC6142` | Actions and active outlines / action hover |
| Tomato 11 | `#FF977D` | Error text and warm accent text |
| Amber 9 | `#FFC53D` | Selected choices, completed stages, saved status |
| White | `#FFFFFF` | Hovered selected choices |
| Purple to cyan | `#C4B5FD` → `#67E8F9` | Exotic-language badge only |

Bright fills use dark `#111110` text. The selected state remains visible through checkboxes, check marks, or pressed states as well as color. The gradient badge keeps dark text even inside selected or hovered language cards. Errors and successful states also have explicit text or symbols.

All shared color roles are defined at the top of `src/ui/styles.css`. Cards, fields, navigation, alerts, the PDF bridge and stat wheel use those same roles.

## Motion

Eligible option cards lift by 2 pixels, grow by roughly 2%, and tilt up to 3.5 degrees toward the pointer. A translucent local white spotlight follows the pointer: 18% white on selected cards and 7% on unselected cards, fading to transparent at its edge. Hover settles into a slow 3.2-second breathing cycle.

A broad, angular glass ribbon follows pointer position and changes angle with tilt. The ribbon has a uniform 12% white face, softened cut edges (up to 18% white), and a fine parallel highlight. A thinner secondary glint with a uniform 6% white face fades into view as the card tilts toward the lower-right lighting angle. A restrained inner rim adds a glass edge. Reflection layers are clipped inside each surface and do not intercept clicks or enter accessible names.

Pressing briefly compresses the card, then rebounds and settles. A click sends a white circular front from its origin, followed 100 milliseconds later by amber for selected choices. Deselection returns to the neutral surface. These effects use presentation state only; they do not change character selections.

Hover lighting fades out over 100 milliseconds during the click wave. If the pointer remains over the option, the glow returns over 650 milliseconds and the glass reflection returns over 400 milliseconds. Pointer departure fades the lighting out and prevents a delayed reappearance.

Stage navigation first swipes visible outgoing choices left in row order, then brings incoming rows in from the right. Navigation is temporarily disabled, and the stage heading receives focus. Reduced-motion preferences bypass pointer motion and stage transitions; touch receives the click response without hover tilt or breathing.

## Welcome screen

Each fresh page load opens a welcome scene. Five flat red circles drift behind the OLED canvas with heavy blur. The large welcome title enters letter by letter from left to right, then follows a slow wave; the description fades down, and start options enter from the right. Desktop uses two columns; narrow screens stack the sections.

New, JSON import, and PDF import use the existing character and recovery paths. A meaningful saved browser draft adds Continue saved character. Invalid or cancelled imports stay on the welcome screen. PDF imports retain the review dialog before replacing the build. Language selection uses the same control as the builder; player-authored names are preserved.

After a start choice, the welcome scene exits for 420 milliseconds. The builder's left and right groups enter from their respective sides, with the stage rail and panel entering from the right. Entry classes are removed after 1.1 seconds so later stage animations stay independent. Reduced-motion settings bypass the transition delay, letter wave, and drifting bubbles. These screen states are not stored in the character model.

## Dropdowns

Dropdowns use the same black panels, gray dividers, amber accents, and inherited UI font as the granted-training box. Character actions use flat, left-aligned rows instead of separate button tiles. Select menus use customizable native pickers where supported, retaining native keyboard selection and typeahead; other browsers keep their native popup with a styled field. Desktop rows are compact, while narrow screens and coarse pointers retain 44-pixel targets.

## References

- [Radix: composing a palette](https://www.radix-ui.com/colors/docs/palette-composition/composing-a-palette)
- [Radix: scale roles](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale)
- [Official Radix dark color definitions](https://github.com/radix-ui/colors/blob/main/src/dark.ts)

The OLED canvas, dark text on solid Tomato actions, white selected hover, and purple/cyan badge are application-specific choices. Font family, character mechanics, and PDF colors are unchanged.
