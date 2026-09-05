// Powered by OnSpace.AI
export const Colors = {
  // Base
  background: '#080C14',
  surface: '#0F1623',
  surfaceElevated: '#151E2E',
  border: '#1E2D44',

  // Brand
  primary: '#00C8FF',
  primaryDim: '#0090BE',
  primaryGlow: 'rgba(0, 200, 255, 0.15)',

  // Semantic
  success: '#00E676',
  successDim: '#00A854',
  successGlow: 'rgba(0, 230, 118, 0.12)',

  warning: '#FFB300',
  warningDim: '#E65100',
  warningGlow: 'rgba(255, 179, 0, 0.12)',

  danger: '#FF3D57',
  dangerDim: '#C62828',
  dangerGlow: 'rgba(255, 61, 87, 0.12)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#8A9BB5',
  textMuted: '#4A5E78',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Typography = {
  hero: { fontSize: 28, fontWeight: '700' as const, color: '#FFFFFF' },
  title: { fontSize: 22, fontWeight: '700' as const, color: '#FFFFFF' },
  subtitle: { fontSize: 18, fontWeight: '600' as const, color: '#FFFFFF' },
  body: { fontSize: 16, fontWeight: '400' as const, color: '#FFFFFF' },
  label: { fontSize: 14, fontWeight: '500' as const, color: '#8A9BB5' },
  caption: { fontSize: 12, fontWeight: '400' as const, color: '#4A5E78' },
};
