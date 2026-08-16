/**
 * Theme types matching the Figma design.
 *
 * The Figma shows:
 * - Theme menu: Light ✓, Dark
 * - Color Mode menu: Amber, Blue ✓, Pink, Rose, Emerald, Black
 */

export type Theme = 'light' | 'dark';
export type ColorMode = 'amber' | 'blue' | 'pink' | 'rose' | 'emerald' | 'black';

export const THEMES: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export const COLOR_MODES: { value: ColorMode; label: string; swatch: string }[] = [
  { value: 'amber', label: 'Amber', swatch: '#f59e0b' },
  { value: 'blue', label: 'Blue', swatch: '#3b82f6' },
  { value: 'pink', label: 'Pink', swatch: '#ec4899' },
  { value: 'rose', label: 'Rose', swatch: '#f43f5e' },
  { value: 'emerald', label: 'Emerald', swatch: '#10b981' },
  { value: 'black', label: 'Black', swatch: '#1f2937' },
];

/** Storage keys for persistence */
export const THEME_STORAGE_KEY = 'ablespace-theme';
export const COLOR_STORAGE_KEY = 'ablespace-color';

/** Default values */
export const DEFAULT_THEME: Theme = 'light';
export const DEFAULT_COLOR: ColorMode = 'blue';
