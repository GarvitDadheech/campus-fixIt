import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';
import { User } from '../../types';

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadUsers = async (pageNum = 1, reset = false) => {
    try {
      const params: any = { page: pageNum, limit: 10 };
      if (filter === 'students') {
        params.role = 'student';
      } else if (filter === 'admins') {
        params.role = 'admin';
      }

      const response = await apiService.getAllUsers(params);
      if (response.success && response.data) {
        const newUsers = response.data.data;
        if (reset) {
          setUsers(newUsers);
        } else {
          setUsers([...users, ...newUsers]);
        }
        setHasMore(response.data.pagination?.hasNextPage || false);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUsers(1, true);
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    loadUsers(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadUsers(nextPage, false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      await apiService.toggleUserStatus(userId);
      loadUsers(1, true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to toggle user status');
    }
  };

  const handleUpdateRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'student' ? 'admin' : 'student';
    Alert.alert(
      'Change Role',
      `Change user role to ${newRole}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              await apiService.updateUserRole(userId, newRole);
              loadUsers(1, true);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update role');
            }
          },
        },
      ]
    );
  };

  const renderUser = ({ item }: { item: User }) => {
    return (
      <Card style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            {item.studentId && (
              <Text style={styles.userMeta}>ID: {item.studentId}</Text>
            )}
          </View>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  item.role === 'admin' ? Colors.light.primary : Colors.light.success,
              },
            ]}
          >
            <Text style={styles.roleText}>
              {item.role === 'admin' ? 'Admin' : 'Student'}
            </Text>
          </View>
        </View>

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              item.isActive ? styles.deactivateButton : styles.activateButton,
            ]}
            onPress={() => handleToggleStatus(item._id)}
          >
            <Text
              style={[
                styles.actionButtonText,
                item.isActive ? styles.deactivateButtonText : styles.activateButtonText,
              ]}
            >
              {item.isActive ? 'Deactivate' : 'Activate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.roleButton]}
            onPress={() => handleUpdateRole(item._id, item.role)}
          >
            <Text style={[styles.actionButtonText, styles.roleButtonText]}>
              Change Role
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'students', 'admins'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            style={[
              styles.filterButton,
              filter === filterType && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(filterType)}
          >
            <Text
              style={[
                styles.filterText,
                filter === filterType && styles.filterTextActive,
              ]}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No users found</Text>
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
  userCard: {
    marginBottom: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  userMeta: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  roleText: {
    color: Colors.light.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deactivateButton: {
    backgroundColor: Colors.light.error + '20',
  },
  activateButton: {
    backgroundColor: Colors.light.success + '20',
  },
  roleButton: {
    backgroundColor: Colors.light.primary + '20',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  deactivateButtonText: {
    color: Colors.light.error,
  },
  activateButtonText: {
    color: Colors.light.success,
  },
  roleButtonText: {
    color: Colors.light.primary,
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

