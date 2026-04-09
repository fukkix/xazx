# Design System Specification: Architectural Precision & Tonal Depth

## 1. Overview & Creative North Star: "The Digital Monolith"
The Creative North Star for this design system is **"The Digital Monolith."** We are moving away from the "web-page-as-a-document" mental model and toward "web-page-as-architectural-space." By leveraging the deep, structural blues of the primary palette and the slate secondary tones, we create a sense of permanence, trust, and structural integrity.

This system breaks the generic "template" look by favoring **intentional asymmetry** and **tonal layering**. We do not use lines to define space; we use light and mass. The goal is a premium, editorial experience where the "Manrope" typography breathes within expansive, high-contrast layouts that feel curated rather than generated.

---

## 2. Colors: Tonal Authority
Our palette is anchored in a commanding deep blue (`primary: #2e5bb1`) and supported by sophisticated slates. These are not merely colors; they are materials.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to denote a change in context.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of architectural glass.
*   **Surface (Base):** `#faf8ff` – The expansive gallery floor.
*   **Surface-Container-Low:** `#f2f3ff` – Subtle recession for secondary content.
*   **Surface-Container-High:** `#e2e7ff` – Prominence for active workspaces.
*   **Nesting Logic:** Place a `surface-container-lowest` (#ffffff) card atop a `surface-container-low` section to create a soft, natural "lift" without a single line of CSS border.

### The "Glass & Gradient" Rule
To avoid a flat, "Bootstrap" feel:
*   **Signature Gradients:** Use a subtle linear gradient (Top-Left to Bottom-Right) transitioning from `primary` (#2e5bb1) to `primary_dim` (#1e4fa4) for hero CTAs and primary action zones. This adds "soul" and depth.
*   **Glassmorphism:** For floating navigation or overlays, use semi-transparent `surface` colors with a `backdrop-filter: blur(20px)`. This allows the brand’s deep blues to bleed through the interface, maintaining a cohesive atmospheric glow.

---

## 3. Typography: The Editorial Voice
We utilize **Manrope** for its geometric yet approachable character. The hierarchy is designed to feel like a high-end architectural journal.

*   **Display (lg/md/sm):** Used for "Hero" moments. Use `display-lg` (3.5rem) with tight letter-spacing (-0.02em) to create a bold, monolithic statement.
*   **Headline (lg/md/sm):** Your primary navigational anchors. These should always use `on_surface` (#113069) to maintain high-contrast authority.
*   **Title (lg/md/sm):** Used for card headers and subsection titles.
*   **Body (lg/md/sm):** The workhorse. `body-lg` (1rem) is the default for readability.
*   **Labels:** Reserved for metadata. Use `on_surface_variant` (#445d99) to keep them secondary in the visual field.

**Creative Tip:** Use "intentional white space" around headlines. A `headline-lg` should often have double the "standard" padding to emphasize its importance.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are often a crutch for poor spatial planning. In this system, depth is achieved through **Tonal Layering**.

*   **The Layering Principle:** Stacking tiers (e.g., `surface-container-highest` on `surface-dim`) creates a sophisticated sense of 3D space.
*   **Ambient Shadows:** If a component must "float" (like a Modal), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(17, 48, 105, 0.06)`. Note the use of a tinted shadow color (derived from `on_surface`) rather than pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a container edge, use a "Ghost Border": `outline-variant` (#98b1f2) at **15% opacity**. Never use a 100% opaque border.

---

## 5. Components: Structural Elements

### Buttons
*   **Primary:** Solid `primary` (#2e5bb1) with `on_primary` text. Use `md` (0.375rem) corners. No border.
*   **Secondary:** `secondary_container` (#d5e3fc) with `on_secondary_container` text. This provides a soft, professional slate alternative.
*   **Tertiary:** Text-only using `primary` color, with a subtle `surface-variant` background shift on hover.

### Cards & Lists
*   **Strict Rule:** Forbid divider lines. Separate list items using `8px` of vertical white space and a subtle background shift (`surface-container-low`) on the hover state.
*   **Architectural Framing:** Use `xl` (0.75rem) rounded corners for large layout containers and `md` (0.375rem) for smaller interactive elements like buttons and inputs.

### Input Fields
*   **Style:** Minimalist. Use `surface-container-highest` as the fill color. The bottom border is a "Ghost Border" using `outline`. On focus, transition the background to `surface-lowest` and the bottom "line" to `primary`.

### Navigation Rail (Signature Component)
Instead of a top bar, consider a **Navigation Rail** on the left. Use the `primary_dim` (#1e4fa4) for the rail background to create a strong vertical "anchor" that aligns with the architectural theme.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts (e.g., a large headline on the left with body text shifted to a 60% width column on the right).
*   **Do** favor "Overlapping Elements." Let a card partially bleed over a background color transition to create depth.
*   **Do** use `primary_fixed_dim` for subtle accent backgrounds in dark-themed sections.

### Don't:
*   **Don't** use 1px grey borders (`#cccccc`, etc). They break the "monolith" illusion.
*   **Don't** use pure black for text or shadows. Always use the `on_surface` (#113069) or its variants to keep the palette rich and "ink-like."
*   **Don't** cram content. If a section feels full, increase the padding by 1.5x. Architectural design requires breathing room.