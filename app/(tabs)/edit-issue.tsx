import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Input } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES } from '../../constants/config';
import { apiService } from '../../services/api';

export default function EditIssueScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
  });
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      const response = await apiService.getIssueById(id);
      if (response.success && response.data) {
        const issue = response.data;
        setFormData({
          title: issue.title,
          description: issue.description,
          category: issue.category,
          priority: issue.priority,
          location: issue.location || '',
        });
        if (issue.imageUrl) {
          setImage(issue.imageUrl);
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issue');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);
      if (formData.location.trim()) {
        formDataToSend.append('location', formData.location.trim());
      }
      if (image && !image.startsWith('http')) {
        const filename = image.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formDataToSend.append('image', {
          uri: image,
          name: filename,
          type,
        } as any);
      }

      const response = await apiService.updateIssue(id, formDataToSend);
      if (response.success) {
        Alert.alert('Success', 'Issue updated successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update issue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Edit Issue</Text>
        </View>

        <Input
          label="Title *"
          placeholder="Enter issue title"
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          error={errors.title}
        />

        <Input
          label="Description *"
          placeholder="Describe the issue in detail"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          multiline
          numberOfLines={4}
          style={styles.textArea}
          error={errors.description}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Category *</Text>
          <View style={styles.optionsContainer}>
            {ISSUE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.optionButton,
                  formData.category === cat.value && styles.optionButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, category: cat.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.category === cat.value && styles.optionTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && (
            <Text style={styles.errorText}>{errors.category}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.optionsContainer}>
            {ISSUE_PRIORITIES.map((pri) => (
              <TouchableOpacity
                key={pri.value}
                style={[
                  styles.optionButton,
                  formData.priority === pri.value && styles.optionButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, priority: pri.value })}
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.priority === pri.value && styles.optionTextActive,
                  ]}
                >
                  {pri.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Location"
          placeholder="Enter location (optional)"
          value={formData.location}
          onChangeText={(text) => setFormData({ ...formData, location: text })}
        />

        <View style={styles.section}>
          <Text style={styles.label}>Photo</Text>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>+ Change Photo</Text>
              </View>
            )}
          </TouchableOpacity>
          {image && (
            <TouchableOpacity
              onPress={() => setImage(null)}
              style={styles.removeImageButton}
            >
              <Text style={styles.removeImageText}>Remove Photo</Text>
            </TouchableOpacity>
          )}
        </View>

        <Button
          title="Save Changes"
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  optionButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  optionTextActive: {
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
    marginTop: 4,
  },
  imageButton: {
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: Colors.light.surface,
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  removeImageButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  removeImageText: {
    fontSize: 14,
    color: Colors.light.error,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});

