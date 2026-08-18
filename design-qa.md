# Admin Dashboard Design QA

## Evidence

- Source visual truth: `mockups/admin-home.png` for brand, color, typography, card treatment, RTL direction, and responsive shell.
- Product hierarchy truth: SDS v9, Screen SR-005. The v9 queue content intentionally replaces the older stage-summary content in the available visual mock.
- Mobile implementation: `admin-dashboard-mobile-viewport.png`.
- Narrow implementation: `admin-dashboard-mobile-320.png`.
- Desktop implementation: `admin-dashboard-desktop.png`.
- Side-by-side evidence: `admin-dashboard-mobile-comparison.png`.
- Route and state: `/admin`, initial state with one expanded registration in each queue.

## Normalization

- Source pixels: 853 x 1844.
- Mobile implementation pixels: 390 x 813, browser viewport width 405 with a 390 CSS-pixel page client area, device scale factor 1.
- Narrow implementation pixels: 320 x 806, 320 CSS-pixel page client area, device scale factor 1.
- Desktop implementation pixels: 1425 x 2194 full page, 1440 x 900 browser viewport, device scale factor 1.
- The side-by-side comparison scales the source and implementation to equal 390px content widths. Content differences are evaluated against SDS v9 rather than the obsolete stage-summary fields in the older mock.

## Required Fidelity Surfaces

- Fonts and typography: Hebrew system stack, weight hierarchy, line height, and RTL wrapping match the established app. Compact admin headings remain readable at 320px.
- Spacing and layout rhythm: two-column mobile metric grid, four-column desktop grid, separated queue sections, indented child surfaces, and expanded/collapsed hierarchy are stable without horizontal overflow.
- Colors and visual tokens: existing background, card, border, brand green, orange warning/primary, success green, and destructive red tokens are reused.
- Image quality and assets: existing brand mark and footer foliage are reused at native quality. No visible source asset is approximated in CSS or markup.
- Copy and content: the screen uses SDS v9 metrics, separate queues, neutral readiness wording, child-specific payment methods, only the two approved document types, and generic Admin identity.

## Interaction Verification

- Expanded and collapsed registration states render independently.
- Individual document approval updates readiness and enables normal registration approval.
- Successful approval removes the registration from its queue and refreshes capacity.
- Waiting-for-documents approval opens an explicit override confirmation.
- Permanent removal opens a distinct destructive confirmation.
- Payment-method controls update child-specific applicability.
- Empty queue states are present.
- No framework error overlay or browser console errors were detected.

## Comparison History

1. Initial comparison found the child-capacity ratio visually reversed by bidirectional text. Added explicit LTR direction for the ratio.
2. The 320px check found the ratio wrapping to two lines. Tightened only the mobile metric-card spacing and icon size; the revised capture keeps `42 / 60` on one line with no horizontal overflow.

## Findings

No actionable P0, P1, or P2 visual differences remain. The larger content height versus the available mock is expected because SDS v9 adds two independent expandable work queues and detailed child/document controls.

Focused-region comparison was performed on the header, metric grid, queue heading, expanded parent row, child payment control, and document-action rows because those surfaces carry the primary fidelity and behavior requirements.

final result: passed
