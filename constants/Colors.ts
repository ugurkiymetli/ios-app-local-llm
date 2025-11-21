import { useColorScheme } from 'react-native';

const Colors = {
  light: {
    text: '#000',
    background: '#F2F2F7', // iOS grouped background
    card: '#FFFFFF',
    tint: '#007AFF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#007AFF',
    separator: '#C6C6C8',
    secondaryText: '#8E8E93',
    inputBackground: '#FFFFFF',
  },
  dark: {
    text: '#fff',
    background: '#000000',
    card: '#1C1C1E', // iOS dark grouped cell
    tint: '#0A84FF',
    tabIconDefault: '#8E8E93',
    tabIconSelected: '#0A84FF',
    separator: '#38383A',
    secondaryText: '#8E8E93',
    inputBackground: '#1C1C1E',
  },
};

export function useThemeColor() {
  const theme = useColorScheme() ?? 'light';
  return Colors[theme];
}
