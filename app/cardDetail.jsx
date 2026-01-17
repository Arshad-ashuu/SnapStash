import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'

const { width } = Dimensions.get('window')

export default function CardDetail() {
  const { cardName, sectionTitle, images } = useLocalSearchParams()
  const [cardImages] = useState(images ? JSON.parse(images) : [])
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>{cardName}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{sectionTitle}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{cardName}</Text>
        </View>

        {cardImages.length > 0 && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Images ({cardImages.length})</Text>
            
            <ScrollView 
              horizontal 
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 32))
                setActiveImageIndex(index)
              }}
              style={styles.imageCarousel}
            >
              {cardImages.map((uri, index) => (
                <Image 
                  key={index} 
                  source={{ uri }} 
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {cardImages.length > 1 && (
              <View style={styles.pagination}>
                {cardImages.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.paginationDot,
                      index === activeImageIndex && styles.paginationDotActive
                    ]} 
                  />
                ))}
              </View>
            )}
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️ Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton}>
            <Text style={styles.deleteButtonText}>🗑️ Delete</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 32,
    color: '#F1F5F9',
    fontWeight: '300',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  imageSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F1F5F9',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  imageCarousel: {
    marginBottom: 12,
  },
  cardImage: {
    width: width - 32,
    height: 240,
    borderRadius: 16,
    marginRight: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  paginationDotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
})