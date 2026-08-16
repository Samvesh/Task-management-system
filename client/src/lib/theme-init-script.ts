/**
 * Inline script to prevent flash-of-wrong-theme (FOWT) in Next.js SSR.
 *
 * This script runs BEFORE React hydrates, so the correct theme is
 * applied to the <html> element immediately. Without this, users
 * would briefly see the default theme before React kicks in.
 *
 * It's injected as a raw <script> tag in layout.tsx via
 * dangerouslySetInnerHTML — the only safe way to run JS before hydration.
 */
export const themeInitScript = `
(function() {
  try {
    var theme = localStorage.getItem('ablespace-theme') || 'light';
    var color = localStorage.getItem('ablespace-color') || 'blue';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-color', color);
  } catch (e) {}
})();
`;
