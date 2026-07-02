const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  screen: {
    padding: 16,
    contentHorizontal: 16,
    contentVertical: 16,
  },

  card: {
    margin: 12,
    padding: 16,
    borderRadius: 8,
  },

  button: {
    margin: 8,
    marginVertical: 10,
  },

  input: {
    marginBottom: 16,
  },

  section: {
    titleMarginTop: 24,
    titleMarginBottom: 12,
  },
} as const;

export default spacing;