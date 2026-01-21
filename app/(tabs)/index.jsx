import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, BackHandler, Alert, ActivityIndicator, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../config/supabase'

export default function Home() {
  const [sections, setSections] = useState([])
  const [newSection, setNewSection] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [user, setUser] = useState(null)

  // Handle Android back button - exit app instead of going back
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp()
      return true
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [])

  // Check user and load sections
  useEffect(() => {
    checkUserAndLoadSections()
  }, [])

  const checkUserAndLoadSections = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setUser(session?.user ?? null)
    
    if (session?.user) {
      await loadSections()
    } else {
      setLoading(false)
    }
  }

  const loadSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      setSections(data || [])
    } catch (error) {
      console.error('Error loading sections:', error)
      Alert.alert('Error', 'Failed to load sections')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadSections()
  }

  const handleAddSection = async () => {
    if (!newSection.trim()) {
      Alert.alert('Error', 'Please enter a section name')
      return
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to add sections')
      return
    }

    try {
      const { data, error } = await supabase
        .from('sections')
        .insert([
          {
            title: newSection.trim(),
            icon: '📁',
            user_id: user.id
          }
        ])
        .select()
        .single()

      if (error) throw error

      setSections([...sections, data])
      setNewSection('')
      Alert.alert('Success', 'Section added successfully')
    } catch (error) {
      console.error('Error adding section:', error)
      Alert.alert('Error', 'Failed to add section')
    }
  }

  const handleDeleteSection = async (sectionId) => {
    try {
      const { error } = await supabase
        .from('sections')
        .delete()
        .eq('id', sectionId)

      if (error) throw error

      setSections(sections.filter(s => s.id !== sectionId))
      Alert.alert('Success', 'Section deleted')
    } catch (error) {
      console.error('Error deleting section:', error)
      Alert.alert('Error', 'Failed to delete section')
    }
  }

  const handleCardPress = (section) => {
    router.push({
      pathname: '/card',
      params: { 
        title: section.title, 
        icon: section.icon,
        sectionId: section.id 
      }
    })
  }

  const handleCardLongPress = (section) => {
    Alert.alert(
      'Delete Section',
      `Delete "${section.title}"? This will also delete all documents in this section.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => handleDeleteSection(section.id)
        }
      ]
    )
  }

  if (loading) {
    return (
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8b5cf6" />
            <Text style={styles.loadingText}>Loading sections...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#1e1b4b', '#0c0c21']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>docvault 📂</Text>
            <Text style={styles.headerSubtext}>
              {user ? `${sections.length} sections` : 'Sign in to start'}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/settings')}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              style={styles.profileGradient}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {user ? (
          <>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="add-circle-outline" size={20} color="#8b5cf6" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder='Add new section'
                  placeholderTextColor='#64748B'
                  value={newSection}
                  onChangeText={setNewSection}
                  onSubmitEditing={handleAddSection}
                />
              </View>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={handleAddSection}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#6366f1']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.addButtonGradient}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView} 
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor="#8b5cf6"
                />
              }
            >
              {sections.length > 0 ? (
                sections.map((section) => (
                  <TouchableOpacity 
                    key={section.id} 
                    style={styles.card} 
                    onPress={() => handleCardPress(section)}
                    onLongPress={() => handleCardLongPress(section)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.cardGradient}
                    >
                      <View style={styles.cardLeft}>
                        <View style={styles.iconContainer}>
                          <Text style={styles.icon}>{section.icon || '📁'}</Text>
                        </View>
                        <View>
                          <Text style={styles.cardTitle}>{section.title}</Text>
                          <Text style={styles.cardSubtext}>
                            Tap to view documents
                          </Text>
                        </View>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
                    </LinearGradient>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="folder-open-outline" size={64} color="rgba(255,255,255,0.3)" />
                  <Text style={styles.emptyText}>No sections yet</Text>
                  <Text style={styles.emptySubtext}>
                    Add your first section to organize documents
                  </Text>
                </View>
              )}
            </ScrollView>
          </>
        ) : (
          <View style={styles.notSignedIn}>
            <Ionicons name="lock-closed-outline" size={64} color="rgba(255,255,255,0.3)" />
            <Text style={styles.notSignedInText}>Sign in to continue</Text>
            <Text style={styles.notSignedInSubtext}>
              Create sections and save your important documents
            </Text>
            <TouchableOpacity 
              style={styles.signInButton}
              onPress={() => router.push('/(auth)/signin')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#8b5cf6', '#6366f1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.signInButtonGradient}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  profileButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  addButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addButtonGradient: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  cardSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  notSignedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  notSignedInText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  notSignedInSubtext: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  signInButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signInButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
})