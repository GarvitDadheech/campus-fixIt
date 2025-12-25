import { Tabs } from 'expo-router';
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.light.primary,
          tabBarInactiveTintColor: Colors.light.textSecondary,
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.light.surface,
            borderTopColor: Colors.light.border,
          },
        }}
      >
        <Tabs.Screen
          name="admin-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-all-issues"
          options={{
            title: 'Issues',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-users"
          options={{
            title: 'Users',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null, // Hide from tabs
          }}
        />
        <Tabs.Screen
          name="my-issues"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="create-issue"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="issue-details"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="admin-issue-details"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="edit-issue"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="change-password"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-issues"
        options={{
          title: 'My Issues',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-issue"
        options={{
          title: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="issue-details"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-issue"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-dashboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-all-issues"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-users"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="admin-issue-details"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
