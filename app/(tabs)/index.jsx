import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

export default function Home() {
  const [sections, setSections] = useState([
    { id: 1, title: 'Home', icon: '🏠' },
    { id: 2, title: 'Work', icon: '💼' },
    { id: 3, title: 'Personal', icon: '👤' },
    { id: 4, title: 'Projects', icon: '📁' },
    { id: 5, title: 'Notes', icon: '📝' },
    { id: 6, title: 'Tasks', icon: '✓' },
    { id: 7, title: 'Calendar', icon: '📅' },
    { id: 8, title: 'Settings', icon: '⚙️' },
  ])
  const [newSection, setNewSection] = useState('')

  // Handle Android back button - exit app instead of going back
  useEffect(() => {
    const backAction = () => {
      BackHandler.exitApp() // Exit the app
      return true // Prevent default behavior
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    )

    return () => backHandler.remove()
  }, [])

  const addSection = () => {
    if (newSection.trim()) {
      setSections([...sections, { id: Date.now(), title: newSection, icon: '📌' }])
      setNewSection('')
    }
  }

  const handleCardPress = (section) => {
    router.push({
      pathname: '/card',
      params: { title: section.title, icon: section.icon }
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hi 👋🏻</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder='Add new section'
          placeholderTextColor='#6B7280'
          value={newSection}
          onChangeText={setNewSection}
        />
        <TouchableOpacity style={styles.addButton} onPress={addSection}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <TouchableOpacity 
            key={section.id} 
            style={styles.card} 
            onPress={() => handleCardPress(section)}
          >
            <View style={styles.cardContent}>
              <Text style={styles.icon}>{section.icon}</Text>
              <Text style={styles.cardTitle}>{section.title}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

// ... keep your existing styles
// ... (keep all your existing styles)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Deep slate background
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9', // Light text
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: '#1E293B', // Darker slate
    borderWidth: 1,
    borderColor: '#334155', // Subtle border
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#F1F5F9',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#3B82F6', // Blue accent
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  arrow: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
})