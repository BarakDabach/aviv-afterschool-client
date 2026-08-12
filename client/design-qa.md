# Landing Page Design QA

Reference: `../mockups/landing-page.png`
Prototype: `http://127.0.0.1:4200/`
Screenshot: `landing-page-screenshot.png`

Checks completed:
- RTL document direction is active.
- Hero copy is on the left and generated garden artwork is on the right, matching the reference layout.
- Generated hero and footer foliage assets load successfully.
- Spartan button and accordion primitives are wired, and Tailwind scans `libs/ui`.
- Primary CTAs now use the smaller height and width proportions from the mockup.
- Section titles and the final CTA title include the leaf divider artwork from the mockup style.
- Typography has been reduced across hero, sections, plan rows, steps, accordion, and footer CTA.
- Accordion rows render as collapsed landing-page rows with a single custom left chevron.
- Browser console check returned no errors.
- Global RTL audit passed: `html`, `body`, registration header, form fields, and Spartan radio groups compute as `direction: rtl`.
- Landing layout QA passed after restoring the hero copy/artwork to the same grid row and verifying desktop/mobile screenshots have no horizontal overflow.

Remaining polish:
- The generated hero art is close in mood and palette, not a pixel-perfect crop of the mockup.

Final result: passed

---

# Cross-App Sizing and RTL QA

Screens:
- `http://127.0.0.1:4200/`
- `http://127.0.0.1:4200/registration`
- `http://127.0.0.1:4200/my-registrations`

Checks completed:
- Shared sizing tokens are defined globally and used by landing, registration, stage cards, inputs, buttons, and my-registrations screens.
- Mobile and desktop browser audit passed with no console errors.
- Mobile and desktop browser audit found no horizontal overflow.
- `html`, `body`, page shells, headers, primary sections, form fields, and Spartan primitive containers compute as `direction: rtl`.
- Source scan found no explicit `direction: ltr`, `dir="ltr"`, or `text-align: left` rules in `client/src`.

Final result: passed

---

# Registration Flow Design QA

References:
- `../mockups/registration-step-1-sibling-reuse-details.png`
- `../mockups/registration-step-2-sibling-shared-contract.png`
- `../mockups/registration-step-3-sibling-shared-uploads.png`
- `../mockups/registration-step-4-sibling-summary.png`

Prototype: `http://127.0.0.1:4200/registration`
Screenshot: `registration-step-1-screenshot.png`

Checks completed:
- Landing registration CTA navigates to a dedicated `/registration` screen.
- Registration flow is mobile-first and constrained to the parent mockup width.
- Header order matches the registration mockups: logo on the right, back/exit action on the left.
- Full new-registration flow is implemented from scratch: parent, child, plan, contract, documents, summary.
- Progress header now reflects six implemented phases.
- Parent details screen includes identity context, parent contact fields, secondary contact fields, update/privacy hint, and Spartan input primitives.
- Child details screen includes child identity fields, class/gan field, allergy segmented control, and medical privacy hint.
- Child details screen starts as a fresh registration with blank `ילד 1` fields, not a prefilled existing child.
- Add another child creates a blank `ילד 2` form, and remove returns the phase to a single-child fresh state.
- Allergy and sensitivity questions are now individual per child; selecting a value for `ילד 2` does not change `ילד 1`.
- Plan selection screen includes full/three-day Spartan radio options and insurance note.
- Contract screen includes single-child contract summary, contract paper, download/open actions, signature area, date, and confirmation.
- Documents screen includes standing-order file, insurance upload area, and manual review hint.
- Summary screen includes submitted/pending status, family summary, registration status rows, download and registrations-list actions.
- Interactive primitives use Spartan NG (`hlmBtn`, `hlmInput`, `hlm-radio-group`, `hlm-radio`, `hlm-checkbox`).
- Landing plan rows are static preview cards; registration plan rows use the reusable `app-selection-mark` component for the selected/unselected radio mark.
- Browser console check returned no errors.
- Children fresh-registration QA returned no console errors and verified empty child values, placeholders, add-child, and remove-child behavior.
- Children allergy QA returned no console errors and verified independent Spartan radio groups per child.
- Plan selection QA returned no console errors and verified landing renders static plan cards while registration keeps the interactive shared selection mark.
- Parent/children update QA returned no console errors: parent extra contact is manually revealed, parent header text computes RTL/start, child titles/cards reflect typed first names, first child can be removed, gan/class and allergy info box are removed, and save-later navigates to the final state.
- Registration flow simplification QA returned no console errors: progress is reduced to four phases, plan/contract/documents are merged into `מסלול ואישורים`, summary remains the final phase, and the parent verification/update card is horizontally aligned on desktop.
- Parent identity card alignment QA returned no console errors and verified the `פרטי ההורה הראשי` icon/text spacing on desktop and mobile.
- Registration requirements audit passed: removed non-required email, optional extra contact, child birth date, signer-name field, contract/document checkboxes, pre-uploaded standing-order file state, and automatic-updates copy. Parent now asks only for full name and mobile phone; child asks for full name and per-child allergies.
- Sizing and spacing QA passed: reduced oversized my-registration headings/cards/icons/buttons, tightened upload boxes, and added more vertical separation between merged registration sections and bottom actions.
- Registration refinement QA passed: parent and child personal-details labels align RTL, parent verification card appears before inputs, child date of birth was added to the form and requirements, approval plan/child cards use compact global sizing, and plan option content widths are consistent.
- Approval simplification QA passed: mobile plan selection marks stay circular, online signature UI was removed, signed contract is uploaded with the approval documents, and manual-review copy is generic.

Remaining polish:
- Some illustrative line icons are closest Lucide matches rather than custom generated parent/child artwork.
- Signature rendering is a styled placeholder until signature capture logic is added.

Final result: passed

---

# My Registrations Design QA

Reference: `../mockups/parent-my-registrations-list.png`
Prototype: `http://127.0.0.1:4200/my-registrations`
Screenshot: `my-registrations-final-mobile.png`

Checks completed:
- Dedicated `/my-registrations` route renders the `ההרשמות שלי` screen.
- Landing `ההרשמה שלי` link navigates to the new screen.
- Header, parent identity card, two registration cards, primary CTA, lookup link, and footer foliage match the selected mock structure.
- Registration card details are aligned on the right and status chips are aligned on the left, matching the RTL mock.
- Spartan button primitives are used for the primary and card actions.
- Browser console check returned no errors.
- Mobile capture has no horizontal overflow.

Remaining polish:
- Child face artwork uses the closest existing line icon from the app icon library instead of custom illustrated portraits.

Final result: passed

---

# Parent Login Design QA

Reference: `../mockups/parent-registration-lookup.png`
Prototype: `http://127.0.0.1:4200/parent-login`

Checks completed:
- Dedicated `/parent-login` route renders the parent phone lookup screen.
- Header, brand mark, back action, title, helper card, phone field, primary lookup CTA, new-registration link, privacy note, and footer foliage match the mock structure.
- Existing parent lookup entry points route through `/parent-login` before the registrations list.
- Spartan button and input primitives are used for the primary action and phone input.
- Browser QA passed on mobile and desktop with no console errors, no horizontal overflow, RTL direction, and lookup CTA navigation to `/my-registrations`.

Final result: passed
