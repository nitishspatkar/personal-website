# Design System: High-End Editorial CV

## 1. Overview & Creative North Star: "The Digital Curator"
This design system is built upon the principle of **The Digital Curator**. Unlike standard resume templates that pack information into dense grids, this system treats professional history as a curated gallery. The "Creative North Star" is to achieve an editorial, high-fashion aesthetic where the content is given room to breathe, and the hierarchy is communicated through masterful typography and tonal shifts rather than structural lines.

We break the "template" look by using intentional white space as a functional element. By leveraging the **Inter** typeface's mathematical precision and a palette of "atmospheric greys," we move away from a "document" feel toward a "bespoke digital experience."

---

## 2. Colors: Atmospheric Sophistication
The palette is a monochrome foundation punctuated by a single, sophisticated accent: **Primary (`#515f74`)**, a muted slate that commands respect without shouting.

*   **Primary & Secondary:** The core of the identity. Use `primary` for key emphasis and `secondary` (`#506076`) for supporting interactive elements.
*   **The "No-Line" Rule:** Standard 1px solid borders are strictly prohibited for sectioning. Use `surface-container-low` (`#f0f4f7`) backgrounds against the main `surface` (`#f7f9fb`) to define areas.
*   **Surface Hierarchy & Nesting:** Create depth by stacking. A card styled in `surface-container-lowest` (`#ffffff`) should sit atop a `surface-container` (`#e8eff3`) section to create a natural, "paper-on-desk" feel.
*   **The Glass & Gradient Rule:** For floating headers or navigation, use a "Glassmorphism" effect: `surface` color at 80% opacity with a `20px` backdrop-blur. 
*   **Signature Textures:** For the main Hero/Header background, apply a subtle linear gradient from `surface` to `primary-container` (`#d5e3fd`) at a 15-degree angle to add a "designer’s touch."

---

## 3. Typography: The Editorial Voice
Typography is the primary architecture of this system. We use **Inter** for its clarity and modern neutral stance.

*   **Display & Headline (The Narrative):** Use `display-md` (2.75rem) for the candidate's name. It should feel authoritative. `headline-sm` (1.5rem) marks major section breaks (Experience, Education).
*   **Body & Labels (The Detail):** `body-md` (0.875rem) is the workhorse for descriptions. Use `label-md` (0.75rem) in `on-surface-variant` (`#566166`) for dates and metadata to create a distinct visual layer from the main text.
*   **Hierarchy through Scale:** Ensure at least a 2-step jump in the typography scale when placing text side-by-side to ensure the layout feels intentional and "designed" rather than accidental.

---

## 4. Elevation & Depth: Tonal Layering
We reject traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface-container tiers. Use `surface-container-high` (`#e1e9ee`) for interactive hover states to indicate "lift."
*   **Ambient Shadows:** If a card must float, use a shadow with a 32px blur, 0px spread, and 4% opacity of the `on-surface` color. This mimics natural light rather than a digital effect.
*   **The "Ghost Border" Fallback:** If a boundary is required for accessibility, use `outline-variant` (`#a9b4b9`) at 15% opacity. It should be felt, not seen.
*   **Glassmorphism:** Navigation bars should use `surface` with a 70% opacity and `backdrop-filter: blur(12px)`. This integrates the content as it scrolls underneath, maintaining the "Digital Curator" aesthetic.

---

## 5. Components: Minimalist Primitives

*   **Buttons:**
    *   **Primary:** `primary` background, `on-primary` text. No border. `md` (0.375rem) corner radius.
    *   **Tertiary:** Transparent background, `primary` text. Use `surface-container-low` on hover.
*   **Chips (Skills/Tags):** Use `surface-container-high` background with `on-surface-variant` text. Avoid borders. The `full` (9999px) radius is preferred for a softer, premium feel.
*   **Cards (Experience Blocks):** No borders, no shadows. Use a vertical spacing of `8` (2.75rem) between blocks. Separate "Company Name" and "Role" using `title-lg` and `body-md` respectively.
*   **Input Fields:** Ghost-style. `surface-container` background with an `outline-variant` "Ghost Border" that transitions to `primary` (2px thickness) only on focus.
*   **The "Timeline" Component:** Avoid the literal "line-and-dot" timeline. Instead, use a wide left margin (Spacing `20`) where dates sit in `label-md`, creating a clean, vertical gutter that guides the eye.

---

## 6. Do’s and Don’ts

### Do:
*   **Embrace Asymmetry:** Align text to the left but allow wide right margins (gutter) to create a sophisticated, unbalanced look.
*   **Use Spacing Scale `12` (4rem):** Use this for padding between major sections (Experience vs. Education) to ensure "breathability."
*   **Contrast Tones:** Pair `surface-container-lowest` cards with `surface-dim` backgrounds for high-impact sections.

### Don’t:
*   **Don't use 100% Black:** Never use `#000000`. Use `on-surface` (`#2a3439`) for maximum readability and a softer, premium feel.
*   **Don't use Dividers:** Never use a horizontal `<hr>` to separate list items. Use spacing (`1.5` to `2`) or a subtle background shift.
*   **Don't Over-round:** Stick to `sm` or `md` radius for professional elements. `xl` and `full` are reserved for "soft" elements like chips or profile photos.