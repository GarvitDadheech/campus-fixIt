import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Card } from '../../components/ui';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await logout();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        <View
          style={[
            styles.roleBadge,
            {
              backgroundColor:
                user?.role === 'admin' ? Colors.light.primary : Colors.light.success,
            },
          ]}
        >
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? 'Admin' : 'Student'}
          </Text>
        </View>
      </View>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        {user?.studentId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Student ID:</Text>
            <Text style={styles.infoValue}>{user.studentId}</Text>
          </View>
        )}
        {user?.department && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Department:</Text>
            <Text style={styles.infoValue}>{user.department}</Text>
          </View>
        )}
        {user?.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone:</Text>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/edit-profile')}
        >
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(tabs)/change-password')}
        >
          <Text style={styles.menuItemText}>Change Password</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </Card>

      <Button
        title="Logout"
        onPress={handleLogout}
        loading={loggingOut}
        variant="danger"
        style={styles.logoutButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 40,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.light.secondary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleText: {
    color: Colors.light.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  menuItemArrow: {
    fontSize: 24,
    color: Colors.light.textSecondary,
  },
  logoutButton: {
    margin: 16,
    marginTop: 8,
  },
});

