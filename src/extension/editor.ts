interface CanvasBounds { x: number; y: number; width: number; height: number }
interface CanvasShape { id: string; kind: 'rect' | 'circle'; x: number; y: number; width: number; height: number }
interface CanvasLayout { viewportWidth: number; width: number; height: number; shapes: CanvasShape[] }
interface EditorSnapshot { layouts: CanvasLayout[]; activeViewportWidth: number }
type ExportFormat = 'react' | 'angular' | 'html';
interface EditorWindow extends Window { __uiShellEditorCleanup?: () => void; __uiShellSelectedElement?: Element }

/** Self-contained injection function: the editor is drawn over the selected page area. */
export function startCanvasEditor(componentName: string, bounds: CanvasBounds): void {
  const initialComponentName = componentName.trim() || 'PageSkeleton';
  const state = window as EditorWindow;
  state.__uiShellEditorCleanup?.();
  const host = document.createElement('div'); host.dataset.uiShellPicker = 'true';
  host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;';
  const shadow = host.attachShadow({ mode: 'open' });
  let gridSize = 8;
  const style = document.createElement('style');
  const backdrop = document.createElement('div'); backdrop.className = 'backdrop'; backdrop.setAttribute('aria-hidden', 'true');
  const backdropShades = Array.from({ length: 4 }, () => { const shade = document.createElement('div'); shade.className = 'backdrop-shade'; backdrop.append(shade); return shade; });
  style.textContent = `
    *{box-sizing:border-box}.toolbar{position:fixed;z-index:10;top:12px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;padding:6px;border:1px solid #d9def0;border-radius:10px;background:#fff;box-shadow:0 5px 24px #1720333b;color:#252a34;font:13px/1.2 system-ui,sans-serif;pointer-events:auto;white-space:nowrap}.toolbar[hidden]{display:none}
    button{position:relative;width:34px;height:34px;display:inline-grid;place-items:center;padding:0;border:0;border-radius:7px;background:transparent;color:#3d4658;cursor:pointer}button:hover{background:#eef1f7}button.active,button.primary{background:#345dd8;color:#fff}button:disabled{opacity:.38;cursor:default}button svg{width:18px;height:18px;fill:currentColor;stroke:none}.divider{height:24px;border-left:1px solid #e3e6ee;margin:0 3px}.brand{padding:0 8px;font-size:14px;font-weight:800;letter-spacing:.08em;color:#172033}.uisk-tooltip{position:fixed;z-index:2147483647;max-width:min(260px,calc(100vw - 16px));padding:6px 8px;border-radius:5px;background:#202124;color:#fff;font:11px/1.3 system-ui,sans-serif;white-space:normal;text-align:center;pointer-events:none;box-shadow:0 2px 8px #0004}
    .toolbar button{width:30px;height:30px}.toolbar button svg{width:16px;height:16px}.toolbar .text-button{width:auto;min-width:72px;padding:0 10px;font:600 12px/1 system-ui,sans-serif}.toolbar .text-button:disabled{opacity:.38;cursor:default}.review-head .text-button{display:inline-flex;width:auto;min-width:72px;height:30px;align-items:center;justify-content:center;flex:0 0 auto;padding:0 10px;font:600 12px/1 system-ui,sans-serif;white-space:nowrap}.review-head .style-settings-button svg{fill:none;stroke:currentColor;stroke-width:12;stroke-linecap:round;stroke-linejoin:round}.review-head .review-download-button{display:inline-flex;width:auto;min-width:72px;height:30px;align-items:center;justify-content:center;flex:0 0 auto;padding:0 10px;border-radius:7px;font:600 12px/1 system-ui,sans-serif;white-space:nowrap}.review-download-button svg{display:none}@media(max-width:767px){.review-head .review-download-button{width:34px;min-width:34px;height:34px;padding:0}.review-download-button svg{display:block;width:18px;height:18px}.review-download-button span{display:none}}
    .selection-menu button{width:28px;height:28px}.selection-menu button svg{width:14px;height:14px}
    .backdrop{position:fixed;z-index:0;inset:0;pointer-events:none}.backdrop-shade{position:absolute;background:rgba(15,23,42,.42);pointer-events:none}.board{position:fixed;z-index:1;overflow:visible;border:1px solid #4263eb;box-shadow:0 0 0 1px #fff8;pointer-events:auto;touch-action:none;background-color:#ffffff30;background-image:linear-gradient(to right,#64748b40 1px,transparent 1px),linear-gradient(to bottom,#64748b40 1px,transparent 1px);background-size:4px 4px}
    .grid-controls{position:absolute;z-index:4;top:-38px;right:0;display:flex;align-items:flex-start;gap:6px;pointer-events:auto}.grid-settings{position:relative}.grid-settings>button{width:28px;height:28px;border:1px solid #d9def0;border-radius:6px;background:#fff}.grid-settings>button svg{width:16px;height:16px}.grid-settings-menu{position:fixed;top:0;left:0;display:flex;gap:4px;padding:5px;border:1px solid #d9def0;border-radius:8px;background:#fff;box-shadow:0 5px 18px #17203338;max-width:calc(100vw - 16px)}.grid-settings-menu[hidden]{display:none}.grid-settings-menu button{width:48px;height:28px;border-radius:5px;font:600 11px/1 system-ui,sans-serif}.grid-settings-menu button.active{background:#345dd8;color:white}.breakpoint-group{display:flex;align-items:center;gap:4px;pointer-events:auto}.breakpoint-group>.add-breakpoint{width:28px;height:28px;border:1px solid #d9def0;border-radius:6px;background:#fff}.breakpoint-group>.add-breakpoint svg{width:16px;height:16px}.breakpoint-tabs{display:flex;gap:4px;pointer-events:auto}.breakpoint-tab{display:flex;align-items:center;border:1px solid #d9def0;border-radius:6px;background:#fff;overflow:visible}.breakpoint-tab.active{background:#345dd8;border-color:#345dd8}.breakpoint-tab button{width:auto;height:26px;padding:0 8px;border:0;border-radius:0;background:transparent;font:600 11px/1 system-ui,sans-serif}.breakpoint-tab.active button{color:#fff}.breakpoint-tab .breakpoint-delete{width:22px;padding:0;color:#778096;background:transparent}.breakpoint-tab .breakpoint-delete svg{width:12px;height:12px}.breakpoint-tab.active .breakpoint-delete{color:#fff}.breakpoint-tab .breakpoint-delete:hover{background:transparent}
    .settings-panel input[type=color]{width:36px;padding:3px}.settings-panel input[type=range]{width:120px;padding:0;accent-color:#345dd8}.settings-panel input[type=checkbox]{width:16px;height:16px;padding:0;accent-color:#345dd8}
    .download-popover .download-format-row{display:grid;grid-template-columns:minmax(0,1fr) 36px;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid #edf0f4}.download-popover .download-format-row:last-child{border-bottom:0}.download-format-name{min-width:0;color:#252a34;font:12px/1.3 system-ui,sans-serif}.download-popover .download-format-row button{display:grid;width:32px;height:32px;place-items:center;justify-self:end;padding:0;border:1px solid #e2e5ec;border-radius:7px;background:#fff;color:#345dd8}.download-popover .download-format-row button:hover{background:#eef1f7}.download-popover .download-format-row button svg{width:16px;height:16px}
    svg.canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}.selecting svg.canvas{cursor:default}.alignment-guide{stroke:#ef4444;stroke-width:1.25;vector-effect:non-scaling-stroke;pointer-events:none}.selection-menu{position:absolute;display:flex;gap:3px;padding:4px;border:1px solid #d9def0;border-radius:9px;background:white;box-shadow:0 4px 18px #17203338;z-index:2}.selection-menu[hidden],.review[hidden]{display:none}
    .handle{fill:white;stroke:#345dd8;stroke-width:1.5}.handle-n,.handle-s{cursor:ns-resize}.handle-e,.handle-w{cursor:ew-resize}.handle-ne,.handle-sw{cursor:nesw-resize}.handle-nw,.handle-se{cursor:nwse-resize}.review{position:fixed;z-index:11;inset:24px;width:auto;height:auto;max-width:1440px;max-height:860px;margin:auto;display:flex;flex-direction:column;border:1px solid #d9def0;border-radius:12px;background:#fff;box-shadow:0 5px 24px #1720333b;pointer-events:auto;overflow:hidden}.review-head{height:48px;display:flex;align-items:center;gap:6px;padding:6px 10px;border-bottom:1px solid #e5e7eb}.review-head button.active{background:#e8eaf0;color:#252a34}.review-head .spacer{flex:1}.settings-popover,.download-popover{position:fixed;z-index:12;top:0;left:0;right:auto;width:min(360px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;border:1px solid #d9def0;border-radius:10px;background:#fff;box-shadow:0 8px 28px #17203330}.settings-popover[hidden],.download-popover[hidden]{display:none}.download-popover{width:min(320px,calc(100vw - 32px));padding:12px}.download-name-row{display:grid;gap:6px;padding-bottom:10px;border-bottom:1px solid #edf0f4;color:#4b5563;font:12px system-ui,sans-serif}.download-name-row input{width:100%;height:30px;padding:0 8px;border:1px solid #d1d5db;border-radius:6px;color:#20242c;font:12px system-ui,sans-serif}.download-format-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:10px}.download-format-name{color:#252a34;font:12px system-ui,sans-serif}.download-format-row button{display:inline-flex;width:78px;height:28px;align-items:center;justify-content:center;padding:0 8px;border-radius:6px;background:#f0f2f6;color:#252a34;font:600 11px system-ui,sans-serif}.download-format-row button:hover{background:#e5e8ef}.settings-panel{display:grid;gap:0;padding:2px 0;background:#fff;font:12px/1.3 system-ui,sans-serif}.setting-row{display:grid;grid-template-columns:92px minmax(0,1fr);align-items:center;gap:12px;min-height:48px;padding:8px 12px;border-bottom:1px solid #edf0f4}.setting-row:last-child{border-bottom:0}.setting-row[hidden]{display:none}.setting-row-label{color:#4b5563}.setting-control{display:flex;min-width:0;align-items:center;gap:8px}.settings-panel select,.settings-panel input{height:30px;min-width:0;padding:0 8px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#20242c;font:12px system-ui,sans-serif}.settings-panel select,.settings-panel input[type=text]{width:100%}.settings-panel input[type=color]{width:38px;padding:3px}.settings-panel input[type=range]{width:100%;padding:0;accent-color:#345dd8}.review iframe{flex:1;min-height:0;width:100%;border:0;background:#fff}.review-code-panel{display:flex;flex:1;min-height:0;flex-direction:column;background:#f7f8fa}.review-code-panel[hidden]{display:none}.review-code-toolbar{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-bottom:1px solid #e5e7eb;background:#fff}.code-tabs{display:flex;align-items:center;gap:4px}.code-tabs .text-button{display:inline-flex;width:auto;min-width:0;height:28px;align-items:center;justify-content:center;padding:0 10px;border-radius:6px;font:600 11px system-ui,sans-serif}.code-tabs .text-button.active{background:#e8eaf0;color:#252a34}.review textarea{flex:1;min-height:0;width:100%;resize:none;border:0;outline:0;padding:16px;color:#20242c;background:#f7f8fa;font:12px/1.5 ui-monospace,Menlo,monospace;white-space:pre}
  `;
  const toolbar = document.createElement('div'); toolbar.className = 'toolbar';
  const board = document.createElement('div'); board.className = 'board';
  board.style.backgroundSize = `${gridSize}px ${gridSize}px`;
  const tooltip = document.createElement('div'); tooltip.className = 'uisk-tooltip'; tooltip.hidden = true;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.classList.add('canvas');
  svg.setAttribute('preserveAspectRatio', 'none');
  const shapeLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.append(shapeLayer);
  const guideLayer = document.createElementNS('http://www.w3.org/2000/svg', 'g'); guideLayer.setAttribute('aria-hidden', 'true'); svg.append(guideLayer); board.append(svg);
  const gridControls = document.createElement('div'); gridControls.className = 'grid-controls';
  const gridSettings = document.createElement('div'); gridSettings.className = 'grid-settings'; gridControls.append(gridSettings);
  const gridSettingsMenu = document.createElement('div'); gridSettingsMenu.className = 'grid-settings-menu'; gridSettingsMenu.hidden = true;
  const breakpointGroup = document.createElement('div'); breakpointGroup.className = 'breakpoint-group'; gridControls.append(breakpointGroup);
  const breakpointTabs = document.createElement('div'); breakpointTabs.className = 'breakpoint-tabs'; breakpointGroup.append(breakpointTabs); board.append(gridControls);
  const selectionMenu = document.createElement('div'); selectionMenu.className = 'selection-menu'; selectionMenu.hidden = true; board.append(selectionMenu);
  const review = document.createElement('section'); review.className = 'review'; review.hidden = true;
  const reviewHead = document.createElement('div'); reviewHead.className = 'review-head';
  const reviewBrand = document.createElement('strong'); reviewBrand.className = 'brand'; reviewBrand.textContent = 'UISK';
  const settingsPanel = document.createElement('div'); settingsPanel.className = 'settings-popover'; settingsPanel.hidden = true;
  const downloadPopover = document.createElement('div'); downloadPopover.className = 'download-popover'; downloadPopover.hidden = true; downloadPopover.setAttribute('aria-label', 'Download format');
  const settingsTable = document.createElement('div'); settingsTable.className = 'settings-panel'; settingsTable.setAttribute('role', 'table'); settingsTable.setAttribute('aria-label', 'Settings');
  const createSettingRow = (label: string, control: HTMLElement): { row: HTMLDivElement; value: HTMLDivElement } => {
    const row = document.createElement('div'); row.className = 'setting-row'; row.setAttribute('role', 'row');
    const labelCell = document.createElement('span'); labelCell.className = 'setting-row-label'; labelCell.setAttribute('role', 'rowheader'); labelCell.textContent = label;
    const value = document.createElement('div'); value.className = 'setting-control'; value.setAttribute('role', 'cell'); value.append(control);
    row.append(labelCell, value); return { row, value };
  };
  const animationSelect = document.createElement('select'); animationSelect.setAttribute('aria-label', 'Animation');
  for (const [value, label] of [['none', 'None'], ['breathe', 'Breathe'], ['grow', 'Grow'], ['custom', 'Custom']] as const) {
    const option = document.createElement('option'); option.value = value; option.textContent = label; animationSelect.append(option);
  }
  const animationRow = createSettingRow('Animation', animationSelect);
  const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.maxLength = 64; nameInput.required = true; nameInput.value = initialComponentName; nameInput.placeholder = 'PageSkeleton'; nameInput.setAttribute('aria-label', 'Component and file name');
  const downloadNameRow = document.createElement('label'); downloadNameRow.className = 'download-name-row';
  const downloadNameLabel = document.createElement('span'); downloadNameLabel.textContent = 'Component name'; downloadNameRow.append(downloadNameLabel, nameInput); downloadPopover.append(downloadNameRow);
  const compressionInput = document.createElement('input'); compressionInput.type = 'checkbox'; compressionInput.setAttribute('aria-label', 'Compress output');
  const compressionRow = createSettingRow('Compress', compressionInput);
  const durationSetting = document.createElement('div'); durationSetting.className = 'setting-row'; durationSetting.setAttribute('role', 'row'); durationSetting.hidden = true;
  const durationLabel = document.createElement('span'); durationLabel.className = 'setting-row-label'; durationLabel.setAttribute('role', 'rowheader'); durationLabel.textContent = 'Duration';
  const durationInput = document.createElement('input'); durationInput.type = 'range'; durationInput.min = '0.5'; durationInput.max = '5'; durationInput.step = '0.1'; durationInput.value = '1.6'; durationInput.setAttribute('aria-label', 'Animation duration in seconds');
  const durationValue = document.createElement('span'); durationValue.className = 'setting-value'; durationValue.textContent = '1.6s'; durationValue.setAttribute('aria-live', 'polite');
  const durationCell = document.createElement('div'); durationCell.className = 'setting-control'; durationCell.setAttribute('role', 'cell'); durationCell.append(durationInput, durationValue); durationSetting.append(durationLabel, durationCell);
  const customClassInput = document.createElement('input'); customClassInput.type = 'text'; customClassInput.maxLength = 64; customClassInput.placeholder = 'my-skeleton-animation'; customClassInput.setAttribute('aria-label', 'Custom CSS class');
  const customClassRow = createSettingRow('Class', customClassInput).row; customClassRow.hidden = true;
  const colorSetting = document.createElement('div'); colorSetting.className = 'setting-row'; colorSetting.setAttribute('role', 'row');
  const colorLabel = document.createElement('span'); colorLabel.className = 'setting-row-label'; colorLabel.setAttribute('role', 'rowheader'); colorLabel.textContent = 'Color';
  const placeholderColorInput = document.createElement('input'); placeholderColorInput.type = 'color'; placeholderColorInput.value = '#e8e8eb'; placeholderColorInput.setAttribute('aria-label', 'Placeholder background color');
  const colorCell = document.createElement('div'); colorCell.className = 'setting-control'; colorCell.setAttribute('role', 'cell'); colorCell.append(placeholderColorInput); colorSetting.append(colorLabel, colorCell);
  const radiusSetting = document.createElement('div'); radiusSetting.className = 'setting-row'; radiusSetting.setAttribute('role', 'row');
  const radiusLabel = document.createElement('span'); radiusLabel.className = 'setting-row-label'; radiusLabel.setAttribute('role', 'rowheader'); radiusLabel.textContent = 'Radius';
  const radiusInput = document.createElement('input'); radiusInput.type = 'range'; radiusInput.min = '0'; radiusInput.max = '16'; radiusInput.step = '1'; radiusInput.value = '4'; radiusInput.setAttribute('aria-label', 'Placeholder border radius');
  const radiusValue = document.createElement('span'); radiusValue.className = 'setting-value'; radiusValue.textContent = '4px'; radiusValue.setAttribute('aria-live', 'polite');
  const radiusCell = document.createElement('div'); radiusCell.className = 'setting-control'; radiusCell.setAttribute('role', 'cell'); radiusCell.append(radiusInput, radiusValue); radiusSetting.append(radiusLabel, radiusCell);
  settingsTable.append(animationRow.row, durationSetting, customClassRow, colorSetting, radiusSetting, compressionRow.row); settingsPanel.append(settingsTable);
  const preview = document.createElement('iframe'); preview.title = 'Skeleton component preview';
  const codePanel = document.createElement('div'); codePanel.className = 'review-code-panel'; codePanel.hidden = true;
  const codeToolbar = document.createElement('div'); codeToolbar.className = 'review-code-toolbar';
  const codeTabs = document.createElement('div'); codeTabs.className = 'code-tabs'; codeTabs.setAttribute('role', 'tablist'); codeTabs.setAttribute('aria-label', 'Generated code format');
  const codeTabButtons = new Map<ExportFormat, HTMLButtonElement>();
  codeToolbar.append(codeTabs);
  const code = document.createElement('textarea'); code.readOnly = true; code.setAttribute('aria-label', 'Generated TSX code');
  codePanel.append(codeToolbar, code);
  review.append(reviewHead, settingsPanel, preview, codePanel);

  const initialWidth = Math.max(4, Math.min(10_000, bounds.width));
  const initialHeight = Math.max(4, Math.min(10_000, bounds.height));
  const layouts: CanvasLayout[] = [{ viewportWidth: window.innerWidth, width: initialWidth, height: initialHeight, shapes: [] }];
  let active = layouts[0]!;
  let addBreakpointButton: HTMLButtonElement | null = null;
  function syncGridBackground(): void {
    const bounds = board.getBoundingClientRect();
    const scaleX = bounds.width / Math.max(active.width, 1);
    const scaleY = bounds.height / Math.max(active.height, 1);
    board.style.backgroundSize = `${gridSize * scaleX}px ${gridSize * scaleY}px`;
  }
  function updateBackdrop(): void {
    const rect = board.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.max(0, Math.min(viewportWidth, rect.left));
    const right = Math.max(left, Math.min(viewportWidth, rect.right));
    const top = Math.max(0, Math.min(viewportHeight, rect.top));
    const bottom = Math.max(top, Math.min(viewportHeight, rect.bottom));
    const rectangles = [
      { left: 0, top: 0, width: viewportWidth, height: top },
      { left: 0, top: bottom, width: viewportWidth, height: viewportHeight - bottom },
      { left: 0, top, width: left, height: bottom - top },
      { left: right, top, width: viewportWidth - right, height: bottom - top }
    ];
    backdropShades.forEach((shade, index) => {
      const area = rectangles[index]!;
      shade.style.left = `${area.left}px`; shade.style.top = `${area.top}px`;
      shade.style.width = `${area.width}px`; shade.style.height = `${area.height}px`;
    });
  }
  let tool: 'select' | 'rect' | 'circle' = 'rect';
  let selectedId: string | null = null;
  let nextId = 0;
  let modify = false;
  let gesture: { action: 'draw' | 'move' | 'resize'; start: { x: number; y: number }; original?: CanvasShape; before?: EditorSnapshot; handle?: string; kind?: 'rect' | 'circle'; moved: boolean } | null = null;
  const history: EditorSnapshot[] = [];
  let draft: CanvasShape | null = null;
  let generatedCode = '';
  let generatedDocuments: Record<ExportFormat, string> = { react: '', angular: '', html: '' };
  let activeCodeFormat: ExportFormat = 'react';
  let generatedComponentName = initialComponentName;
  let compressedOutput = false;
  let animation: 'none' | 'breathe' | 'grow' | 'custom' = 'none';
  let animationDuration = 1.6;
  let customAnimationClass = '';
  let placeholderBackgroundColor = '#e8e8eb';
  let placeholderBorderRadius = 4;
  const brand = document.createElement('strong'); brand.className = 'brand'; brand.textContent = 'UISK'; toolbar.append(brand);

  function setCodeFormat(format: ExportFormat): void {
    activeCodeFormat = format;
    generatedCode = generatedDocuments[format];
    code.value = generatedCode;
    code.setAttribute('aria-label', `Generated ${format === 'react' ? 'React' : format === 'angular' ? 'Angular' : 'HTML'} code`);
    for (const [tabFormat, button] of codeTabButtons) {
      const active = tabFormat === format;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    }
  }

  const icons: Record<string, string> = {
  "select": "<path d=\"M168,132.69,214.08,115l.33-.13A16,16,0,0,0,213,85.07L52.92,32.8A15.95,15.95,0,0,0,32.8,52.92L85.07,213a15.82,15.82,0,0,0,14.41,11l.78,0a15.84,15.84,0,0,0,14.61-9.59l.13-.33L132.69,168,184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63ZM195.31,208,144,156.69a16,16,0,0,0-26,4.93c0,.11-.09.22-.13.32l-17.65,46L48,48l159.85,52.2-45.95,17.64-.32.13a16,16,0,0,0-4.93,26h0L208,195.31Z\"/>",
  "rect": "<path d=\"M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,160H40V56H216V200Z\"/>",
  "circle": "<path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Z\"/>",
  "duplicate": "<path d=\"M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z\"/>",
  "delete": "<path d=\"M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z\"/>",
  "edit": "<path d=\"M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z\"/>",
  "style-settings": "<circle cx=\"128\" cy=\"128\" r=\"40\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"/><path d=\"M41.43,178.09A99.14,99.14,0,0,1,31.36,153.8l16.78-21a81.59,81.59,0,0,1,0-9.64l-16.77-21a99.43,99.43,0,0,1,10.05-24.3l26.71-3a81,81,0,0,1,6.81-6.81l3-26.7A99.14,99.14,0,0,1,102.2,31.36l21,16.78a81.59,81.59,0,0,1,9.64,0l21-16.77a99.43,99.43,0,0,1,24.3,10.05l3,26.71a81,81,0,0,1,6.81,6.81l26.7,3a99.14,99.14,0,0,1,10.07,24.29l-16.78,21a81.59,81.59,0,0,1,0,9.64l16.77,21a99.43,99.43,0,0,1-10,24.3l-26.71,3a81,81,0,0,1-6.81,6.81l-3,26.7a99.14,99.14,0,0,1-24.29,10.07l-21-16.78a81.59,81.59,0,0,1-9.64,0l-21,16.77a99.43,99.43,0,0,1-24.3-10l-3-26.71a81,81,0,0,1-6.81-6.81Z\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"16\"/>",
  "settings": "<path d=\"M216,48H40A16,16,0,0,0,24,64V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V64A16,16,0,0,0,216,48ZM104,144V112h48v32Zm48,16v32H104V160ZM40,112H88v32H40Zm64-16V64h48V96Zm64,16h48v32H168Zm48-16H168V64h48ZM88,64V96H40V64ZM40,160H88v32H40Zm176,32H168V160h48v32Z\"/>",
  "breakpoint": "<path d=\"M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V48A16,16,0,0,0,208,32Zm0,176H48V48H208V208Zm-32-80a8,8,0,0,1-8,8H136v32a8,8,0,0,1-16,0V136H88a8,8,0,0,1,0-16h32V88a8,8,0,0,1,16,0v32h32A8,8,0,0,1,176,128Z\"/>",
  "eye": "<path d=\"M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z\"/>",
  "code": "<path d=\"M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,0,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM162.73,32.48a8,8,0,0,0-10.25,4.79l-64,176a8,8,0,0,0,4.79,10.26A8.14,8.14,0,0,0,96,224a8,8,0,0,0,7.52-5.27l64-176A8,8,0,0,0,162.73,32.48Z\"/>",
  "download": "<path d=\"M224,144v64a8,8,0,0,1-8,8H40a8,8,0,0,1-8-8V144a8,8,0,0,1,16,0v56H208V144a8,8,0,0,1,16,0Zm-101.66,5.66a8,8,0,0,0,11.32,0l40-40a8,8,0,0,0-11.32-11.32L136,124.69V32a8,8,0,0,0-16,0v92.69L93.66,98.34a8,8,0,0,0-11.32,11.32Z\"/>",
  "close": "<path d=\"M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z\"/>",
  "copy": "<path d=\"M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z\"/>"
};
  const makeButton = (parent: HTMLElement, label: string, icon: string, action: () => void, className = ''): HTMLButtonElement => {
    const button = document.createElement('button'); button.type = 'button'; button.setAttribute('aria-label', label); button.innerHTML = `<svg viewBox="0 0 256 256" aria-hidden="true">${icons[icon] ?? ''}</svg>`;
    bindTooltip(button, label);
    if (className) button.className = className;
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); action(); }); parent.append(button); return button;
  };
  const makeTextButton = (parent: HTMLElement, label: string, action: () => void, className = ''): HTMLButtonElement => {
    const button = document.createElement('button'); button.type = 'button'; button.className = `text-button ${className}`.trim();
    button.setAttribute('aria-label', label); button.textContent = label;
    bindTooltip(button, label);
    button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); action(); }); parent.append(button); return button;
  };
  const divider = (): void => { const el = document.createElement('span'); el.className = 'divider'; toolbar.append(el); };
  makeButton(gridSettings, 'Grid settings', 'settings', () => {
    gridSettingsMenu.hidden = !gridSettingsMenu.hidden;
    if (!gridSettingsMenu.hidden) positionGridSettingsMenu();
  });
  gridSettings.append(gridSettingsMenu);
  function positionGridSettingsMenu(): void {
    if (gridSettingsMenu.hidden) return;
    const trigger = gridSettings.querySelector('button');
    if (!trigger) return;
    const anchor = trigger.getBoundingClientRect();
    const menu = gridSettingsMenu.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - menu.width - 8, anchor.left));
    const below = anchor.bottom + 6 + menu.height <= window.innerHeight - 8;
    const top = below ? anchor.bottom + 6 : Math.max(8, anchor.top - menu.height - 6);
    gridSettingsMenu.style.left = `${left}px`;
    gridSettingsMenu.style.top = `${top}px`;
  }
  const gridOptions: HTMLButtonElement[] = [];
  for (const size of [4, 8, 16]) {
    const option = makeTextButton(gridSettingsMenu, `${size} px`, () => {
      gridSize = size;
      syncGridBackground();
      gridOptions.forEach(button => button.classList.toggle('active', Number.parseInt(button.textContent ?? '', 10) === gridSize));
      gridSettingsMenu.hidden = true;
    });
    option.classList.toggle('active', size === gridSize); gridOptions.push(option);
  }
  shadow.addEventListener('pointerdown', event => {
    if (!event.composedPath().includes(gridSettings)) gridSettingsMenu.hidden = true;
  });
  let tooltipAnchor: HTMLElement | null = null;
  function positionTooltip(): void {
    if (!tooltipAnchor || tooltip.hidden) return;
    const anchor = tooltipAnchor.getBoundingClientRect(); const tip = tooltip.getBoundingClientRect();
    const left = Math.max(8, Math.min(window.innerWidth - tip.width - 8, anchor.left + anchor.width / 2 - tip.width / 2));
    const below = anchor.bottom + tip.height + 8 <= window.innerHeight;
    const top = below ? anchor.bottom + 8 : Math.max(8, anchor.top - tip.height - 8);
    tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
  }
  function showTooltip(anchor: HTMLElement, label: string): void {
    tooltipAnchor = anchor; tooltip.textContent = label; tooltip.hidden = false; positionTooltip();
  }
  function hideTooltip(anchor: HTMLElement): void {
    if (tooltipAnchor !== anchor) return;
    tooltipAnchor = null; tooltip.hidden = true;
  }
  function bindTooltip(element: HTMLElement, label: string): void {
    element.addEventListener('pointerenter', () => showTooltip(element, label));
    element.addEventListener('pointerleave', () => hideTooltip(element));
    element.addEventListener('focus', () => showTooltip(element, label));
    element.addEventListener('blur', () => hideTooltip(element));
  }
  const selectButton = makeButton(toolbar, 'Select and move (V)', 'select', () => setTool('select'));
  const rectButton = makeButton(toolbar, 'Draw rectangle (R)', 'rect', () => setTool('rect'));
  const circleButton = makeButton(toolbar, 'Draw circle (C)', 'circle', () => setTool('circle'));
  divider();
  const generateButton = makeTextButton(toolbar, 'Generate', () => { void requestCode(false); }, 'primary');
  makeButton(toolbar, 'Close editor', 'close', closeEditor);
  addBreakpointButton = makeButton(breakpointGroup, 'Add breakpoint', 'breakpoint', addBreakpoint, 'add-breakpoint');

  function closeEditor(): void {
    tooltip.hidden = true; tooltipAnchor = null;
    window.removeEventListener('resize', onViewportResize); window.removeEventListener('resize', positionTooltip); window.removeEventListener('resize', positionStyleSettingsPopover); window.removeEventListener('resize', positionDownloadPopover);
    window.removeEventListener('scroll', updateBoardPosition, true); window.removeEventListener('scroll', positionTooltip, true);
    document.removeEventListener('keydown', onKeyDown, true); host.remove(); delete state.__uiShellSelectedElement; delete state.__uiShellEditorCleanup;
  }
  function updateBoardPosition(): void {
    const selected = state.__uiShellSelectedElement;
    if (selected?.isConnected) {
      const rect = selected.getBoundingClientRect(); board.style.left = `${rect.left}px`; board.style.top = `${rect.top}px`;
      board.style.width = `${Math.max(1, rect.width)}px`; board.style.height = `${Math.max(1, rect.height)}px`;
    }
    syncGridBackground();
    updateBackdrop();
    if (!gridSettingsMenu.hidden) positionGridSettingsMenu();
  }
  function setTool(next: typeof tool): void {
    tool = next; board.classList.toggle('selecting', tool === 'select');
    selectButton.classList.toggle('active', tool === 'select'); rectButton.classList.toggle('active', tool === 'rect'); circleButton.classList.toggle('active', tool === 'circle');
  }
  function syncGenerateButton(): void {
    generateButton.disabled = !layouts.some(layout => layout.shapes.length > 0);
  }
  function snapshot(): EditorSnapshot {
    return { layouts: layouts.map(layout => ({ ...layout, shapes: layout.shapes.map(shape => ({ ...shape })) })), activeViewportWidth: active.viewportWidth };
  }
  function recordHistory(entry = snapshot()): void {
    history.push(entry);
    if (history.length > 100) history.shift();
  }
  function undo(): void {
    const previous = history.pop();
    if (!previous) return;
    layouts.splice(0, layouts.length, ...previous.layouts.map(layout => ({ ...layout, shapes: layout.shapes.map(shape => ({ ...shape })) })));
    const restored = layouts.find(layout => layout.viewportWidth === previous.activeViewportWidth) ?? layoutForViewport(window.innerWidth);
    selectedId = null; modify = false; draft = null; gesture = null;
    activateLayout(restored);
    syncGenerateButton();
  }
  function updateAddBreakpointButton(): void {
    if (addBreakpointButton) addBreakpointButton.disabled = layouts.some(layout => layout.viewportWidth === window.innerWidth);
  }
  function refreshBreakpointTabs(): void {
    breakpointTabs.replaceChildren();
    for (const layout of [...layouts].sort((a, b) => b.viewportWidth - a.viewportWidth)) {
      const item = document.createElement('div'); item.className = 'breakpoint-tab'; item.classList.toggle('active', layout === active);
      const tab = document.createElement('button'); tab.type = 'button'; tab.textContent = `${layout.viewportWidth}px`;
      tab.setAttribute('aria-label', `Select ${layout.viewportWidth}px breakpoint`); tab.setAttribute('aria-pressed', String(layout === active)); bindTooltip(tab, `Layout ${layout.viewportWidth}px`);
      tab.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); activateLayout(layout); });
      item.append(tab);
      if (layouts.length > 1) {
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'breakpoint-delete'; remove.setAttribute('aria-label', `Delete ${layout.viewportWidth}px breakpoint`); bindTooltip(remove, `Delete ${layout.viewportWidth}px breakpoint`);
        remove.innerHTML = `<svg viewBox="0 0 256 256" aria-hidden="true">${icons.close}</svg>`;
        remove.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); removeBreakpoint(layout); });
        item.append(remove);
      }
      breakpointTabs.append(item);
    }
    updateAddBreakpointButton();
  }
  function removeBreakpoint(layout: CanvasLayout): void {
    if (layouts.length <= 1) return;
    const wasActive = active === layout;
    const index = layouts.indexOf(layout);
    if (index < 0) return;
    recordHistory();
    layouts.splice(index, 1);
    if (wasActive) activateLayout(layoutForViewport(window.innerWidth));
    else refreshBreakpointTabs();
  }
  function activateLayout(layout: CanvasLayout): void {
    active = layout; selectedId = null; modify = false; draft = null;
    svg.setAttribute('viewBox', `0 0 ${active.width} ${active.height}`);
    setTool('rect'); refreshBreakpointTabs(); drawShapes(); updateBoardPosition();
  }
  function layoutForViewport(viewportWidth: number): CanvasLayout {
    const ascending = [...layouts].sort((a, b) => a.viewportWidth - b.viewportWidth);
    return ascending.find(layout => layout.viewportWidth >= viewportWidth) ?? ascending[ascending.length - 1]!;
  }
  function onViewportResize(): void {
    const responsiveLayout = layoutForViewport(window.innerWidth);
    if (responsiveLayout !== active) activateLayout(responsiveLayout);
    updateBoardPosition();
    updateAddBreakpointButton();
    drawShapes();
  }
  function snap(value: number, limit: number): number { return Math.max(0, Math.min(limit, Math.round(value / gridSize) * gridSize)); }
  function point(event: PointerEvent): { x: number; y: number } {
    const rect = svg.getBoundingClientRect();
    return { x: snap((event.clientX - rect.left) * active.width / Math.max(rect.width, 1), active.width), y: snap((event.clientY - rect.top) * active.height / Math.max(rect.height, 1), active.height) };
  }
  function currentShape(start: { x: number; y: number }, end: { x: number; y: number }, kind: 'rect' | 'circle', id = ''): CanvasShape {
    const dx = Math.abs(end.x - start.x); const dy = Math.abs(end.y - start.y);
    if (kind === 'rect') return { id, kind, x: Math.min(start.x, end.x), y: Math.min(start.y, end.y), width: dx, height: dy };
    const size = Math.min(Math.max(dx, dy), end.x < start.x ? start.x : active.width - start.x, end.y < start.y ? start.y : active.height - start.y);
    return { id, kind, x: end.x < start.x ? start.x - size : start.x, y: end.y < start.y ? start.y - size : start.y, width: size, height: size };
  }
  function findShape(id: string | null): CanvasShape | undefined { return active.shapes.find(shape => shape.id === id); }
  function showAlignmentGuides(shape: CanvasShape, peerShapes: CanvasShape[]): void {
    guideLayer.replaceChildren();
    const bounds = board.getBoundingClientRect();
    const toleranceX = 6 * active.width / Math.max(bounds.width, 1);
    const toleranceY = 6 * active.height / Math.max(bounds.height, 1);
    const findMatch = (moving: number[], targets: number[], tolerance: number): { position: number } | null => {
      let closest: { position: number; distance: number } | null = null;
      for (const current of moving) for (const target of targets) {
        const distance = Math.abs(target - current);
        if (distance <= tolerance && (!closest || distance < closest.distance)) closest = { position: target, distance };
      }
      return closest ? { position: closest.position } : null;
    };
    const otherShapes = peerShapes.filter(other => other.id !== shape.id);
    const xMatch = findMatch(
      [shape.x, shape.x + shape.width / 2, shape.x + shape.width],
      otherShapes.flatMap(other => [other.x, other.x + other.width / 2, other.x + other.width]),
      toleranceX
    );
    const yMatch = findMatch(
      [shape.y, shape.y + shape.height / 2, shape.y + shape.height],
      otherShapes.flatMap(other => [other.y, other.y + other.height / 2, other.y + other.height]),
      toleranceY
    );
    if (xMatch) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('alignment-guide'); line.setAttribute('x1', String(xMatch.position)); line.setAttribute('x2', String(xMatch.position));
      line.setAttribute('y1', '0'); line.setAttribute('y2', String(active.height)); guideLayer.append(line);
    }
    if (yMatch) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.classList.add('alignment-guide'); line.setAttribute('y1', String(yMatch.position)); line.setAttribute('y2', String(yMatch.position));
      line.setAttribute('x1', '0'); line.setAttribute('x2', String(active.width)); guideLayer.append(line);
    }
  }
  function clearAlignmentGuides(): void { guideLayer.replaceChildren(); }
  function drawShapes(): void {
    syncGenerateButton();
    shapeLayer.replaceChildren();
    for (const shape of [...active.shapes, ...(draft ? [draft] : [])]) {
      const node = document.createElementNS('http://www.w3.org/2000/svg', shape.kind === 'circle' ? 'ellipse' : 'rect');
      node.dataset.shapeId = shape.id; node.setAttribute('fill', shape.id === selectedId ? '#cbd5ff' : '#e8e8eb'); node.setAttribute('fill-opacity', draft ? '.78' : '.95');
      if (tool === 'select') node.style.cursor = 'move';
      node.setAttribute('stroke', shape.id === selectedId ? '#345dd8' : '#c5c8d0'); node.setAttribute('stroke-width', '1');
      if (shape.kind === 'circle') { node.setAttribute('cx', String(shape.x + shape.width / 2)); node.setAttribute('cy', String(shape.y + shape.height / 2)); node.setAttribute('rx', String(shape.width / 2)); node.setAttribute('ry', String(shape.height / 2)); }
      else { node.setAttribute('x', String(shape.x)); node.setAttribute('y', String(shape.y)); node.setAttribute('width', String(shape.width)); node.setAttribute('height', String(shape.height)); node.setAttribute('rx', '3'); }
      shapeLayer.append(node);
    }
    const selected = findShape(selectedId); selectionMenu.hidden = !selected;
    if (!selected) { selectionMenu.replaceChildren(); return; }
    selectionMenu.replaceChildren();
    makeButton(selectionMenu, 'Duplicate', 'duplicate', () => { recordHistory(); const copy = { ...selected, id: `shape-${nextId++}`, x: snap(selected.x + 12, active.width), y: snap(selected.y + 12, active.height) }; active.shapes.push(copy); selectedId = copy.id; modify = true; setTool('select'); drawShapes(); });
    makeButton(selectionMenu, 'Delete', 'delete', () => { recordHistory(); active.shapes = active.shapes.filter(shape => shape.id !== selectedId); selectedId = null; drawShapes(); });
    makeButton(selectionMenu, modify ? 'Finish editing (E)' : 'Edit (E)', 'edit', toggleEditMode);
    const boardRect = board.getBoundingClientRect();
    const scaleX = boardRect.width / Math.max(active.width, 1); const scaleY = boardRect.height / Math.max(active.height, 1);
    const menuWidth = selectionMenu.getBoundingClientRect().width; const menuHeight = selectionMenu.getBoundingClientRect().height;
    const shapeRight = (selected.x + selected.width) * scaleX;
    const shapeLeft = selected.x * scaleX;
    const rightSide = boardRect.left + shapeRight + 6 + menuWidth <= window.innerWidth;
    const left = rightSide ? shapeRight + 6 : Math.max(0, shapeLeft - menuWidth - 6);
    const top = Math.max(0, Math.min(selected.y * scaleY, window.innerHeight - boardRect.top - menuHeight));
    selectionMenu.style.left = `${left}px`; selectionMenu.style.top = `${top}px`;
    if (modify) {
      const handles = ['n','ne','e','se','s','sw','w','nw'];
      for (const handle of handles) {
        const [cx, cy] = handlePosition(selected, handle); const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        node.classList.add('handle', `handle-${handle}`); node.dataset.handle = handle; node.dataset.shapeId = selected.id; node.setAttribute('x', String(cx - 4)); node.setAttribute('y', String(cy - 4)); node.setAttribute('width', '8'); node.setAttribute('height', '8'); node.setAttribute('rx', '2'); shapeLayer.append(node);
      }
    }
  }
  function handlePosition(shape: CanvasShape, handle: string): [number, number] {
    const x = handle.includes('w') ? shape.x : handle.includes('e') ? shape.x + shape.width : shape.x + shape.width / 2;
    const y = handle.includes('n') ? shape.y : handle.includes('s') ? shape.y + shape.height : shape.y + shape.height / 2; return [x, y];
  }
  function addBreakpoint(): void {
    const viewportWidth = window.innerWidth;
    const existing = layouts.find(layout => layout.viewportWidth === viewportWidth);
    if (existing) { activateLayout(existing); return; }
    const rect = state.__uiShellSelectedElement?.getBoundingClientRect();
    const width = Math.max(4, Math.min(10_000, rect?.width ?? window.innerWidth)); const height = Math.max(4, Math.min(10_000, rect?.height ?? active.height));
    const next = { viewportWidth, width, height, shapes: [] };
    recordHistory(); layouts.push(next); activateLayout(next);
  }
  async function requestCode(download: boolean, format: ExportFormat = 'react'): Promise<void> {
    if (!layouts.some(layout => layout.shapes.length)) return;
    const opensReview = !download;
    if (opensReview) toolbar.hidden = true;
    const base = layouts.reduce((largest, layout) => layout.viewportWidth > largest.viewportWidth ? layout : largest);
    const others = layouts.filter(layout => layout !== base).map(layout => ({ ...layout }));
    try {
      const response = await chrome.runtime.sendMessage({ type: 'ui-shell:render-manual', componentName: generatedComponentName, width: base.width, height: base.height, shapes: base.shapes, breakpoints: others, animation, customClass: animation === 'custom' ? customAnimationClass : '', backgroundColor: placeholderBackgroundColor, borderRadius: placeholderBorderRadius, animationDuration, compressed: compressedOutput, format, download });
      if (!response?.success || typeof response.tsx !== 'string') throw new Error(response?.error ?? 'Generation failed.');
      generatedDocuments = { react: response.tsx, angular: response.angular ?? '', html: response.html ?? '' };
      setCodeFormat(activeCodeFormat);
      preview.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;padding:24px;font-family:system-ui,sans-serif}${response.css ?? ''}</style></head><body>${response.previewHtml ?? ''}</body></html>`;
      review.hidden = false;
    } catch (error) { if (opensReview) toolbar.hidden = false; console.error('UISK: generation failed', error); }
  }
  reviewHead.append(reviewBrand);
  const previewButton = makeButton(reviewHead, 'Preview', 'eye', () => setReviewTab('preview'));
  const codeButton = makeButton(reviewHead, 'Code', 'code', () => setReviewTab('code'));
  const styleSettingsButton = makeButton(reviewHead, 'Settings', 'style-settings', () => {
    downloadPopover.hidden = true; downloadButton?.classList.remove('active');
    settingsPanel.hidden = !settingsPanel.hidden;
    styleSettingsButton.classList.toggle('active', !settingsPanel.hidden);
    if (!settingsPanel.hidden) requestAnimationFrame(positionStyleSettingsPopover);
  }, 'style-settings-button');
  function positionStyleSettingsPopover(): void {
    if (settingsPanel.hidden) return;
    const anchor = styleSettingsButton.getBoundingClientRect();
    const popover = settingsPanel.getBoundingClientRect();
    const bounds = review.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(bounds.left + margin, Math.min(anchor.left, bounds.right - popover.width - margin));
    let top = anchor.bottom + margin;
    if (top + popover.height > bounds.bottom - margin) top = anchor.top - popover.height - margin;
    top = Math.max(bounds.top + margin, Math.min(top, bounds.bottom - popover.height - margin));
    settingsPanel.style.left = `${left}px`;
    settingsPanel.style.top = `${top}px`;
  }
  let downloadButton: HTMLButtonElement | null = null;
  function positionDownloadPopover(): void {
    if (downloadPopover.hidden || !downloadButton) return;
    const anchor = downloadButton.getBoundingClientRect();
    const popover = downloadPopover.getBoundingClientRect();
    const bounds = review.getBoundingClientRect();
    const margin = 8;
    const left = Math.max(bounds.left + margin, Math.min(anchor.right - popover.width, bounds.right - popover.width - margin));
    let top = anchor.bottom + margin;
    if (top + popover.height > bounds.bottom - margin) top = anchor.top - popover.height - margin;
    top = Math.max(bounds.top + margin, Math.min(top, bounds.bottom - popover.height - margin));
    downloadPopover.style.left = `${left}px`;
    downloadPopover.style.top = `${top}px`;
  }
  review.addEventListener('pointerdown', event => {
    const path = event.composedPath();
    if (!settingsPanel.hidden && !path.includes(settingsPanel) && !path.includes(styleSettingsButton)) {
      settingsPanel.hidden = true; styleSettingsButton.classList.remove('active');
    }
    if (!downloadPopover.hidden && !path.includes(downloadPopover) && (!downloadButton || !path.includes(downloadButton))) {
      downloadPopover.hidden = true; downloadButton?.classList.remove('active');
    }
  });
  function setReviewTab(tab: 'preview' | 'code'): void {
    preview.hidden = tab !== 'preview'; codePanel.hidden = tab !== 'code';
    previewButton.classList.toggle('active', tab === 'preview'); codeButton.classList.toggle('active', tab === 'code');
    settingsPanel.hidden = true; styleSettingsButton.classList.remove('active'); downloadPopover.hidden = true; downloadButton?.classList.remove('active');
  }
  setReviewTab('preview');
  const spacer = document.createElement('span'); spacer.className = 'spacer'; reviewHead.append(spacer);
  function syncAnimationSettings(): void {
    const hasPresetDuration = animation === 'breathe' || animation === 'grow';
    durationSetting.hidden = !hasPresetDuration;
    customClassRow.hidden = animation !== 'custom';
  }
  function commitComponentName(): boolean {
    const candidate = nameInput.value.trim();
    if (!/^[A-Z][A-Za-z0-9]*$/.test(candidate)) {
      nameInput.setCustomValidity('Use a PascalCase React component name, such as AccountSkeleton.');
      nameInput.reportValidity();
      return false;
    }
    nameInput.setCustomValidity('');
    nameInput.value = candidate;
    generatedComponentName = candidate;
    return true;
  }
  nameInput.addEventListener('change', () => { if (commitComponentName()) void requestCode(false); });
  animationSelect.addEventListener('change', () => {
    animation = animationSelect.value as typeof animation;
    syncAnimationSettings();
    void requestCode(false);
  });
  durationInput.addEventListener('input', () => {
    animationDuration = Number(durationInput.value);
    durationValue.textContent = `${animationDuration.toFixed(1)}s`;
    void requestCode(false);
  });
  placeholderColorInput.addEventListener('change', () => {
    placeholderBackgroundColor = placeholderColorInput.value;
    void requestCode(false);
  });
  radiusInput.addEventListener('input', () => {
    placeholderBorderRadius = Number(radiusInput.value);
    radiusValue.textContent = `${placeholderBorderRadius}px`;
    void requestCode(false);
  });
  customClassInput.addEventListener('change', () => {
    const candidate = customClassInput.value.trim();
    if (candidate && !/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(candidate)) {
      customClassInput.setCustomValidity('Enter a valid CSS class name using letters, numbers, underscores, or hyphens.');
      customClassInput.reportValidity();
      return;
    }
    customClassInput.setCustomValidity('');
    customAnimationClass = candidate;
    void requestCode(false);
  });
  compressionInput.addEventListener('change', () => {
    compressedOutput = compressionInput.checked;
    void requestCode(false);
  });
  for (const [format, label] of [['react', 'React'], ['angular', 'Angular'], ['html', 'HTML']] as const) {
    const tab = makeTextButton(codeTabs, label, () => setCodeFormat(format), 'code-tab');
    tab.setAttribute('role', 'tab');
    codeTabButtons.set(format, tab);
  }
  setCodeFormat('react');
  makeButton(codeToolbar, 'Copy code', 'copy', () => { code.focus(); code.select(); document.execCommand('copy'); });
  const exportButton = makeButton(reviewHead, 'Download', 'download', () => {
    settingsPanel.hidden = true; styleSettingsButton.classList.remove('active');
    downloadPopover.hidden = !downloadPopover.hidden;
    downloadButton?.classList.toggle('active', !downloadPopover.hidden);
    if (!downloadPopover.hidden) requestAnimationFrame(positionDownloadPopover);
  }, 'primary review-download-button');
  downloadButton = exportButton;
  const downloadLabel = document.createElement('span'); downloadLabel.textContent = 'Download'; exportButton.append(downloadLabel);
  for (const [format, label] of [['react', 'React'], ['angular', 'Angular'], ['html', 'HTML']] as const) {
    const row = document.createElement('div'); row.className = 'download-format-row';
    const formatLabel = document.createElement('span'); formatLabel.className = 'download-format-name'; formatLabel.textContent = label;
    const option = makeButton(row, `Download ${label} file`, 'download', () => {
      if (!commitComponentName()) return;
      downloadPopover.hidden = true; downloadButton?.classList.remove('active');
      void requestCode(true, format);
    }, 'download-format-button');
    row.prepend(formatLabel); downloadPopover.append(row);
  }
  review.append(downloadPopover);
  makeButton(reviewHead, 'Close review', 'close', closeReview);
  function closeReview(): void { review.hidden = true; toolbar.hidden = false; settingsPanel.hidden = true; styleSettingsButton.classList.remove('active'); downloadPopover.hidden = true; downloadButton?.classList.remove('active'); }
  function toggleEditMode(): void {
    if (!findShape(selectedId)) return;
    modify = !modify;
    if (modify) setTool('select');
    drawShapes();
  }
  function onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') { if (!review.hidden) closeReview(); else closeEditor(); return; }
    const isTyping = event.composedPath().some(target => target instanceof HTMLElement && (target.matches('input,textarea,select,[contenteditable="true"]') || target.isContentEditable));
    if (isTyping) return;
    if ((event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault(); event.stopPropagation(); undo(); return;
    }
    if (!review.hidden || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const shortcut = event.key.toLowerCase();
    if (shortcut === 'v') setTool('select');
    else if (shortcut === 'r') setTool('rect');
    else if (shortcut === 'c') setTool('circle');
    else if (shortcut === 'e' && findShape(selectedId)) toggleEditMode();
    else return;
    event.preventDefault();
  }
  svg.addEventListener('pointerdown', event => {
    event.preventDefault(); event.stopPropagation(); const target = event.target instanceof SVGElement ? event.target : null;
    const at = point(event); const handle = target?.dataset.handle; const hitId = target?.dataset.shapeId ?? null;
    if (tool === 'select') {
      if (!hitId && selectedId) { selectedId = null; modify = false; drawShapes(); }
      else if (hitId) {
        selectedId = hitId; drawShapes(); const shape = findShape(hitId)!;
        gesture = { action: modify && handle ? 'resize' : 'move', start: at, original: { ...shape }, before: snapshot(), ...(handle ? { handle } : {}), moved: false };
        svg.setPointerCapture(event.pointerId);
      }
      return;
    }
    const kind: 'rect' | 'circle' = tool === 'circle' ? 'circle' : 'rect';
    gesture = { action: 'draw', start: at, kind, moved: false }; draft = currentShape(at, at, kind); svg.setPointerCapture(event.pointerId); drawShapes();
  });
  svg.addEventListener('pointermove', event => {
    event.stopPropagation(); if (!gesture) return; const at = point(event); if (Math.abs(at.x - gesture.start.x) + Math.abs(at.y - gesture.start.y) >= 4) gesture.moved = true;
    if (!gesture.moved) return;
    if (gesture.action === 'draw') draft = currentShape(gesture.start, at, gesture.kind ?? 'rect');
    else if (gesture.original && gesture.action === 'move') {
      const shape = findShape(selectedId); if (shape) {
        const original = gesture.original;
        shape.x = snap(original.x + at.x - gesture.start.x, active.width - shape.width);
        shape.y = snap(original.y + at.y - gesture.start.y, active.height - shape.height);
        const peers = active.shapes.filter(other => other.id !== shape.id);
        showAlignmentGuides(shape, peers);
      }
    } else if (gesture.original && gesture.action === 'resize') {
      const shape = findShape(selectedId); if (shape) {
        const h = gesture.handle ?? ''; const original = gesture.original;
        if (shape.kind === 'circle') {
          const west = h.includes('w'); const east = h.includes('e'); const north = h.includes('n'); const south = h.includes('s');
          const centerX = original.x + original.width / 2; const centerY = original.y + original.height / 2;
          let anchorX: number; let anchorY: number; let maxSize: number; let desiredSize: number;
          if ((west || east) && (north || south)) {
            anchorX = west ? original.x + original.width : original.x;
            anchorY = north ? original.y + original.height : original.y;
            maxSize = Math.min(west ? anchorX : active.width - anchorX, north ? anchorY : active.height - anchorY);
            desiredSize = Math.max(Math.abs(at.x - anchorX), Math.abs(at.y - anchorY));
            const size = Math.min(maxSize, Math.max(4, snap(desiredSize, maxSize)));
            shape.x = west ? anchorX - size : anchorX; shape.y = north ? anchorY - size : anchorY; shape.width = size; shape.height = size;
          } else if (west || east) {
            anchorX = west ? original.x + original.width : original.x;
            maxSize = Math.min(west ? anchorX : active.width - anchorX, 2 * Math.min(centerY, active.height - centerY));
            desiredSize = Math.abs(at.x - anchorX);
            const size = Math.min(maxSize, Math.max(4, snap(desiredSize, maxSize)));
            shape.x = west ? anchorX - size : anchorX; shape.y = centerY - size / 2; shape.width = size; shape.height = size;
          } else if (north || south) {
            anchorY = north ? original.y + original.height : original.y;
            maxSize = Math.min(north ? anchorY : active.height - anchorY, 2 * Math.min(centerX, active.width - centerX));
            desiredSize = Math.abs(at.y - anchorY);
            const size = Math.min(maxSize, Math.max(4, snap(desiredSize, maxSize)));
            shape.x = centerX - size / 2; shape.y = north ? anchorY - size : anchorY; shape.width = size; shape.height = size;
          }
        } else {
          let left = original.x; let top = original.y; let right = left + original.width; let bottom = top + original.height;
          if (h.includes('w')) left = Math.min(snap(at.x, active.width), right - 4); if (h.includes('e')) right = Math.max(snap(at.x, active.width), left + 4);
          if (h.includes('n')) top = Math.min(snap(at.y, active.height), bottom - 4); if (h.includes('s')) bottom = Math.max(snap(at.y, active.height), top + 4);
          shape.x = left; shape.y = top; shape.width = right - left; shape.height = bottom - top;
        }
      }
    }
    drawShapes();
  });
  svg.addEventListener('pointerup', event => {
    event.preventDefault(); event.stopPropagation(); if (!gesture) return;
    const was = gesture; const at = point(event); gesture = null; clearAlignmentGuides();
    if (was.action === 'draw') {
      if (!was.moved) { draft = null; selectedId = (event.target as SVGElement).dataset.shapeId ?? null; setTool('select'); drawShapes(); return; }
      const shape = currentShape(was.start, at, was.kind ?? 'rect', `shape-${nextId++}`); draft = null;
      if (shape.width >= 4 && shape.height >= 4) { recordHistory(); active.shapes.push(shape); selectedId = shape.id; }
    } else if (was.moved && was.before) {
      recordHistory(was.before);
    }
    drawShapes();
  });
  svg.addEventListener('pointercancel', () => { if (gesture?.before) { layouts.splice(0, layouts.length, ...gesture.before.layouts.map(layout => ({ ...layout, shapes: layout.shapes.map(shape => ({ ...shape })) }))); active = layouts.find(layout => layout.viewportWidth === gesture?.before?.activeViewportWidth) ?? active; } gesture = null; draft = null; clearAlignmentGuides(); drawShapes(); });
  svg.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); });
  shadow.append(style, backdrop, toolbar, board, review, tooltip); document.documentElement.append(host);
  svg.setAttribute('viewBox', `0 0 ${initialWidth} ${initialHeight}`); board.style.left = `${bounds.x}px`; board.style.top = `${bounds.y}px`; board.style.width = `${initialWidth}px`; board.style.height = `${initialHeight}px`; syncGridBackground(); updateBackdrop();
  state.__uiShellEditorCleanup = closeEditor; window.addEventListener('resize', onViewportResize); window.addEventListener('resize', positionTooltip); window.addEventListener('resize', positionStyleSettingsPopover); window.addEventListener('resize', positionDownloadPopover); window.addEventListener('scroll', updateBoardPosition, true); window.addEventListener('scroll', positionTooltip, true); document.addEventListener('keydown', onKeyDown, true);
  setTool('rect'); refreshBreakpointTabs(); drawShapes();
}
