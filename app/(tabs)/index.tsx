import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const response = await apiService.getMyIssues({ limit: 100 });
      if (response.success && response.data) {
        const issues = Array.isArray(response.data) ? response.data : [];
        setStats({
          total: issues.length,
          open: issues.filter((i: any) => i.status === 'open').length,
          inProgress: issues.filter((i: any) => i.status === 'in_progress').length,
          resolved: issues.filter((i: any) => i.status === 'resolved').length,
        });
      } else {
        setStats({
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  if (user?.role === 'admin') {
    router.replace('/(tabs)/admin-dashboard');
    return null;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'Student'}!</Text>
        <Text style={styles.subtitle}>Track your reported issues</Text>
      </View>

      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Issues</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.primary }]}>
            {stats.open}
          </Text>
          <Text style={styles.statLabel}>Open</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.warning }]}>
            {stats.inProgress}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: Colors.light.success }]}>
            {stats.resolved}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </Card>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push('/(tabs)/create-issue')}
        >
          <Text style={styles.actionButtonText}>+ Report New Issue</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.push('/(tabs)/my-issues')}
        >
          <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
            View All Issues
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 24,
    paddingTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  statsContainer: {
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
});
