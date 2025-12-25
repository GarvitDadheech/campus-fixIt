import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { apiService } from '../../services/api';

interface DashboardStats {
  issues: {
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    resolvedThisMonth: number;
    averageResolutionTime: number;
  };
  users: {
    total: number;
    students: number;
    admins: number;
    activeUsers: number;
    inactiveUsers: number;
  };
}

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await apiService.getDashboardStats();
      if (response.success && response.data) {
        setStats(response.data as DashboardStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Overview of all issues and users</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.issues.total || 0}</Text>
          <Text style={styles.statLabel}>Total Issues</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.primary }]}>
            {stats?.issues.byStatus?.open || 0}
          </Text>
          <Text style={styles.statLabel}>Open</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.warning }]}>
            {stats?.issues.byStatus?.in_progress || 0}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.success }]}>
            {stats?.issues.byStatus?.resolved || 0}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </Card>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/admin-all-issues')}
        >
          <Text style={styles.actionButtonText}>View All Issues</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)/admin-users')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            Manage Users
          </Text>
        </TouchableOpacity>
      </View>

      {stats && (
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Additional Stats</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Resolved this month:</Text>
            <Text style={styles.detailValue}>
              {stats.issues.resolvedThisMonth}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Avg resolution time:</Text>
            <Text style={styles.detailValue}>
              {stats.issues.averageResolutionTime}h
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total users:</Text>
            <Text style={styles.detailValue}>{stats.users.total}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Active users:</Text>
            <Text style={styles.detailValue}>{stats.users.activeUsers}</Text>
          </View>
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
  header: {
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  actionsContainer: {
    padding: 24,
  },
  actionButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    color: Colors.light.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.light.primary,
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
  },
});
