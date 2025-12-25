import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Button, Card } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUS } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { Issue } from '../../types';

export default function IssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadIssue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadIssue = async () => {
    try {
      const response = await apiService.getIssueById(id as string);
      if (response.success && response.data) {
        setIssue(response.data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Issue',
      'Are you sure you want to delete this issue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.deleteIssue(id as string);
              Alert.alert('Success', 'Issue deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete issue');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Issue not found</Text>
      </View>
    );
  }

  const canEdit = issue.status === 'open' && user?._id === issue.reportedBy;
  const categoryLabel = ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label || issue.category;
  const priorityLabel = ISSUE_PRIORITIES.find((p) => p.value === issue.priority)?.label || issue.priority;
  const statusLabel = ISSUE_STATUS.find((s) => s.value === issue.status)?.label || issue.status;
  const statusColor = ISSUE_STATUS.find((s) => s.value === issue.status)?.color || Colors.light.textSecondary;
  const priorityColor = ISSUE_PRIORITIES.find((p) => p.value === issue.priority)?.color || Colors.light.textSecondary;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{issue.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusColor + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{issue.description}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{categoryLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Priority:</Text>
            <Text style={[styles.metaValue, { color: priorityColor }]}>
              {priorityLabel}
            </Text>
          </View>
          {issue.location && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Location:</Text>
              <Text style={styles.metaValue}>{issue.location}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>
              {new Date(issue.createdAt).toLocaleString()}
            </Text>
          </View>
          {issue.resolvedAt && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Resolved:</Text>
              <Text style={styles.metaValue}>
                {new Date(issue.resolvedAt).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {issue.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: issue.imageUrl }} style={styles.image} contentFit="cover" />
          </View>
        )}

        {issue.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Admin Remarks:</Text>
            <Text style={styles.remarksText}>{issue.remarks}</Text>
          </View>
        )}
      </Card>

      {canEdit && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionsContainer}>
            <Button
              title="Edit Issue"
              onPress={() => router.push(`/(tabs)/edit-issue?id=${issue._id}`)}
              style={styles.actionButton}
            />
            <Button
              title="Delete Issue"
              onPress={handleDelete}
              variant="danger"
              style={styles.actionButton}
            />
          </View>
        </Card>
      )}

      {issue.statusHistory && issue.statusHistory.length > 0 && (
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Status History</Text>
          {issue.statusHistory.map((history, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyStatus}>
                {ISSUE_STATUS.find((s) => s.value === history.status)?.label ||
                  history.status}
              </Text>
              <Text style={styles.historyDate}>
                {new Date(history.changedAt).toLocaleString()}
              </Text>
              {history.remarks && (
                <Text style={styles.historyRemarks}>{history.remarks}</Text>
              )}
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
  },
  card: {
    margin: 16,
    marginTop: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  metaContainer: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    width: 100,
  },
  metaValue: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
  },
  imageContainer: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  remarksContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
  },
  remarksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  remarksText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  historyRemarks: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
});

