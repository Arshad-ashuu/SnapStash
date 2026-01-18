import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Image, Animated, ActivityIndicator, Alert } from 'react-native'
import React, { useState, useRef, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { getCards, addCard, getCurrentUser } from '../services/supabaseService'
import { uploadImage } from '../services/storageService'

export default function Card() {
  const { title, icon, sectionId } = useLocalSearchParams()
  
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const scaleAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    loadCards()
  }, [sectionId])

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start()
    } else {
      scaleAnim.setValue(0)
    }
  }, [modalVisible])

  const loadCards = async () => {
    try {
      setLoading(true)
      const data = await getCards(sectionId)
      setCards(data || [])
    } catch (error) {
      console.error('Error loading cards:', error)
      Alert.alert('Error', 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    })

    if (!result.canceled) {
      setSelectedImages(result.assets.map(asset => asset.uri))
    }
  }

  const handleAddCard = async () => {
    if (!newCardName.trim()) {
      Alert.alert('Error', 'Please enter a document name')
      return
    }

    try {
      setUploading(true)
      const user = await getCurrentUser()
      
      // Upload images to Supabase Storage
      const uploadedImageUrls = []
      for (const imageUri of selectedImages) {
        const publicUrl = await uploadImage(imageUri, user.id)
        uploadedImageUrls.push(publicUrl)
      }

      // Create card in database
      const cardData = {
        name: newCardName,
        images: uploadedImageUrls,
        type: 'document'
      }

      const newCard = await addCard(sectionId, cardData)
      
      // Update local state
      setCards([newCard, ...cards])
      
      // Reset form
      setNewCardName('')
      setSelectedImages([])
      setModalVisible(false)
      
      Alert.alert('Success', 'Document added successfully!')
    } catch (error) {
      console.error('Error adding card:', error)
      Alert.alert('Error', 'Failed to add document. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleCardPress = (card) => {
    router.push({
      pathname: '/cardDetail',
      params: { 
        cardId: card.id,
        cardName: card.name,
        sectionTitle: title,
        sectionId: sectionId,
        images: JSON.stringify(card.images || [])
      }
    })
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
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#1e1b4b', '#312e81', '#4c1d95']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon || '📁'}</Text>
            </View>
            <View>
              <Text style={styles.headerText}>{title || 'Documents'}</Text>
              <Text style={styles.headerSubtext}>{cards.length} items</Text>
            </View>
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cards.map((card, index) => (
            <TouchableOpacity 
              key={card.id} 
              style={styles.card}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
              >
                <View style={styles.cardLeft}>
                  <LinearGradient
                    colors={['#8b5cf6', '#6366f1']}
                    style={styles.avatar}
                  >
                    <Text style={styles.avatarText}>{card.name[0].toUpperCase()}</Text>
                  </LinearGradient>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardName}>{card.name}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="image-outline" size={14} color="#94a3b8" />
                      <Text style={styles.cardSubtext}>
                        {card.images?.length || 0} {(card.images?.length || 0) === 1 ? 'image' : 'images'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Ionicons name="chevron-forward" size={20} color="#8b5cf6" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}

          {cards.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="folder-open-outline" size={64} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyText}>No documents yet</Text>
              <Text style={styles.emptySubtext}>Tap + to add your first document</Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => setModalVisible(true)}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#8b5cf6', '#6366f1']}
            style={styles.fabGradient}
          >
            <Ionicons name="add" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>

        {/* Add Card Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => !uploading && setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['#1e293b', '#0f172a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Add Document</Text>
                    <Text style={styles.modalSubtitle}>Save important documents</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}
                    disabled={uploading}
                  >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Document Name</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g., Passport, License, Insurance"
                    placeholderTextColor="#64748B"
                    value={newCardName}
                    onChangeText={setNewCardName}
                    editable={!uploading}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.imageButton} 
                  onPress={pickImages}
                  disabled={uploading}
                >
                  <LinearGradient
                    colors={['rgba(139, 92, 246, 0.1)', 'rgba(99, 102, 241, 0.1)']}
                    style={styles.imageButtonGradient}
                  >
                    <Ionicons 
                      name={selectedImages.length > 0 ? "checkmark-circle" : "camera"} 
                      size={24} 
                      color={selectedImages.length > 0 ? "#10b981" : "#8b5cf6"} 
                    />
                    <Text style={styles.imageButtonText}>
                      {selectedImages.length > 0 
                        ? `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''} selected` 
                        : 'Select Images'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {selectedImages.length > 0 && (
                  <ScrollView 
                    horizontal 
                    style={styles.imagePreview}
                    showsHorizontalScrollIndicator={false}
                  >
                    {selectedImages.map((uri, index) => (
                      <View key={index} style={styles.previewImageContainer}>
                        <Image source={{ uri }} style={styles.previewImage} />
                        <View style={styles.previewBadge}>
                          <Text style={styles.previewBadgeText}>{index + 1}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}

                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => setModalVisible(false)}
                    disabled={uploading}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.addButtonModal} 
                    onPress={handleAddCard}
                    activeOpacity={0.9}
                    disabled={uploading}
                  >
                    <LinearGradient
                      colors={uploading ? ['#64748b', '#475569'] : ['#8b5cf6', '#6366f1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.addButtonGradient}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      )}
                      <Text style={styles.addButtonText}>
                        {uploading ? 'Adding...' : 'Add Document'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>
        </Modal>
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
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  headerText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  headerSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSubtext: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  cardRight: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 14,
    padding: 16,
    color: '#fff',
    fontSize: 16,
  },
  imageButton: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
  },
  imageButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    borderStyle: 'dashed',
  },
  imageButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  imagePreview: {
    marginBottom: 16,
  },
  previewImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.5)',
  },
  previewBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8b5cf6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  previewBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonModal: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 6,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})