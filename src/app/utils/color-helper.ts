/**
 * Helper to resolve CSS variables to RGB values on the client side.
 * This is needed because THREE.js requires explicit color values, but we are using CSS variables for theming.
 */
export function resolveColorVar(colorString: string): [number, number, number] {
  if (typeof window === "undefined") return [0, 0, 0];

  let resolved = colorString;
  if (colorString.startsWith("var(")) {
    const varName = colorString.match(/var\((.+?)\)/)?.[1];
    if (varName) {
      const computed = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (computed) resolved = computed;
    }
  }

  // Handle "rgba(r, g, b, a)" or "rgb(r, g, b)"
  const rgbaMatch = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbaMatch) {
    return [parseInt(rgbaMatch[1]), parseInt(rgbaMatch[2]), parseInt(rgbaMatch[3])];
  }
  
  // Handle comma-separated "r,g,b" (legacy format)
  if (resolved.includes(",")) {
     const parts = resolved.split(",").map(Number);
     if (parts.length >= 3 && !parts.some(isNaN)) {
         return [parts[0], parts[1], parts[2]];
     }
  }

  return [0, 0, 0];
}

