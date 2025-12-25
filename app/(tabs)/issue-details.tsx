import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/ui';
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
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      const response = await apiService.getIssueById(id);
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
            setDeleting(true);
            try {
              await apiService.deleteIssue(id);
              Alert.alert('Success', 'Issue deleted successfully', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete issue');
            } finally {
              setDeleting(false);
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

  const statusObj = ISSUE_STATUS.find((s) => s.value === issue.status);
  const categoryObj = ISSUE_CATEGORIES.find((c) => c.value === issue.category);
  const priorityObj = ISSUE_PRIORITIES.find((p) => p.value === issue.priority);
  const reportedBy =
    typeof issue.reportedBy === 'object' ? issue.reportedBy.name : 'Unknown';

  const canEdit = user?.role === 'student' && issue.status === 'open';
  const canDelete = user?.role === 'student' && issue.status === 'open';

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>{issue.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusObj?.color + '20' },
            ]}
          >
            <Text style={[styles.statusText, { color: statusObj?.color }]}>
              {statusObj?.label || issue.status}
            </Text>
          </View>
        </View>

        <Text style={styles.description}>{issue.description}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Category:</Text>
            <Text style={styles.metaValue}>{categoryObj?.label || issue.category}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Priority:</Text>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityObj?.color + '20' },
              ]}
            >
              <Text
                style={[styles.priorityText, { color: priorityObj?.color }]}
              >
                {priorityObj?.label || issue.priority}
              </Text>
            </View>
          </View>
          {issue.location && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Location:</Text>
              <Text style={styles.metaValue}>{issue.location}</Text>
            </View>
          )}
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Reported by:</Text>
            <Text style={styles.metaValue}>{reportedBy}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Created:</Text>
            <Text style={styles.metaValue}>
              {new Date(issue.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        {issue.imageUrl && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: issue.imageUrl }} style={styles.image} />
          </View>
        )}

        {issue.remarks && (
          <View style={styles.remarksContainer}>
            <Text style={styles.remarksLabel}>Admin Remarks:</Text>
            <Text style={styles.remarksText}>{issue.remarks}</Text>
          </View>
        )}

        {(canEdit || canDelete) && (
          <View style={styles.actionsContainer}>
            {canEdit && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push(`/(tabs)/edit-issue?id=${issue._id}`)}
              >
                <Text style={styles.editButtonText}>Edit Issue</Text>
              </TouchableOpacity>
            )}
            {canDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                disabled={deleting}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? 'Deleting...' : 'Delete Issue'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </Card>

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
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imageContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 8,
  },
  remarksContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
  },
  remarksLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.light.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: Colors.light.error,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: Colors.light.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  historyItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  historyStatus: {
    fontSize: 14,
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
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
});

