import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors } from '../../constants/Colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.button];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({ backgroundColor: Colors.light.primary } as ViewStyle);
        break;
      case 'secondary':
        baseStyle.push({ backgroundColor: Colors.light.primaryLight } as ViewStyle);
        break;
      case 'outline':
        baseStyle.push({
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: Colors.light.primary,
        } as ViewStyle);
        break;
      case 'danger':
        baseStyle.push({ backgroundColor: Colors.light.error } as ViewStyle);
        break;
    }

    if (disabled || loading) {
      baseStyle.push({ opacity: 0.5 } as ViewStyle);
    }

    return baseStyle;
  };

  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.buttonText];
    
    switch (variant) {
      case 'primary':
        baseStyle.push({ color: Colors.light.secondary } as TextStyle);
        break;
      case 'secondary':
        baseStyle.push({ color: Colors.light.secondary } as TextStyle);
        break;
      case 'outline':
        baseStyle.push({ color: Colors.light.primary } as TextStyle);
        break;
      case 'danger':
        baseStyle.push({ color: Colors.light.secondary } as TextStyle);
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? Colors.light.primary : Colors.light.secondary}
        />
      ) : (
        <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
