import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Family() {
  const [members] = useState([
    { id: 1, name: 'John Doe', role: 'Father', icon: '👨' },
    { id: 2, name: 'Jane Doe', role: 'Mother', icon: '👩' },
    { id: 3, name: 'Emma Doe', role: 'Daughter', icon: '👧' },
    { id: 4, name: 'Alex Doe', role: 'Son', icon: '👦' },
  ])

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Family Members</Text>
        <Text style={styles.subHeaderText}>{members.length} members</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {members.map((member) => (
          <TouchableOpacity key={member.id} style={styles.card}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{member.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonIcon}>+</Text>
          <Text style={styles.addButtonText}>Add Family Member</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#64748B',
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
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#334155',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
    marginBottom: 4,
  },
  memberRole: {
    fontSize: 14,
    color: '#94A3B8',
  },
  arrow: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '300',
  },
  addButton: {
    backgroundColor: '#1E293B',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonIcon: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '600',
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
})