import { MD3DarkTheme } from 'react-native-paper';
import colours from './colours';

const paperTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: colours.semantic.primary,
    onPrimary: colours.semantic.onPrimary,
    secondary: colours.royalPurple,
    onSecondary: colours.parchment,
    background: colours.semantic.background,
    onBackground: colours.semantic.text,
    surface: colours.semantic.surface,
    onSurface: colours.semantic.onSurface,
    accent: colours.semantic.accent,
    error: colours.errorRed,
    onError: colours.inkBlack,
  },
} as const;

export default paperTheme;