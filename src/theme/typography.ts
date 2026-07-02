const typography = {
  display: {
    fontFamily: 'System',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  h1: {
    fontFamily: 'System',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: 0.3,
  },
  h2: {
    fontFamily: 'System',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  h3: {
    fontFamily: 'System',
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: 'System',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: 'System',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: 'System',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: 'System',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  label: {
    fontFamily: 'System',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },
  button: {
    fontFamily: 'System',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
} as const;

export type Typography = typeof typography;
export default typography;