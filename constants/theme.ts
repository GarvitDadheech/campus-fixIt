/**
 * Theme colors - Light blue (cyan) and white color scheme
 */
import { Platform } from 'react-native';
import { Colors as AppColors } from './Colors';

const tintColorLight = '#00BCD4'; // Cyan
const tintColorDark = '#4DD0E1'; // Lighter cyan

// Export both old format (for compatibility) and new format
export const Colors = {
  light: {
    text: AppColors.light.text,
    background: AppColors.light.background,
    tint: tintColorLight,
    icon: AppColors.light.textSecondary,
    tabIconDefault: AppColors.light.textSecondary,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: AppColors.dark.text,
    background: AppColors.dark.background,
    tint: tintColorDark,
    icon: AppColors.dark.textSecondary,
    tabIconDefault: AppColors.dark.textSecondary,
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export default Colors;
