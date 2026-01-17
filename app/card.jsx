import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import * as ImagePicker from 'expo-image-picker'

export default function Card() {
  const { title, icon, sectionId } = useLocalSearchParams()
  
  const [cards, setCards] = useState([
    { id: 1, name: 'John', images: [] },
    { id: 2, name: 'Ram', images: [] },
  ])
  
  const [modalVisible, setModalVisible] = useState(false)
  const [newCardName, setNewCardName] = useState('')
  const [selectedImages, setSelectedImages] = useState([])

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    })

    if (!result.canceled) {
      setSelectedImages(result.assets.map(asset => asset.uri))
    }
  }

  const addCard = () => {
    if (newCardName.trim()) {
      setCards([...cards, { 
        id: Date.now(), 
        name: newCardName, 
        images: selectedImages 
      }])
      setNewCardName('')
      setSelectedImages([])
      setModalVisible(false)
    }
  }

  const handleCardPress = (card) => {
    router.push({
      pathname: '/cardDetail',
      params: { 
        cardId: card.id,
        cardName: card.name,
        sectionTitle: title,
        images: JSON.stringify(card.images)
      }
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.icon}>{icon || '📌'}</Text>
          <Text style={styles.headerText}>{title || 'Cards'}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {cards.map((card) => (
          <TouchableOpacity 
            key={card.id} 
            style={styles.card}
            onPress={() => handleCardPress(card)}
          >
            <View style={styles.cardLeft}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{card.name[0].toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.cardName}>{card.name}</Text>
                <Text style={styles.cardSubtext}>
                  {card.images.length} {card.images.length === 1 ? 'image' : 'images'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Add Card Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Card</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter name (e.g., John, Ram)"
              placeholderTextColor="#64748B"
              value={newCardName}
              onChangeText={setNewCardName}
            />

            <TouchableOpacity style={styles.imageButton} onPress={pickImages}>
              <Text style={styles.imageButtonText}>
                📷 {selectedImages.length > 0 ? `${selectedImages.length} selected` : 'Select Images'}
              </Text>
            </TouchableOpacity>

            {selectedImages.length > 0 && (
              <ScrollView horizontal style={styles.imagePreview}>
                {selectedImages.map((uri, index) => (
                  <Image key={index} source={{ uri }} style={styles.previewImage} />
                ))}
              </ScrollView>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addButtonModal} 
                onPress={addCard}
              >
                <Text style={styles.addButtonText}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
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
    justifyContent: 'space-between',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F1F5F9',
  },
  cardSubtext: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#64748B',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  closeButton: {
    fontSize: 24,
    color: '#94A3B8',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    color: '#F1F5F9',
    fontSize: 16,
    marginBottom: 16,
  },
  imageButton: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  imageButtonText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '500',
  },
  imagePreview: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonModal: {
    flex: 1,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})