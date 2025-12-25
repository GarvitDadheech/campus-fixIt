import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Button, Card, Input } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUS } from '../../constants/config';
import { apiService } from '../../services/api';
import { Issue } from '../../types';
import { showErrorToast, showSuccessToast } from '../../utils/toast';

export default function AdminIssueDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showRemarksModal, setShowRemarksModal] = useState(false);
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadIssue();
  }, [id]);

  const loadIssue = async () => {
    try {
      const response = await apiService.getIssueById(id);
      if (response.success && response.data) {
        setIssue(response.data);
        setStatus(response.data.status);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load issue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!status) {
      showErrorToast({ message: 'Please select a status' });
      return;
    }

    setUpdating(true);
    try {
      await apiService.updateIssueStatus(id, status, remarks.trim() || undefined);
      showSuccessToast('Issue status updated successfully');
      setShowStatusModal(false);
      setRemarks('');
      loadIssue();
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssign = async () => {
    setUpdating(true);
    try {
      await apiService.assignIssue(id);
      showSuccessToast('Issue assigned to you');
      loadIssue();
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddRemarks = async () => {
    if (!remarks.trim()) {
      showErrorToast({ message: 'Please enter remarks' });
      return;
    }

    setUpdating(true);
    try {
      await apiService.addRemarks(id, remarks.trim());
      showSuccessToast('Remarks added successfully');
      setShowRemarksModal(false);
      setRemarks('');
      loadIssue();
    } catch (error: any) {
      showErrorToast(error);
    } finally {
      setUpdating(false);
    }
  };

  const handleResolve = async () => {
    Alert.alert(
      'Resolve Issue',
      'Do you want to mark this issue as resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resolve',
          onPress: async () => {
            setUpdating(true);
            try {
              await apiService.resolveIssue(id, remarks.trim() || undefined);
              showSuccessToast('Issue marked as resolved');
              setRemarks('');
              loadIssue();
            } catch (error: any) {
              showErrorToast(error);
            } finally {
              setUpdating(false);
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
  const assignedTo =
    typeof issue.assignedTo === 'object' ? issue.assignedTo.name : null;

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
          {assignedTo && (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Assigned to:</Text>
              <Text style={styles.metaValue}>{assignedTo}</Text>
            </View>
          )}
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
            <Text style={styles.remarksLabel}>Remarks:</Text>
            <Text style={styles.remarksText}>{issue.remarks}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsContainer}>
          <Button
            title="Update Status"
            onPress={() => setShowStatusModal(true)}
            style={styles.actionButton}
          />
          <Button
            title="Add Remarks"
            onPress={() => setShowRemarksModal(true)}
            variant="secondary"
            style={styles.actionButton}
          />
          {!assignedTo && (
            <Button
              title="Assign to Me"
              onPress={handleAssign}
              variant="outline"
              style={styles.actionButton}
              loading={updating}
            />
          )}
          {issue.status !== 'resolved' && (
            <Button
              title="Mark as Resolved"
              onPress={handleResolve}
              variant="outline"
              style={styles.actionButton}
              loading={updating}
            />
          )}
        </View>
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

      {/* Status Update Modal */}
      <Modal
        visible={showStatusModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Status</Text>
            {ISSUE_STATUS.map((s) => (
              <TouchableOpacity
                key={s.value}
                style={[
                  styles.statusOption,
                  status === s.value && styles.statusOptionActive,
                ]}
                onPress={() => setStatus(s.value)}
              >
                <Text
                  style={[
                    styles.statusOptionText,
                    status === s.value && styles.statusOptionTextActive,
                  ]}
                >
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
            <Input
              label="Remarks (Optional)"
              placeholder="Enter remarks"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              style={styles.remarksInput}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowStatusModal(false);
                  setRemarks('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Update"
                onPress={handleUpdateStatus}
                loading={updating}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Remarks Modal */}
      <Modal
        visible={showRemarksModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRemarksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Remarks</Text>
            <Input
              label="Remarks"
              placeholder="Enter remarks"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={4}
              style={styles.remarksInput}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                onPress={() => {
                  setShowRemarksModal(false);
                  setRemarks('');
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Add"
                onPress={handleAddRemarks}
                loading={updating}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 20,
  },
  statusOption: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.background,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.light.border,
  },
  statusOptionActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary + '10',
  },
  statusOptionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  statusOptionTextActive: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
  remarksInput: {
    marginTop: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

