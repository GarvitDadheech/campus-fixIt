import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFEBEE',
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.error,
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
  },
  text: {
    color: Colors.light.error,
    fontSize: 14,
  },
});

