# Design System Specification - הצהרון של אביב

## 1. Purpose

This document defines the visual and interaction design system for **הצהרון של אביב**.

It is the source of truth for implementing the app UI across:

- Parent/public registration flow.
- Parent "ההרשמה שלי" flow.
- Aviv admin management area.
- Future screens and components.

The application is Hebrew-first and must support full **RTL** layout.

## 2. Design Principles

### Warm and Trustworthy

The app should feel personal, calm, safe, and caring. It manages sensitive child and family registration data, so the UI should avoid aggressive colors, crowded layouts, or overly technical admin styling.

### Mobile First

Most parents will open the app from WhatsApp on a phone. Every primary workflow must be comfortable on a narrow mobile viewport before desktop expansion is considered.

### Clear Progress

Registration is a multi-step process. Parents should always understand:

- Where they are.
- What is already complete.
- What Aviv still needs to check.
- What action is required next.

### Operational But Gentle

The admin area should be denser than the parent flow, but it must preserve the same brand language. Aviv should be able to scan statuses, review documents, and manage registrations without the interface feeling cold or enterprise-heavy.

## 3. Language and Direction

- Primary language: Hebrew.
- Text direction: `rtl`.
- Layout direction: right-to-left.
- Primary content alignment: right aligned.
- Numeric values may remain visually neutral, but should be embedded in RTL text naturally.
- Avoid English UI strings except technical filenames uploaded by users.

Recommended root attributes:

```html
<html lang="he" dir="rtl">
```

## 4. Brand Identity

### Product Name

Use the exact app name:

**הצהרון של אביב**

### Logo

The current visual language uses a simple sun-and-leaves mark:

- Sun in warm orange/yellow.
- Leaves in olive green.
- Friendly, organic shape.
- Usually placed at the top-right next to the app name.

### Visual Motif

Use soft botanical decorations:

- Bottom left and bottom right leafy illustrations.
- Small orange flowers.
- Pale rolling hill shape near the footer.
- Decorative botanical elements must never block text or controls.

Avoid using unrelated stock photography in form/admin screens.

## 5. Color System

Use semantic design tokens rather than hardcoded values in components.

### Core Palette

| Token | Hex | Usage |
|---|---:|---|
| `--color-bg` | `#fffaf3` | Main app background |
| `--color-surface` | `#f7f3e8` | Soft cards, info bands |
| `--color-surface-strong` | `#efe9d8` | Highlight panels |
| `--color-border` | `#d8cdb8` | Card/input dividers |
| `--color-border-strong` | `#2f5f32` | Selected outlines |
| `--color-text` | `#183f36` | Main text |
| `--color-heading` | `#0f4a2f` | Titles and section headings |
| `--color-muted` | `#6e756b` | Helper text |
| `--color-primary` | `#f58220` | Main CTA buttons |
| `--color-primary-hover` | `#e87416` | CTA hover/pressed |
| `--color-success` | `#4f7f38` | Completed/check states |
| `--color-warning` | `#9a6a0a` | Pending/review states |
| `--color-warning-bg` | `#fff0cf` | Pending pill background |
| `--color-danger` | `#b3261e` | Reject/remove actions |
| `--color-danger-bg` | `#fff1ef` | Danger soft background |
| `--color-disabled` | `#d7d4cc` | Disabled controls |

### Usage Rules

- Use deep green for headings, labels, icons, and outlines.
- Use orange only for primary forward actions.
- Use amber/brown for pending manual review.
- Use green for completed/approved.
- Use red only for destructive or rejection actions.
- Avoid purple, blue gradients, dark themes, and one-color monochrome palettes.

## 6. Typography

### Font Family

Preferred Hebrew-friendly system stack:

```css
font-family: "Heebo", "Assistant", "Noto Sans Hebrew", Arial, sans-serif;
```

If a custom web font is used, it must support Hebrew well and render cleanly on mobile.

### Type Scale

| Token | Size | Weight | Usage |
|---|---:|---:|---|
| `display` | `40-44px` | `700` | Landing page hero title |
| `h1` | `34-38px` | `700` | Main screen title |
| `h2` | `24-28px` | `700` | Section title |
| `h3` | `20-22px` | `700` | Card title |
| `body` | `17-19px` | `400` | Main text |
| `body-strong` | `17-19px` | `700` | Emphasized body |
| `small` | `14-15px` | `400` | Helper text, metadata |
| `button` | `19-22px` | `700` | Primary buttons |

### Typography Rules

- Do not use negative letter spacing.
- Do not scale font size with viewport width.
- Keep line-height generous: `1.45-1.7`.
- Main titles should be centered on parent screens.
- Admin screens may use more compact headings and right-aligned content.

## 7. Layout

### Viewport

Primary design target:

- Mobile portrait.
- Approximate mockup ratio: 9:16.
- Main content max width on mobile: `min(100% - 32px, 720px)`.

### Spacing Scale

| Token | Value |
|---|---:|
| `space-1` | `4px` |
| `space-2` | `8px` |
| `space-3` | `12px` |
| `space-4` | `16px` |
| `space-5` | `24px` |
| `space-6` | `32px` |
| `space-7` | `40px` |
| `space-8` | `56px` |

### Layout Rules

- Use a single-column vertical flow on mobile.
- Use full-width content bands or simple constrained layouts.
- Cards are for repeated items, forms, uploads, summaries, and admin rows.
- Do not place cards inside cards unless the inner element is a form input/upload preview with a clear purpose.
- Footer botanicals should sit behind or below content and never reduce button legibility.

## 8. Border Radius and Elevation

### Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | `6px` | Inputs, small chips |
| `radius-md` | `8px` | Cards, upload areas |
| `radius-lg` | `12px` | Large soft panels only |
| `radius-pill` | `999px` | Status pills, chips |

Default card radius should be `8px`.

### Elevation

Use subtle shadows only:

```css
box-shadow: 0 8px 24px rgba(24, 63, 54, 0.06);
```

Most surfaces should rely on border and background rather than heavy shadow.

## 9. Common Components

### Header

#### Header Variants

**Parent/public header**

- Logo and app name on the right.
- Back/exit/my registration action on the left.
- Thin divider line below.
- Height: `72-88px`.
- Horizontal padding: `24-32px`.
- Divider: `1px solid rgba(216, 205, 184, 0.9)`.

**Admin header**

- Logo and app name on the right.
- User indicator or back action on the left.
- Same divider line.
- User label example: `אביב`.
- Keep admin header compact and aligned with bottom navigation.

**Header action styles**

| Variant | Usage | Style |
|---|---|---|
| Back action | Return to previous screen | Text `16-18px`, `--color-text`, left-chevron icon |
| Exit action | Leave registration/status | Text only or text + icon, `--color-text` |
| User action | Admin identity | User icon + name, no filled background |

### Buttons

#### Button Variants

| Variant | Usage | Background | Border | Text | Height | Radius |
|---|---|---:|---:|---:|---:|---:|
| Primary | Main forward action | `--color-primary` | none | white, `700` | `56-64px` | `8px` |
| Primary small | Card-level admin/parent action | `--color-primary` | none | white, `700` | `40-48px` | `8px` |
| Secondary outline | Secondary action | transparent/white | `1.5px solid --color-border-strong` | `--color-heading` | `48-56px` | `8px` |
| Ghost link button | Low emphasis command inside cards | transparent | none | `--color-heading`, underline optional | `auto` | none |
| Disabled | Unavailable action | `--color-disabled` | none | white or `#f8f6ef` | `56px` | `8px` |
| Danger outline | Reject/remove/destructive | transparent | `1.5px solid --color-danger` | `--color-danger` | `44-56px` | `8px` |
| Success outline | Approve document/payment | transparent | `1.5px solid --color-success` | `--color-heading` | `44-56px` | `8px` |
| Icon button | Compact utility command | transparent | optional `1px solid --color-border` | semantic icon color | `44px` | `8px` |

#### Primary Button

Use for the main forward action.

Examples:

- `בחירה והתחלת הרשמה`
- `המשך לחוזה משותף`
- `חתימה והמשך לאישורים`
- `שמירת החלטות`
- `חזרה לעמוד הראשי`

Style:

- Background: `--color-primary`.
- Hover/pressed: `--color-primary-hover`.
- Text: white.
- Font: `button`.
- Full-width on mobile unless inside a card.
- Icon: left arrow when continuing forward in RTL flows.
- Icon placement: icon visually to the left of the text.

#### Secondary Outline Button

Use for non-primary actions.

Examples:

- `הורדת החוזה החתום`
- `צפייה בפרטים שמילאתי`
- `צפייה בסטטוס`
- `הוספת מסלול`

Style:

- Background: transparent or `--color-bg`.
- Border: `1.5px solid --color-border-strong`.
- Text: `--color-heading`.
- Font weight: `700`.

#### Text Link

Use underlined text links for low-priority actions:

- `שמירה והמשך מאוחר יותר`
- `התחלת הרשמה חדשה`
- `העתקה משנה קודמת`
- `הוספת הערה להורה`
- `הוספת הערה פנימית`

Style:

- Text color: `--color-heading`.
- Text decoration: underline.
- Underline thickness: `1px`.
- Touch target should still be at least `44px` high.

#### Approval and Rejection Buttons

Used on admin review screens.

**Approve**

- Label examples: `אישור המסמך`, `אישור התשלום`.
- Border: `1.5px solid --color-success`.
- Text/icon: `--color-heading`.
- Icon: check.

**Reject**

- Label: `דחייה`.
- Border: `1.5px solid --color-danger`.
- Text/icon: `--color-danger`.
- Icon: X.

Approval and rejection buttons may sit side-by-side inside file review cards.

### Cards

#### Base Card

- Background: `--color-bg` or `--color-surface`.
- Border: `1px solid --color-border`.
- Radius: `8px`.
- Padding: `16-24px`.
- Optional shadow: `--shadow-soft`.

#### Card Variants

| Variant | Usage | Style |
|---|---|---|
| Soft info card | Helpful explanations and privacy notes | `--color-surface`, subtle border, icon on right |
| Highlight alert card | Pending review / important notice | `--color-warning-bg`, amber border/icon |
| Route card | Landing/settings route selection | Border green when selected, radio/check marker |
| Selected route card | Active route in registration | `--color-surface`, green outline, `שינוי` link |
| Child card | Child registration item | Avatar icon, name, route, status pill |
| Family card | Parent + children summary | Parent identity, child chips, sibling/shared badges |
| Status summary card | Parent final/status screen | Rows with right label and left status |
| Upload card | Uploaded file or upload target | File icon/thumbnail, filename, size, actions |
| Admin registration card | Dashboard list item | Denser layout, filters/status badges, action button |
| Admin settings card | School-year settings group | Rows with toggles, inputs, steppers |
| Contract preview card | Contract content summary | White paper surface, thin border, formal heading |
| Signature card | Digital signature area | Large bordered canvas-like area |
| Timeline/history card | Registration history | Vertical or stacked year items |
| Stats card | Admin dashboard metric | Icon, large number, label |

#### Card Spacing

- Standard card gap: `16-24px`.
- Admin card gap: `12-16px`.
- Card title: `h3`.
- Card metadata: `small`.

### Chips and Badges

Use compact rounded tokens for short metadata.

| Variant | Usage | Background | Text/Icon |
|---|---|---:|---:|
| Neutral chip | Child names, route tags | `--color-surface` | `--color-text` |
| Success chip | Completed/available | pale green | `--color-success` |
| Warning chip | Pending review | `--color-warning-bg` | `--color-warning` |
| Shared chip | `מסמכים משותפים`, `קובץ משותף` | `--color-surface-strong` | `--color-heading` + link/file icon |
| Sibling chip | `אחים`, `2 ילדים` | `--color-surface-strong` | `--color-heading` + family icon |
| Allergy chip | `ללא רגישויות` or allergy alert | green if none, red/amber if present | semantic |

Chip style:

- Radius: `--radius-pill`.
- Padding: `6px 10px`.
- Font size: `14-15px`.
- Gap between icon and text: `6px`.

### Status Pills

Status pills must combine color, icon, and text.

| Status | Background | Text/Icon | Icon |
|---|---:|---:|---|
| `הושלם` | pale green | `--color-success` | Check |
| `נחתם` | pale green | `--color-success` | Check |
| `פעילה` | pale green | `--color-success` | Check |
| `זמין לבחירה` | pale green | `--color-success` | Check |
| `ממתין לבדיקה` | `--color-warning-bg` | `--color-warning` | Clock |
| `לבדיקה` | `--color-warning-bg` | `--color-warning` | Clock |
| `טרם הועלתה אסמכתה` | `--color-warning-bg` | `--color-warning` | Clock |
| `נדחה` | `--color-danger-bg` | `--color-danger` | X |
| `הוסר` | `--color-danger-bg` | `--color-danger` | Trash/X |

Never rely on color alone.

### Stepper

Registration stepper has four steps:

1. `פרטים`
2. `חוזה`
3. `אישורים`
4. `סיום`

Rules:

- Completed steps: filled green circle with check.
- Active step: outlined/filled green circle with step number.
- Future steps: light outlined circle.
- Connector line follows RTL sequence from right to left.
- Labels sit below each circle.
- Completed connector segment: green.
- Future connector segment: `--color-border`.
- Stepper appears only in registration screens, not admin screens.

### Progress and Timeline

Use for registration history and process explanations.

**Vertical numbered steps**

- Landing page registration explanation.
- Circle number on the right.
- Thin vertical connector.
- Label text to the left.

**History timeline**

- Current year item uses green check.
- Empty/previous item can use dashed border.
- Year labels include Hebrew year and Gregorian year where useful.

### Form Inputs

#### Text Input

- Height: `56-64px`.
- Border: `1px solid --color-border-strong` when active.
- Radius: `8px`.
- Text aligned right.
- Placeholder muted.
- Background: transparent or `--color-bg`.
- Label sits above input, right aligned.
- Error text appears below input in `--color-danger`.

Phone placeholder:

`05X-XXX-XXXX`

#### Input States

| State | Border | Helper/Error |
|---|---:|---:|
| Default | `--color-border` | optional muted helper |
| Focus | `--color-border-strong` | helper remains muted |
| Filled | `--color-border` | value uses `--color-text` |
| Error | `--color-danger` | error text in red |
| Disabled/read-only | `--color-border`, low opacity | no interactive cursor |

#### Number Stepper

Used in admin settings for capacity.

- Container height: `48px`.
- Minus button on one side, plus button on the other.
- Value centered.
- Border: `1px solid --color-border`.
- Radius: `8px`.

### Segmented Controls

Use for binary choices:

- `כן / לא`
- selected segment uses pale green background and check icon.
- Container border: `1px solid --color-border-strong`.
- Segment height: `48-56px`.
- Selected text: `--color-heading`, weight `700`.
- Unselected text: `--color-text`.

### Toggles

Use for admin on/off settings:

- `הרשמה פתוחה`
- `עמוד מידע גלוי להורים`

Style:

- On track: deep green.
- Off track: `--color-disabled`.
- Thumb: white.
- Size: about `52px x 32px`.
- Label and description sit to the right in RTL; toggle can sit left for scanability.

### Checkboxes

Used for applying files or details to multiple children.

Examples:

- `שימוש באותו קובץ עבור שני הילדים`
- `האסמכתה תחול על שני הילדים`
- `שימוש בפרטים מההרשמה של נועה`

Style:

- Square or rounded-square control.
- Selected: green fill with white check.
- Label aligned right.
- Can be embedded in an upload card.

### Upload Area

Upload states:

- Empty: dashed green border, upload icon, title, subtitle, optional camera action.
- Uploaded: file card with filename, size, check status, replace/delete actions.
- Shared: include selected checkbox and badge such as `משויך לנועה ולאורי`.
- Pending review: amber status pill.
- Approved: green check.
- Rejected: red badge and rejection reason.

#### Upload Variants

| Variant | Usage | Style |
|---|---|---|
| Empty drop zone | Parent uploads file | Dashed green border, centered upload icon |
| Uploaded file | File selected/uploaded | Solid card, file icon/thumbnail, filename, size |
| Shared upload | Same file applies to siblings | Uploaded file + selected checkbox + shared badge |
| Admin review file | Aviv review | File metadata, thumbnail, pending status, approve/reject buttons |
| Image receipt preview | Insurance receipt image | Small thumbnail with image placeholder |
| PDF preview | Contract/standing order PDF | Document icon/thumbnail |

Upload action links:

- `החלפה`
- `מחיקה`
- `צילום מסמך`
- `פתיחת חוזה`
- `הורדת חוזה`

### Contract Preview

Used in registration step 2.

- Paper-like white card.
- Thin beige border.
- Formal centered heading.
- Numbered sections inside.
- Decorative small divider may be used sparingly.
- Links below: `פתיחת החוזה המלא`, `הורדת טיוטה`.

### Signature Pad

Used in contract signing.

- Large rectangular input area.
- Border: `1px solid --color-border`.
- Radius: `8px`.
- Minimum height: `120-160px`.
- Placeholder: `חתמו כאן באמצעות האצבע`.
- Signature stroke: deep green.
- Utility action: `ניקוי חתימה`.
- Confirmation row below uses green check.

### Route Selector

Used on landing page and settings.

**Parent route card**

- Includes route name, days/hours, price.
- Selected route has green border and selected radio/check.
- CTA follows selected route list.

**Admin route card**

- Includes edit icon/action.
- Includes availability status chip.
- Shows price prominently.

### Stats Cards

Used on admin dashboard.

- Three cards per row on mobile when space allows.
- Large number: `h1`/`h2`, deep green or orange for pending count.
- Icon in soft circular background.
- Label below number.

### Search and Filters

**Search input**

- Full-width rounded input.
- Search icon on one side.
- Placeholder: `חיפוש לפי ילד, הורה או טלפון`.

**Filter chips**

- Horizontal scroll if needed.
- Active chip: green background, white text.
- Inactive chip: `--color-surface`, border `--color-border`.
- Examples: `הכל`, `לבדיקה`, `אחים`, `מסמכים משותפים`, `אלרגיות`.

### Alerts and Info Bands

| Variant | Usage | Style |
|---|---|---|
| Privacy note | Parent reassurance | `--color-surface`, shield icon |
| Pending alert | Needs Aviv review | `--color-warning-bg`, amber icon/border |
| Success notice | Completed/sent | pale green, check/shield icon |
| Sensitive medical note | Allergies not copied | `--color-surface`, shield icon |

Info bands use one icon, one bold line if needed, and concise supporting text.

### Family and Child Components

**Family summary**

- Parent name.
- Phone.
- Child chips/rows.
- Sibling/shared badges.
- Family icon.

**Child card**

- Child avatar icon.
- Child name.
- Route and year.
- Status pill.
- Allergy/sensitivity badge.
- Action link/button.

**Sibling/shared markers**

- `2 ילדים`
- `אחים`
- `אותו הורה`
- `מסמכים משותפים`
- `קובץ משותף`
- `אסמכתה משותפת`

### Admin Bottom Navigation

Tabs:

- `הרשמות`
- `ילדים`
- `הגדרות`

Active tab:

- Green icon and label.
- Small underline indicator.

Inactive tab:

- Muted icon and label.
- No filled background.

### Footer Botanical Decoration

Used on most mobile screens.

- Leaves and flowers sit at the bottom edges.
- Parent screens may use fuller decoration.
- Admin screens use subtler decoration.
- Must not overlap primary actions, bottom navigation, or readable text.

## 10. Parent Flow Patterns

### Landing Page

Required elements:

- Brand header.
- Main emotional headline.
- Program description.
- Primary route selection CTA.
- Route cards.
- Registration steps explanation.
- Rules/FAQ rows.
- Footer links.

### Registration

Use the four-step wizard.

Sibling-aware registration must support:

- Reusing parent details.
- Adding child-specific details.
- Child-specific allergies.
- Shared sibling contract.
- Shared upload files.
- Updated insurance total.
- Per-child registration status.

### My Registration

Flow:

1. Phone lookup screen.
2. Registrations list if multiple children exist.
3. Child/family status screen.

When multiple children exist, show:

- Parent identity.
- Child cards.
- Status per child.
- Shared file/contract badges where relevant.

## 11. Admin Flow Patterns

### Registration Dashboard

Should show:

- Counts: total children, completed, pending review.
- Search.
- Filters.
- Highlighted pending review cards.
- Sibling/shared document markers.

### Shared Document Review

Should show:

- Parent identity.
- Children linked to the shared registration.
- Shared contract status.
- Standing order file review.
- Insurance receipt review.
- Approve/reject actions.
- Internal note option.

### Family Profile

Should show:

- Parent details.
- Children list.
- Allergies/sensitivities indicator.
- Shared documents.
- Yearly registration history.
- Admin actions.

### School Year Settings

Should show:

- Active year.
- Registration open/closed.
- Public visibility.
- Capacity.
- Insurance amount.
- Route management.
- Parent content management.
- Contract/version management.

## 12. Iconography

Use line icons with rounded strokes where possible.

Common icons:

- Arrow left/back.
- Check.
- Clock.
- Shield.
- User/child/family.
- Calendar.
- File/document.
- Upload.
- Camera.
- Edit pencil.
- Trash/remove.
- Search.
- Settings.

Icon color should follow semantic state.

## 13. Accessibility

- Minimum touch target: `44px`.
- Buttons should be at least `48px` tall.
- Text contrast must be readable on cream backgrounds.
- Status must not rely only on color.
- Inputs must have visible labels.
- Error messages must explain the required correction.
- Focus states must be visible.
- All icon-only controls need accessible labels.

## 14. Responsive Behavior

Mobile:

- Single-column layout.
- Full-width primary buttons.
- Sticky bottom nav only in admin screens.

Tablet/Desktop:

- Keep content centered with max width.
- Admin lists may expand to table-like layouts.
- Parent registration should remain wizard-like and not become too wide.

## 15. Current Mockup References

Current mockups are stored in:

`mockups/`

Reference files:

- `landing-page.png`
- `parent-registration-lookup.png`
- `parent-my-registrations-list.png`
- `parent-my-registration-status.png`
- `registration-step-1-sibling-reuse-details.png`
- `registration-step-2-sibling-shared-contract.png`
- `registration-step-3-sibling-shared-uploads.png`
- `registration-step-4-sibling-summary.png`
- `admin-registrations-dashboard.png`
- `admin-shared-documents-review.png`
- `admin-family-profile-history.png`
- `admin-school-year-settings.png`

## 16. Component Coverage Audit

This checklist verifies that every component visible in the current mockups is represented in the design system.

### Parent/Public Screens

| Mockup | Components Covered |
|---|---|
| `landing-page.png` | Header, logo, hero typography, botanical hero/illustration area, route cards, selected route state, primary button, informational icon blocks, process timeline, accordion rows, footer links |
| `parent-registration-lookup.png` | Header, back action, H1/subtitle, info card, phone input, primary button, text link, privacy note, botanical footer |
| `parent-my-registrations-list.png` | Header, parent identity card, child cards, status pills, sibling/multiple-registration list, card action buttons, primary button, text link, botanical footer |
| `parent-my-registration-status.png` | Child summary card, registration status rows, status pills, contract download link, pending states, info card, primary/secondary actions |

### Registration Screens

| Mockup | Components Covered |
|---|---|
| `registration-step-1-sibling-reuse-details.png` | Registration stepper, parent reuse card, selected clone checkbox/card, selected route card, text input, segmented control, medical/privacy info card, primary button, text link |
| `registration-step-2-sibling-shared-contract.png` | Stepper, children summary card, contract preview card, contract links, signer input, signature pad, signature confirmation row, primary button |
| `registration-step-3-sibling-shared-uploads.png` | Stepper, sibling summary, uploaded file card, empty upload drop zone, shared file checkbox, shared badges, insurance total, disabled button, info card |
| `registration-step-4-sibling-summary.png` | Completed stepper, success header, family summary card, status rows, shared document badges, pending review pills, primary/secondary buttons, text link |

### Admin Screens

| Mockup | Components Covered |
|---|---|
| `admin-registrations-dashboard.png` | Admin header, stats cards, alert band, search input, filter chips, admin registration card, sibling/shared badges, status row, small action button, bottom navigation |
| `admin-shared-documents-review.png` | Admin detail header, family summary card, alert/info card, contract row, admin review file cards, PDF/image thumbnails, approve/reject buttons, sticky primary action, note link |
| `admin-family-profile-history.png` | Family profile header, sibling alert, child cards, allergy badges, shared document rows, registration history timeline, danger outline button, admin actions, bottom navigation |
| `admin-school-year-settings.png` | Admin settings card, toggles, number stepper, amount input row, route management cards, availability chips, edit action, add button, content management rows, save button, copy link, bottom navigation |

### Component Inventory

All current mockups are covered by these component groups:

- Headers and navigation actions.
- Logo/brand lockup.
- Typography hierarchy.
- Primary, secondary, disabled, danger, success, icon, and text-link buttons.
- Cards: route, child, family, status, upload, admin registration, settings, contract, signature, timeline, stats.
- Status pills, chips, badges, sibling markers, shared-document markers, allergy badges.
- Registration stepper and timelines.
- Inputs, phone input, signer input, segmented controls, checkboxes, toggles, number steppers.
- Upload drop zones, uploaded file cards, PDF/image thumbnails, shared upload controls, review file cards.
- Contract preview and signature pad.
- Search input and filter chips.
- Alerts, privacy notes, pending review bands, success notices.
- Admin bottom navigation.
- Botanical footer decoration.

## 17. CSS Token Starter

```css
:root {
  direction: rtl;
  color-scheme: light;

  --color-bg: #fffaf3;
  --color-surface: #f7f3e8;
  --color-surface-strong: #efe9d8;
  --color-border: #d8cdb8;
  --color-border-strong: #2f5f32;
  --color-text: #183f36;
  --color-heading: #0f4a2f;
  --color-muted: #6e756b;
  --color-primary: #f58220;
  --color-primary-hover: #e87416;
  --color-success: #4f7f38;
  --color-success-bg: #eaf3df;
  --color-warning: #9a6a0a;
  --color-warning-bg: #fff0cf;
  --color-danger: #b3261e;
  --color-danger-bg: #fff1ef;
  --color-disabled: #d7d4cc;
  --color-disabled-text: #f8f6ef;
  --color-focus: #2f5f32;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 56px;

  --shadow-soft: 0 8px 24px rgba(24, 63, 54, 0.06);

  --header-height: 80px;
  --bottom-nav-height: 76px;
  --touch-target: 44px;
}
```
