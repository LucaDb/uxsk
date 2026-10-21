# UISK Privacy Policy

**Last updated: October 21, 2026**

UISK lets you draw responsive skeleton layouts over a webpage you choose and export the result as source code.

## Data processing

UISK processes a limited amount of webpage information and user-created content locally in your browser. It does not transmit this information, sell it, or share it with third parties. It does not use analytics, advertising, remote scripts, or a backend service.

When you activate UISK, its picker reads the tag name, number of child elements, and rendered position and size of the element under your pointer. It uses this limited information to draw the hover highlight and position the canvas on the element you select. UISK does not read page text, form values, cookies, or the page URL.

The rectangles, circles, breakpoint widths, and style settings you create are user-generated content. UISK keeps them in memory for the current editing session and uses them to generate the preview and source code. They are not saved by UISK after the editor is closed or the page is reloaded.

Generated code is created locally in the browser. If you choose Download, Chrome's Downloads API saves the generated file to your device. UISK does not upload that file.

The extension does not access tabs or pages until you invoke it. Chrome's `activeTab` permission grants temporary access to the active tab after that user action. The `scripting` permission is used to run the picker and editor in that tab. The `downloads` permission is used only to save an export requested by you.

## Third parties

UISK has no analytics, advertising, or data-processing service providers. Your normal browsing traffic to websites is independent of UISK.

## Changes and contact

This policy may be updated if the extension's data practices change. For questions about this policy, open an issue at [github.com/LucaDb/uisk](https://github.com/LucaDb/uisk/issues).
