# UISK

UISK is a Chrome extension for drawing skeleton placeholders over a selected area of the rendered page. It can export React TSX, an Angular standalone component, or a self-contained HTML file. Everything runs locally in your browser: it does not contact a server, and it does not recover the page's original framework source.

## Install

UISK is being published on the Chrome Web Store. Until the listing is live, you can [build it from source](#build-from-source) and load it unpacked.

## Usage

1. Open a normal web page and click the UISK toolbar icon.
2. Hover the page and click the area to skeletonize. The canvas opens in rectangle mode.
3. Draw rectangles or circles. Drawing keeps the selected shape tool active; a click without dragging switches to selection mode. Drag shapes to move them with the grid snap.
4. Select a shape for its duplicate, cancel, and edit controls. Edit exposes eight resize handles.
5. Press **Generate** to review the rendered preview and switch among React, Angular, and HTML source. The **Download** menu lets you set the component name and download a file for each format.

The grid defaults to **8 px**; use the settings menu next to the breakpoint tabs to choose **4, 8, or 16 px**. Settings also include optional output compression.

### Responsive layouts

To capture a responsive layout, resize the page to the target width and press **Add breakpoint**. This adds a blank layout labeled with the viewport width in pixels. The canvas switches to the layout whose breakpoint applies as you resize; click a width tab above the grid to edit a specific layout.

Each captured breakpoint is an independent layout. The largest captured viewport is the default layout; narrower layouts activate through CSS `max-width` media queries.

### Limitations

Chrome internal pages, the Chrome Web Store, and some protected pages do not allow extension scripts. The output maps each drawn shape to CSS Grid tracks at its captured coordinates, then switches layouts at the recorded viewport breakpoints. It does not infer semantic content or recreate the original page's layout logic; intermediate widths scale the nearest captured layout. Review the generated component before using it.

## Permissions and privacy

The extension requests `activeTab`, `scripting`, and `downloads`. It has no site-wide host permissions. The editor runs in the selected page's isolated extension world and does not capture a screenshot or send page data to a service. Generated components do not make network requests.

See the full [privacy policy](PRIVACY.md).

## Build from source

Requires Node.js 20 or later.

```sh
npm install
npm run build
```

In Chrome, open `chrome://extensions`, turn on **Developer mode**, select **Load unpacked**, and choose `dist/extension`.

To create a versioned Chrome Web Store upload archive, run:

```sh
npm run package:extension
```

This writes `artifacts/uisk-v<manifest-version>.zip` and requires the system `zip` utility. The store listing draft is in [`STORE-LISTING.md`](STORE-LISTING.md).

## Development

```sh
npm run typecheck
npm test
npm run build
```

### Project structure

- `src/extension`: Manifest V3 background action, picker, on-page canvas editor, review, and download flow.
- `src/extension/picker.ts`: Inspector-style hover highlight and element selection in the active tab's isolated extension world.
- `src/extension/editor.ts`: self-contained isolated-world editor injected over the selected page area.
- `src/generator/manual.ts`: maps drawn shapes to fluid CSS Grid tracks and emits React, Angular, or HTML output with embedded, scoped CSS.
- `src/generator/naming.ts`: validates component names and creates scoped CSS namespaces.
- `scripts/build-extension.mjs`: creates the unpacked extension in `dist/extension`.

## Issues

Bug reports and suggestions are welcome in [GitHub Issues](https://github.com/LucaDb/uisk/issues).

## License

[MIT](LICENSE)
