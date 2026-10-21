export function validateComponentName(name: string): string {
  if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
    throw new Error('Component name must be a valid PascalCase React identifier (for example, AccountSkeleton).');
  }
  return name;
}

export function getClassNamespace(componentName: string, layout = ''): string {
  const name = validateComponentName(componentName);
  let hash = 14695981039346656037n;
  const mask = (1n << 64n) - 1n;
  for (const character of `${name}:${layout}`) {
    hash = ((hash ^ BigInt(character.charCodeAt(0))) * 1099511628211n) & mask;
  }
  return `uisk-${hash.toString(36)}`;
}
