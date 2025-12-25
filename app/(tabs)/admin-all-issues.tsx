import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUS } from '../../constants/config';
import { apiService } from '../../services/api';
import { Issue } from '../../types';

export default function AdminAllIssuesScreen() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadIssues = async (pageNum = 1, reset = false) => {
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (filter !== 'all') {
        params.status = filter;
      }

      const response = await apiService.getAllIssues(params);
      if (response.success && response.data) {
        const newIssues = Array.isArray(response.data) ? response.data : [];
        if (reset) {
          setIssues(newIssues);
        } else {
          setIssues([...issues, ...newIssues]);
        }
        setHasMore(response.pagination?.hasNextPage || false);
      }
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadIssues(1, true);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadIssues(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadIssues(nextPage, false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = ISSUE_STATUS.find((s) => s.value === status);
    return statusObj?.color || Colors.light.textSecondary;
  };

  const getCategoryLabel = (category: string) => {
    const cat = ISSUE_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category;
  };

  const getPriorityColor = (priority: string) => {
    const pri = ISSUE_PRIORITIES.find((p) => p.value === priority);
    return pri?.color || Colors.light.textSecondary;
  };

  const renderIssue = ({ item }: { item: Issue }) => {
    const reportedBy = typeof item.reportedBy === 'object' ? item.reportedBy.name : 'Unknown';

    return (
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/admin-issue-details?id=${item._id}`)}
      >
        <Card style={styles.issueCard}>
          <View style={styles.issueHeader}>
            <Text style={styles.issueTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) + '20' },
              ]}
            >
              <Text
                style={[styles.statusText, { color: getStatusColor(item.status) }]}
              >
                {ISSUE_STATUS.find((s) => s.value === item.status)?.label || item.status}
              </Text>
            </View>
          </View>

          <Text style={styles.issueDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.issueMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Category:</Text>
              <Text style={styles.metaValue}>{getCategoryLabel(item.category)}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Priority:</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: getPriorityColor(item.priority) + '20' },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    { color: getPriorityColor(item.priority) },
                  ]}
                >
                  {ISSUE_PRIORITIES.find((p) => p.value === item.priority)?.label ||
                    item.priority}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.reportedByText}>Reported by: {reportedBy}</Text>
          <Text style={styles.dateText}>
            Created: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && issues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'open', 'in_progress', 'resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive,
              ]}
            >
              {status === 'all' ? 'All' : ISSUE_STATUS.find((s) => s.value === status)?.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={issues}
        renderItem={renderIssue}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No issues found</Text>
          </View>
        }
      />
    </View>
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 44,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  filterTextActive: {
    color: Colors.light.secondary,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  issueCard: {
    marginBottom: 16,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  issueMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  metaValue: {
    fontSize: 12,
    color: Colors.light.text,
    fontWeight: '500',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  reportedByText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
});

