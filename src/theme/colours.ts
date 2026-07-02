const colours = {
  inkBlack: '#101014',
  charcoal: '#1C1C1C',
  nightPurple: '#2E0854',
  royalPurple: '#4B1678',
  gildedGold: '#D4AF37',
  brightGold: '#FFD700',
  parchment: '#F5E6C8',
  oldPaper: '#D9C49A',
  silver: '#C0C0C0',
  copper: '#CD7F32',
  errorRed: '#B94A48',
  successGreen: '#4E9F3D',

  semantic: {
    background: '#1C1C1C',
    surface: '#2E0854',
    primary: '#4B1678',
    accent: '#D4AF37',
    text: '#f5f5dc',
    onSurface: '#f5f5dc',
    onPrimary: '#ffd700',
  },

  text: {
    primary: '#f5f5dc',
    secondary: '#aaa',
    muted: '#666',
    inverse: '#101014',
    gold: '#FFD700',
    silver: '#C0C0C0',
    copper: '#CD7F32',
    error: '#ff8a80',
  },

  overlay: {
    purple80: 'rgba(46, 8, 84, 0.8)',
    gold30: 'rgba(255, 215, 0, 0.3)',
    gold20: 'rgba(255, 215, 0, 0.2)',
    gold10: 'rgba(255, 215, 0, 0.1)',
  },

  card: {
    parchment: 'rgba(255, 255, 220, 0.9)',
    dark: '#2a2a2a',
    darkBorder: 'rgba(255, 215, 0, 0.2)',
    playerDark: '#2a2a2a',
    playerBorder: 'rgba(255, 215, 0, 0.1)',
  },
} as const;

export default colours;