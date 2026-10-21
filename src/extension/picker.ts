interface PickerWindow extends Window {
  __uiShellSelectedElement?: Element;
  __uiShellPickerCleanup?: () => void;
  __uiShellSelectionCleanup?: () => void;
  __uiShellEditorCleanup?: () => void;
}

/** Installed into the active tab's extension isolated world by chrome.scripting. */
export function startElementPicker(componentName = 'PageSkeleton'): void {
  const state = window as PickerWindow;
  state.__uiShellEditorCleanup?.();
  state.__uiShellSelectionCleanup?.();
  document.querySelectorAll('[data-ui-shell-picker]').forEach(node => node.remove());
  state.__uiShellPickerCleanup?.();
  delete state.__uiShellSelectedElement;

  const overlay = document.createElement('div');
  overlay.dataset.uiShellPicker = 'true';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const outline = document.createElement('div');
  outline.style.cssText = 'position:fixed;display:none;border:2px solid #4263eb;background:rgba(66,99,235,.10);border-radius:3px;box-sizing:border-box;';
  const label = document.createElement('div');
  label.style.cssText = 'position:fixed;display:none;padding:3px 7px;border-radius:4px;background:#263b91;color:white;font:12px/1.4 system-ui,sans-serif;box-shadow:0 1px 4px #0004;';
  const tip = document.createElement('div');
  tip.textContent = 'Click an element to select · Esc to cancel';
  tip.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);padding:7px 11px;border-radius:6px;background:#202124;color:#fff;font:13px/1.4 system-ui,sans-serif;box-shadow:0 2px 8px #0004;';
  overlay.append(outline, label, tip);
  document.documentElement.append(overlay);

  let hovered: Element | undefined;
  const onPointerOver = (event: PointerEvent): void => {
    const target = event.composedPath().find((entry): entry is Element => entry instanceof Element && !overlay.contains(entry));
    if (!target || target === document.documentElement) return;
    hovered = target;
    const rect = target.getBoundingClientRect();
    outline.style.display = 'block';
    outline.style.left = `${Math.max(0, rect.left)}px`;
    outline.style.top = `${Math.max(0, rect.top)}px`;
    outline.style.width = `${Math.max(0, rect.width)}px`;
    outline.style.height = `${Math.max(0, rect.height)}px`;
    label.textContent = `${target.tagName.toLowerCase()} · ${target.children.length} children`;
    label.style.display = 'block';
    label.style.left = `${Math.max(4, Math.min(rect.left, window.innerWidth - 180))}px`;
    label.style.top = `${Math.max(4, rect.top - 27)}px`;
  };
  const cleanup = (): void => {
    document.removeEventListener('pointerover', onPointerOver, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
    overlay.remove();
    if (state.__uiShellPickerCleanup === cleanup) delete state.__uiShellPickerCleanup;
  };
  const onClick = (event: MouseEvent): void => {
    if (!hovered) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    state.__uiShellSelectedElement = hovered;
    const rect = hovered.getBoundingClientRect();
    cleanup();
    void chrome.runtime.sendMessage({
      type: 'ui-shell:start-editor', componentName,
      bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    });
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    delete state.__uiShellSelectedElement;
    cleanup();
  };
  state.__uiShellPickerCleanup = cleanup;
  document.addEventListener('pointerover', onPointerOver, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKeyDown, true);
}

/** Read from the same extension isolated world by the review page. */
export function selectedElementInfo(): { selected: boolean; tagName?: string; childCount?: number } {
  const state = window as PickerWindow;
  const element = state.__uiShellSelectedElement;
  if (!element?.isConnected) return { selected: false };
  return { selected: true, tagName: element.tagName.toLowerCase(), childCount: element.children.length };
}

/** Clear the selected node after generation or when the user cancels. */
export function clearSelectedElement(): void {
  const state = window as PickerWindow;
  state.__uiShellPickerCleanup?.();
  state.__uiShellSelectionCleanup?.();
  delete state.__uiShellSelectedElement;
  document.querySelectorAll('[data-ui-shell-picker]').forEach(node => node.remove());
}
