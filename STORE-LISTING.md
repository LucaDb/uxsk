# Chrome Web Store listing draft

## Name

UISK

## Short description

Draw responsive skeletons on webpages, preview them, and export React, Angular, or HTML.

## Detailed description

Create responsive skeleton loading layouts by drawing directly over the webpage you are working on.

Select a page area, then draw and arrange rectangle or circle placeholders on a configurable grid. Move and resize shapes, and add viewport breakpoints to design layouts for different screen widths. Preview your design before exporting it.

Choose an animation, set the placeholder color and corner radius, then export a React TSX component, an Angular component, or a standalone HTML file with its CSS included.

UISK generates everything locally in your browser. It does not upload page content or generated code, and it does not extract the original source code or application logic of a webpage.

## Single purpose

UISK lets developers visually create and export responsive skeleton loading placeholders for the webpage they are currently working on.

## Permission justifications

- `activeTab`: grants temporary access to the current tab after the user clicks the UISK toolbar button. UISK uses it to start the page selector and place the drawing canvas over the chosen area.
- `scripting`: runs the selector and canvas in that tab so the user can draw, edit, and preview the skeleton layout.
- `downloads`: saves the React, Angular, or HTML source file only after the user chooses a format and clicks its download button.

The extension does not request host permissions or access other tabs.

## Privacy practices draft

For the Dashboard's data-use declaration, disclose website content and user-generated content as processed locally, even though UISK does not transmit them.

- User data handled locally: limited website content (the hovered or selected element's tag name, child count, and rendered bounds) and user-generated content (drawn shapes, breakpoints, and style settings). Used only to place the canvas and generate the skeleton preview and code.
- User data transmitted off the device: none.
- Data sold or shared: none.
- Retention: kept in memory for the current editing session; cleared when the editor closes or the page reloads.
- Remote code: no. All extension JavaScript is bundled in the package. UISK does not load JavaScript, WebAssembly, or modules from external URLs and does not evaluate code strings. The preview uses locally generated HTML and CSS.
- Privacy policy: <https://github.com/LucaDb/uisk/blob/main/PRIVACY.md>.

Confirm every answer against the final uploaded package and dashboard questionnaire before submitting.

## Store assets

- Extension icon: `src/extension/icons/icon128.png` (included in the extension ZIP).
- Small promotional tile: `assets/store/promo-small.png` (440 × 280).
- Marquee promotional image: `assets/store/promo-marquee.jpg` (1400 × 560, JPEG, no alpha channel).
- Screenshot: **still required**. Capture at least one genuine 1280 × 800 or 640 × 400 screenshot showing the running extension and its actual workflow. Do not submit the promotional tile as a product screenshot.

The Chrome Web Store requires an icon, a small promotional image, and at least one screenshot. Its image guidance specifies a 128 × 128 PNG extension icon and a 440 × 280 promotional tile. See [Supplying Images](https://developer.chrome.com/docs/webstore/images).
