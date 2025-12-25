import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button, Input } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';

export default function ChangePasswordScreen() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    }
    if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const response = await apiService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );
      if (response.success) {
        Alert.alert('Success', 'Password changed successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Change Password</Text>
          <Text style={styles.subtitle}>Enter your current and new password</Text>
        </View>

        <Input
          label="Current Password *"
          placeholder="Enter current password"
          value={formData.currentPassword}
          onChangeText={(text) => setFormData({ ...formData, currentPassword: text })}
          secureTextEntry
          autoCapitalize="none"
          error={errors.currentPassword}
        />

        <Input
          label="New Password *"
          placeholder="Enter new password"
          value={formData.newPassword}
          onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
          secureTextEntry
          autoCapitalize="none"
          error={errors.newPassword}
        />

        <Input
          label="Confirm New Password *"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
          secureTextEntry
          autoCapitalize="none"
          error={errors.confirmPassword}
        />

        <Button
          title="Change Password"
          onPress={handleSubmit}
          loading={saving}
          style={styles.submitButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

