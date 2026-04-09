# Design System Specification: The Architectural Curator

## 1. Overview & Creative North Star

This design system moves away from the "generic enterprise dashboard" by adopting the **Architectural Curator** philosophy. In a world of cluttered resource management, we prioritize structural clarity, intentional white space, and editorial authority. 

Instead of traditional grids separated by rigid lines, the layout mimics the precision of high-end architectural blueprints. We utilize **Asymmetric Balance**—placing heavy information clusters against expansive, "breathing" negative space—to guide the eye toward critical data without overwhelming the user. The experience should feel like a curated gallery of resources: quiet, premium, and undeniably efficient.

---

## 2. Colors & Tonal Depth

The palette is anchored in trust and stability, utilizing a sophisticated interplay of Deep Blue (`primary`) and Slate Gray (`secondary`).

### The "No-Line" Rule
**Explicit Instruction:** 1px solid borders are prohibited for sectioning. Boundaries must be defined solely through background color shifts. To separate a sidebar from a main content area, use `surface-container-low` against a `background` (or `surface`) base.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-translucent materials. 
- **Base Layer:** `surface` (#f8f9ff) for the widest application area.
- **Sectioning Layer:** `surface-container-low` (#eff4ff) for secondary navigation or grouping.
- **Action Layer:** `surface-container-lowest` (#ffffff) for the highest-priority interactive cards.
- **Active Layer:** `primary-container` (#d7e2ff) to highlight active selections or "in-progress" resources.

### The "Glass & Gradient" Rule
To avoid a flat "bootstrap" appearance, use Glassmorphism for floating panels (e.g., file previews). Use `surface` with a 70% opacity and a `backdrop-filter: blur(20px)`. 
**Signature Texture:** Main Call-to-Actions (CTAs) should utilize a subtle linear gradient from `primary` (#255dad) to `primary-dim` (#1151a0) at a 135-degree angle to provide a "tactile" depth.

---

## 3. Typography

The typography strategy pairs the technical precision of **Inter** with the editorial elegance of **Manrope**.

*   **Display & Headlines (Manrope):** Used for data summaries and page titles. The geometric nature of Manrope adds a "custom-build" feel that differentiates the platform from standard OS-level apps.
*   **Body & Labels (Inter):** Used for resource metadata and navigation. Inter’s high x-height ensures readability at small scales (`label-sm` @ 0.6875rem) for complex file details.

**Hierarchy as Identity:** Use `display-md` for "big numbers" (e.g., total resources) to create an authoritative data-viz aesthetic. Contrast this with `label-md` in `on-surface-variant` for metadata to ensure a clear signal-to-noise ratio.

---

## 4. Elevation & Depth

### Tonal Layering
Depth is achieved by stacking `surface-container` tiers. 
*   **Example:** A file management card (`surface-container-lowest`) sitting inside a resource category folder (`surface-container-low`) provides a soft, natural lift.

### Ambient Shadows
Shadows are reserved only for "floating" elements like Modals or Context Menus. 
*   **Spec:** `box-shadow: 0 12px 32px -4px rgba(0, 52, 94, 0.08);`. Note the shadow uses the `on-surface` color (#00345e) rather than black, creating a natural, light-bleed effect.

### The "Ghost Border" Fallback
If a visual separator is required for accessibility, use the `outline-variant` (#81b5f6) at **15% opacity**. This creates a "suggestion" of a border that guides the eye without cluttering the UI.

---

## 5. Components

### Cards (Resource Objects)
*   **Visuals:** No borders. Use `surface-container-lowest` for the card body. 
*   **Radius:** Use `lg` (0.5rem) for standard cards. 
*   **Content:** Group file icons (PDF, Image, PPT) with `secondary` (#526074) coloring. Upon hover, shift the icon color to `primary` and the card background to `surface-container-high`.

### Buttons
*   **Primary:** `primary` background, `on-primary` text. Applied with a 0.5px "Ghost Border" of `outline-variant`.
*   **Secondary:** `surface-container-high` background. No border.
*   **Tertiary/Ghost:** No background. Text in `primary`. Use for low-emphasis actions like "Cancel" or "Clear Filters."

### Input Fields
*   **Style:** Use `surface-container-low` for the input track. Instead of a 4-sided border, use a 2px bottom-border of `outline` (#477dbb) that transforms to `primary` (#255dad) on focus.
*   **State:** Errors must use `error` (#9f403d) text with an `error-container` (#fe8983) background shift.

### Chips & Filters
*   **Interaction:** Use `secondary-container` for unselected chips. Upon selection, animate to `primary` with `on-primary` text.
*   **Separation:** Do not use dividers between chip groups; use `xl` (2rem) horizontal padding.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use `surface-container-highest` to draw attention to "Pinned" or "Urgent" resources.
*   **Do** prioritize vertical rhythm. Use 8px (0.5rem) increments for all spacing.
*   **Do** use iconography from a single, high-contrast library (e.g., Phosphor or Lucide) with a consistent 2px stroke weight.

### Don't
*   **Don't** use 100% black (#000000) for text. Always use `on-surface` (#00345e) to maintain the "Deep Blue" brand depth.
*   **Don't** use standard "drop shadows" on cards. Rely on the "No-Line" color shifts for containment.
*   **Don't** use generic "folder" icons for everything. Use specific file-type icons with the `secondary` color palette to maintain the "Curated" aesthetic.