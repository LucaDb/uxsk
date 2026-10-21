import { renderManualReact, type ManualAnimation, type ManualBreakpoint, type ManualOutputFormat, type ManualShape } from '../generator/manual.js';
import { startCanvasEditor } from './editor.js';
import { startElementPicker } from './picker.js';

chrome.action.onClicked.addListener(tab => {
  if (tab.id === undefined) return;
  void chrome.scripting.executeScript({ target: { tabId: tab.id }, func: startElementPicker, args: ['PageSkeleton'] });
});

interface ExtensionMessage {
  type?: string;
  componentName?: string;
  width?: number;
  height?: number;
  bounds?: { x: number; y: number; width: number; height: number };
  shapes?: ManualShape[];
  breakpoints?: ManualBreakpoint[];
  animation?: ManualAnimation;
  customClass?: string;
  backgroundColor?: string;
  borderRadius?: number;
  animationDuration?: number;
  format?: ManualOutputFormat;
  compressed?: boolean;
  download?: boolean;
}

chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
  const tabId = sender.tab?.id;
  if (tabId === undefined) return;
  if (message.type === 'ui-shell:start-editor') {
    void chrome.scripting.executeScript({
      target: { tabId }, func: startCanvasEditor,
      args: [message.componentName ?? 'PageSkeleton', message.bounds ?? { x: 0, y: 0, width: 640, height: 360 }]
    }).then(() => sendResponse({ success: true })).catch(error => {
      sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unable to open the canvas.' });
    });
    return true;
  }
  if (message.type !== 'ui-shell:render-manual') return;

  try {
    if (!Array.isArray(message.shapes) || message.shapes.length > 500) throw new Error('Draw up to 500 shapes.');
    const output = renderManualReact(
      message.componentName ?? 'PageSkeleton',
      Number(message.width),
      Number(message.height),
      message.shapes,
      message.breakpoints ?? [],
      message.animation ?? 'none',
      message.customClass ?? '',
      message.backgroundColor ?? '#e8e8eb',
      Number(message.borderRadius ?? 4),
      Number(message.animationDuration ?? 1.6),
      { compressed: message.compressed === true }
    );
    if (message.download) {
      const format = message.format === 'angular' || message.format === 'html' ? message.format : 'react';
      const content = format === 'angular' ? output.angular : format === 'html' ? output.html : output.tsx;
      const filename = format === 'angular' ? `${message.componentName}.component.ts` : `${message.componentName}.${format === 'react' ? 'tsx' : 'html'}`;
      const bytes = new TextEncoder().encode(content);
      let binary = '';
      for (const byte of bytes) binary += String.fromCharCode(byte);
      // Keep Chrome from inferring a .txt extension from the MIME type. The
      // explicit download filename below supplies the correct source extension.
      const dataUrl = `data:application/octet-stream;base64,${btoa(binary)}`;
      void chrome.downloads.download({
        url: dataUrl,
        filename,
        conflictAction: 'uniquify',
        saveAs: false
      }).then(() => sendResponse({ success: true, tsx: output.tsx, angular: output.angular, html: output.html, css: output.css, previewHtml: output.previewHtml })).catch(error => {
        sendResponse({ success: false, error: error instanceof Error ? error.message : 'TSX download failed.' });
      });
      return true;
    }
    sendResponse({ success: true, tsx: output.tsx, angular: output.angular, html: output.html, css: output.css, previewHtml: output.previewHtml });
  } catch (error) {
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Generation failed.' });
  }
  return true;
});
