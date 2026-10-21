import { getClassNamespace, validateComponentName } from './naming.js';

export type ManualShapeKind = 'rect' | 'circle';
export type ManualAnimation = 'none' | 'breathe' | 'grow' | 'custom';
export type ManualOutputFormat = 'react' | 'angular' | 'html';
export interface ManualShape {
  id: string;
  kind: ManualShapeKind;
  x: number;
  y: number;
  width: number;
  height: number;
}
export interface ManualBreakpoint {
  viewportWidth: number;
  width: number;
  height: number;
  shapes: ManualShape[];
}

interface LayoutOutput { id: string; className: string; markup: string; previewMarkup: string; css: string }

const bounded = (value: number, max: number): number => Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0;
const dimension = (value: number): number => Number.isFinite(value) ? Math.max(1, Math.min(10_000, Math.round(value))) : 1;
const greatestCommonDivisor = (first: number, second: number): number => second ? greatestCommonDivisor(second, first % second) : first;

function buildLayout(id: string, scope: string, width: number, height: number, shapes: ManualShape[], animationClass: string, customClass: string, compressed: boolean): LayoutOutput {
  const safeWidth = dimension(width);
  const safeHeight = dimension(height);
  const safeShapes = shapes.slice(0, 500).map((shape, index) => {
    const x = bounded(shape.x, safeWidth);
    const y = bounded(shape.y, safeHeight);
    return {
      id: `shape-${index + 1}`,
      kind: shape.kind === 'circle' ? 'circle' as const : 'rect' as const,
      x, y, width: bounded(shape.width, safeWidth - x), height: bounded(shape.height, safeHeight - y)
    };
  });
  const snappedValues = safeShapes.flatMap(shape => [shape.x, shape.y, shape.width, shape.height])
    .map(value => Math.round(value)).filter(value => value > 0);
  const commonStep = snappedValues.reduce((step, value) => greatestCommonDivisor(step, value), 0) || 1;
  const trackStep = Math.max(commonStep, Math.ceil(safeWidth / 512), Math.ceil(safeHeight / 512));
  const columns = Math.max(1, Math.ceil(safeWidth / trackStep));
  const rows = Math.max(1, Math.ceil(safeHeight / trackStep));
  const shapeMarkup = safeShapes.map(shape => {
    const columnStart = Math.min(columns - 1, Math.round(shape.x / trackStep));
    const rowStart = Math.min(rows - 1, Math.round(shape.y / trackStep));
    const columnSpan = Math.max(1, Math.min(columns - columnStart, Math.round(shape.width / trackStep)));
    const rowSpan = Math.max(1, Math.min(rows - rowStart, Math.round(shape.height / trackStep)));
    const gridColumn = `${columnStart + 1} / span ${columnSpan}`;
    const gridRow = `${rowStart + 1} / span ${rowSpan}`;
    const className = [compressed ? 's' : `${scope}__shape`, compressed ? (shape.kind === 'circle' ? 'c' : 'r') : `${scope}__${shape.kind}`, animationClass, customClass].filter(Boolean).join(' ');
    return {
      jsx: `<span className="${className}" style={{ gridColumn: '${gridColumn}', gridRow: '${gridRow}' }} aria-hidden="true" />`,
      html: `<span class="${className}" style="grid-column:${gridColumn};grid-row:${gridRow}" aria-hidden="true"></span>`
    };
  });
  const layoutIndex = id === 'base' ? -1 : Number(id.slice(id.lastIndexOf('-') + 1));
  const className = compressed ? (layoutIndex < 0 ? 'l' : `l${layoutIndex}`) : `${scope}__layout ${scope}__layout-${id}`;
  return {
    id,
    className,
    markup: `    <div className="${className}">\n${shapeMarkup.map(shape => shape.jsx).join('\n')}\n    </div>`,
    previewMarkup: `    <div class="${className}">\n${shapeMarkup.map(shape => shape.html).join('\n')}\n    </div>`,
    css: `.${compressed ? className : `${scope}__layout-${id}`} { grid-template-columns: repeat(${columns}, minmax(0, 1fr)); grid-template-rows: repeat(${rows}, minmax(0, 1fr)); width: 100%; aspect-ratio: ${safeWidth} / ${safeHeight}; overflow: hidden; }`
  };
}

function compactCss(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}/g, '}').trim();
}

function compactMarkup(markup: string): string {
  return markup.replace(/>\s+</g, '><').trim();
}

export function renderManualReact(
  componentName: string,
  width: number,
  height: number,
  shapes: ManualShape[],
  breakpoints: ManualBreakpoint[] = [],
  animation: ManualAnimation = 'none',
  customClass = '',
  backgroundColor = '#e8e8eb',
  borderRadius = 4,
  animationDuration = 1.6,
  options: { compressed?: boolean } = {}
): { tsx: string; css: string; previewHtml: string; angular: string; html: string } {
  const name = validateComponentName(componentName);
  const boardWidth = dimension(width);
  const boardHeight = dimension(height);
  const safeAnimation: ManualAnimation = ['none', 'breathe', 'grow', 'custom'].includes(animation) ? animation : 'none';
  const safeCustomClass = customClass.trim();
  if (safeCustomClass && !/^[A-Za-z_][A-Za-z0-9_-]{0,63}$/.test(safeCustomClass)) {
    throw new Error('Custom animation class must be a valid CSS class name.');
  }
  if (!/^#[\da-fA-F]{6}$/.test(backgroundColor)) {
    throw new Error('Placeholder background color must be a 6-digit hex color.');
  }
  const safeBackgroundColor = backgroundColor.toLowerCase();
  const safeBorderRadius = Number.isFinite(borderRadius) ? Math.max(0, Math.min(16, Math.round(borderRadius))) : 4;
  const safeAnimationDuration = Number.isFinite(animationDuration) ? Math.max(0.5, Math.min(5, Math.round(animationDuration * 10) / 10)) : 1.6;
  const compressed = options.compressed === true;
  const safeBreakpoints = breakpoints
    .filter(item => Number.isFinite(item.viewportWidth) && item.viewportWidth > 0)
    .slice(0, 20)
    .map(item => ({ ...item, viewportWidth: dimension(item.viewportWidth) }))
    .sort((a, b) => b.viewportWidth - a.viewportWidth);
  const namespace = getClassNamespace(name, JSON.stringify({ boardWidth, boardHeight, shapes, safeBreakpoints, safeAnimation, safeCustomClass, safeBackgroundColor, safeBorderRadius, safeAnimationDuration }));
  const scope = compressed ? `u${namespace.slice(5)}` : namespace;
  const animationClass = safeAnimation === 'breathe' || safeAnimation === 'grow' ? (compressed ? 'a' : `${scope}__animation-${safeAnimation}`) : '';
  const layouts = [
    buildLayout('base', scope, boardWidth, boardHeight, shapes, animationClass, safeCustomClass, compressed),
    ...safeBreakpoints.map((item, index) => buildLayout(`bp-${item.viewportWidth}-${index}`, scope, item.width, item.height, item.shapes, animationClass, safeCustomClass, compressed))
  ];
  const selector = (layout: LayoutOutput): string => layout.className.split(' ').map(className => `.${className}`).join('');
  const baseLayout = layouts[0]!;
  const visibilityRules = safeBreakpoints.length === 0
    ? `${selector(baseLayout)} { display: grid; }`
    : [
      `@media (min-width: ${safeBreakpoints[0]!.viewportWidth + 1}px) { ${selector(baseLayout)} { display: grid; } }`,
      ...safeBreakpoints.map((item, index) => {
        const nextNarrower = safeBreakpoints[index + 1];
        const range = nextNarrower
          ? `(min-width: ${nextNarrower.viewportWidth + 1}px) and (max-width: ${item.viewportWidth}px)`
          : `(max-width: ${item.viewportWidth}px)`;
        return `@media ${range} { ${selector(layouts[index + 1]!)} { display: grid; } }`;
      })
    ].join('\n');
  const animationRules = safeAnimation === 'breathe'
    ? `@keyframes ${scope}-breathe { 0%, 100% { opacity: .58; } 50% { opacity: 1; } }\n.${animationClass} { animation: ${scope}-breathe ${safeAnimationDuration}s ease-in-out infinite; }`
    : safeAnimation === 'grow'
      ? `@keyframes ${scope}-grow { from { transform: translateX(-110%); } to { transform: translateX(180%); } }\n.${animationClass} { position: relative; overflow: hidden; isolation: isolate; }\n.${animationClass}::after { content: ''; position: absolute; z-index: 1; top: 0; bottom: 0; left: 0; width: 60%; border-radius: inherit; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(0,0,0,.16), transparent); animation: ${scope}-grow ${safeAnimationDuration}s ease-in-out infinite; }`
      : '';
  const reducedMotionRule = safeAnimation === 'breathe'
    ? `\n@media (prefers-reduced-motion: reduce) { .${animationClass} { animation: none !important; } }`
    : safeAnimation === 'grow'
      ? `\n@media (prefers-reduced-motion: reduce) { .${animationClass}::after { animation: none !important; } }`
      : '';
  const layoutHiddenSelector = compressed ? layouts.map(selector).join(',') : `.${scope}__layout`;
  const shapeSelector = compressed ? '.s' : `.${scope}__shape`;
  const rectSelector = compressed ? '.r' : `.${scope}__rect`;
  const circleSelector = compressed ? '.c' : `.${scope}__circle`;
  const css = `.${scope} { box-sizing: border-box; width: 100%; }\n${layoutHiddenSelector} { display: none; }\n${visibilityRules}\n${shapeSelector} { display: block; min-width: 0; min-height: 0; width: 100%; height: 100%; background: ${safeBackgroundColor}; }\n${rectSelector} { border-radius: ${safeBorderRadius}px; }\n${circleSelector} { width: 100%; height: auto; max-width: 100%; max-height: 100%; aspect-ratio: 1; align-self: center; justify-self: center; flex-shrink: 0; border-radius: 50%; }\n${animationRules}\n${layouts.map(layout => layout.css).join('\n')}${reducedMotionRule}\n`;
  const previewHtml = `<div class="${scope}" aria-hidden="true">\n${layouts.map(layout => layout.previewMarkup).join('\n')}\n</div>`;
  const outputCss = compressed ? compactCss(css) : css;
  const outputHtml = compressed ? compactMarkup(previewHtml) : previewHtml;
  const embeddedCss = outputCss.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');
  const jsx = layouts.map(layout => layout.markup.replaceAll('className=', 'className=')).join('\n');
  const outputJsx = compressed ? compactMarkup(jsx) : jsx;
  const tsx = compressed ? `const styles=\`${embeddedCss}\`;export function ${name}(){return <><style>{styles}</style><div className="${scope}" aria-hidden="true">${outputJsx}</div></>}export default ${name};` : `const styles = \`\n${embeddedCss}\`;

export function ${name}() {
  return (
    <>
      <style>{styles}</style>
      <div className="${scope}" aria-hidden="true">
${jsx}
      </div>
    </>
  );
}

export default ${name};
`;
  const safeComponentSelector = name.replace(/[A-Z]/g, (letter, index) => `${index ? '-' : ''}${letter.toLowerCase()}`);
  const template = `<div class="${scope}" aria-hidden="true">${layouts.map(layout => layout.previewMarkup).join(compressed ? '' : '\n')}</div>`;
  const angular = compressed
    ? `import { Component } from '@angular/core';@Component({selector:'${safeComponentSelector}',standalone:true,template:\`${template}\`,styles:[\`${outputCss}\`]})export class ${name}{}`
    : `import { Component } from '@angular/core';

@Component({
  selector: '${safeComponentSelector}',
  standalone: true,
  template: \`${template}\`,
  styles: [\`${outputCss}\`]
})
export class ${name} {}
`;
  const html = compressed
    ? `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${outputCss}</style></head><body>${outputHtml}</body></html>`
    : `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>\n${outputCss}  </style>
</head>
<body>
${outputHtml}
</body>
</html>
`;
  const braces = (outputCss.match(/{/g)?.length ?? 0) - (outputCss.match(/}/g)?.length ?? 0);
  if (!tsx.includes(`<div className="${scope}"`) || braces !== 0) throw new Error('Generated manual skeleton failed validation.');
  return { tsx, css: outputCss, previewHtml: outputHtml, angular, html };
}
