import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Alert, ActivityIndicator } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '../../config/supabase'

export default function Settings() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    setLoading(false)
  }

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut()
              router.replace('/(auth)/signin')
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out')
            }
          }
        }
      ]
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      </SafeAreaView>
    )
  }

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { 
          id: 1, 
          label: 'Email', 
          icon: '📧', 
          type: 'info',
          value: user?.email || 'Not signed in'
        },
        { 
          id: 2, 
          label: 'User ID', 
          icon: '🆔', 
          type: 'info',
          value: user?.id|| 'N/A'
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        { 
          id: 3, 
          label: 'Notifications', 
          icon: '🔔', 
          type: 'toggle', 
          value: notifications, 
          onToggle: setNotifications 
        },
        { 
          id: 4, 
          label: 'Dark Mode', 
          icon: '🌙', 
          type: 'toggle', 
          value: darkMode, 
          onToggle: setDarkMode 
        },
      ]
    },
    {
      title: 'Support',
      items: [
        { id: 5, label: 'Help Center', icon: '❓', type: 'link' },
        { id: 6, label: 'About', icon: 'ℹ️', type: 'link' },
      ]
    }
  ]

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        {user && (
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user.email?.split('@')[0] || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            
            {group.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={item.id} 
                style={[
                  styles.settingItem,
                  itemIndex === 0 && styles.firstItem,
                  itemIndex === group.items.length - 1 && styles.lastItem
                ]}
                activeOpacity={item.type === 'toggle' || item.type === 'info' ? 1 : 0.7}
                onPress={() => {
                  if (item.type === 'link') {
                    Alert.alert(item.label, 'Feature coming soon!')
                  }
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.settingIcon}>{item.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.type === 'info' && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                  </View>
                </View>
                
                {item.type === 'toggle' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#334155', true: '#3B82F6' }}
                    thumbColor={item.value ? '#FFFFFF' : '#94A3B8'}
                  />
                ) : item.type === 'link' ? (
                  <Text style={styles.arrow}>›</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Sign Out Button */}
        {user && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        {/* Not Signed In */}
        {!user && (
          <TouchableOpacity 
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/signin')}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  profileEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderTopWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  firstItem: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  lastItem: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderBottomWidth: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 18,
  },
  settingLabel: {
    fontSize: 16,
    color: '#F1F5F9',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  logoutButton: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  signInButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signInText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  version: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 12,
    marginBottom: 24,
  },
})