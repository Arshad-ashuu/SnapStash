import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Dimensions, Alert, Modal, TextInput, ActivityIndicator, Pressable, Share } from 'react-native'
import React, { useState, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import * as Sharing from 'expo-sharing'
import * as FileSystem from 'expo-file-system/legacy'
import { updateCard, deleteCard, getCurrentUser } from '../services/supabaseService'
import { uploadImage } from '../services/storageService'
import { downloadImage } from '../utils/downloadImage'

const { width, height } = Dimensions.get('window')

export default function CardDetail() {
  const { cardId, cardName, sectionTitle, sectionId, images } = useLocalSearchParams()
  const [cardImages, setCardImages] = useState(images ? JSON.parse(images) : [])
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [imageViewerVisible, setImageViewerVisible] = useState(false)
  const [editedName, setEditedName] = useState(cardName)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const scrollViewRef = useRef(null)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)

  const handleEdit = () => {
    setEditedName(cardName)
    setEditModalVisible(true)
  }

  const handleUpdateCard = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Please enter a document name')
      return
    }

    try {
      setUpdating(true)
      await updateCard(cardId, { name: editedName })
      setEditModalVisible(false)
      Alert.alert('Success', 'Document updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ])
    } catch (error) {
      console.error('Error updating card:', error)
      Alert.alert('Error', 'Failed to update document')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      })

      if (!result.canceled) {
        setUpdating(true)
        const user = await getCurrentUser()
        
        const newImageUrls = []
        for (const asset of result.assets) {
          const publicUrl = await uploadImage(asset.uri, user.id)
          newImageUrls.push(publicUrl)
        }

        const updatedImages = [...cardImages, ...newImageUrls]
        
        await updateCard(cardId, { images: updatedImages })
        
        setCardImages(updatedImages)
        setUpdating(false)
        Alert.alert('Success', 'Images added successfully!')
      }
    } catch (error) {
      console.error('Error adding images:', error)
      Alert.alert('Error', 'Failed to add images')
      setUpdating(false)
    }
  }

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${cardName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true)
              await deleteCard(cardId)
              Alert.alert('Success', 'Document deleted successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ])
            } catch (error) {
              console.error('Error deleting card:', error)
              Alert.alert('Error', 'Failed to delete document')
              setDeleting(false)
            }
          }
        }
      ]
    )
  }

  const handleDownloadImage = async () => {
    if (!cardImages[activeImageIndex]) {
      Alert.alert('Error', 'No image to download')
      return
    }

    try {
      setDownloading(true)
      await downloadImage(cardImages[activeImageIndex])
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(false)
    }
  }

  const handleShare = async () => {
    if (cardImages.length === 0) {
      Alert.alert('No Images', 'Add some images first to share them!')
      return
    }

    // Show options: Share current image or all images
    Alert.alert(
      'Share Images',
      'What would you like to share?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Current Image',
          onPress: () => shareCurrentImage()
        },
        {
          text: `All Images (${cardImages.length})`,
          onPress: () => shareAllImages()
        }
      ]
    )
  }

  const shareCurrentImage = async () => {
    try {
      setSharing(true)
      const imageUrl = cardImages[activeImageIndex]
      
      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync()
      if (!isAvailable) {
        // Fallback to native Share API
        await Share.share({
          message: `Check out this image from ${cardName}!`,
          url: imageUrl,
          title: cardName
        })
        return
      }

      // Download image to local storage
      const timestamp = Date.now()
      const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
      const filename = `${cardName}_${timestamp}.${extension}`
      const fileUri = `${FileSystem.documentDirectory}${filename}`

      console.log('Downloading image for sharing...')
      const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri)

      if (downloadResult.status === 200) {
        // Share the local file
        await Sharing.shareAsync(downloadResult.uri, {
          mimeType: `image/${extension}`,
          dialogTitle: `Share ${cardName}`,
          UTI: `public.${extension}`
        })

        // Clean up temp file
        try {
          await FileSystem.deleteAsync(fileUri, { idempotent: true })
        } catch (cleanupError) {
          console.log('Cleanup skipped:', cleanupError)
        }
      } else {
        throw new Error('Failed to download image')
      }
    } catch (error) {
      console.error('Share failed:', error)
      Alert.alert('Share Failed', 'Unable to share image. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const shareAllImages = async () => {
    try {
      setSharing(true)
      
      // For multiple images, we'll share via text with URLs
      const imageList = cardImages.map((url, index) => `Image ${index + 1}: ${url}`).join('\n\n')
      const message = `${cardName}\n\n${cardImages.length} images from docvault :\n\n${imageList}`
      
      await Share.share({
        message: message,
        title: `${cardName} - ${cardImages.length} Images`
      })
    } catch (error) {
      console.error('Share all failed:', error)
      Alert.alert('Share Failed', 'Unable to share images. Please try again.')
    } finally {
      setSharing(false)
    }
  }

  const openImageViewer = (index) => {
    setActiveImageIndex(index)
    setImageViewerVisible(true)
  }

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (activeImageIndex + 1) % cardImages.length
      : (activeImageIndex - 1 + cardImages.length) % cardImages.length
    setActiveImageIndex(newIndex)
  }

  if (deleting) {
    return (
      <LinearGradient
        colors={['#0f0a1f', '#1e1b4b', '#312e81']}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#a78bfa" />
              <Text style={styles.loadingText}>Deleting document...</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={['#0f0a1f', '#1e1b4b', '#312e81']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText} numberOfLines={1}>{cardName}</Text>
            <View style={styles.breadcrumb}>
              <Ionicons name="folder" size={12} color="#a78bfa" />
              <Text style={styles.breadcrumbText}>{sectionTitle}</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.shareButton} 
            onPress={handleShare}
            disabled={sharing || cardImages.length === 0}
          >
            {sharing ? (
              <ActivityIndicator size={22} color="#fff" />
            ) : (
              <Ionicons name="share-outline" size={22} color={cardImages.length === 0 ? '#64748b' : '#fff'} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Images Gallery */}
          {cardImages.length > 0 ? (
            <View style={styles.gallerySection}>
              <View style={styles.gallerySectionHeader}>
                <Text style={styles.galleryTitle}>Gallery</Text>
                <View style={styles.imageCounter}>
                  <Ionicons name="image" size={14} color="#a78bfa" />
                  <Text style={styles.imageCounterText}>
                    {cardImages.length} {cardImages.length === 1 ? 'image' : 'images'}
                  </Text>
                </View>
              </View>

              {/* Main Featured Image */}
              <Pressable 
                onPress={() => openImageViewer(activeImageIndex)}
                style={styles.featuredImageContainer}
              >
                <Image 
                  source={{ uri: cardImages[activeImageIndex] }} 
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredOverlay}
                >
                  <View style={styles.imageInfo}>
                    <View style={styles.imageBadge}>
                      <Ionicons name="eye" size={16} color="#fff" />
                      <Text style={styles.imageBadgeText}>Tap to view full</Text>
                    </View>
                    <Text style={styles.imageIndexText}>
                      {activeImageIndex + 1} / {cardImages.length}
                    </Text>
                  </View>
                </LinearGradient>

                {/* Navigation Arrows */}
                {cardImages.length > 1 && (
                  <>
                    <TouchableOpacity 
                      style={[styles.navArrow, styles.navArrowLeft]}
                      onPress={(e) => {
                        e.stopPropagation()
                        const newIndex = (activeImageIndex - 1 + cardImages.length) % cardImages.length
                        setActiveImageIndex(newIndex)
                      }}
                    >
                      <Ionicons name="chevron-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.navArrow, styles.navArrowRight]}
                      onPress={(e) => {
                        e.stopPropagation()
                        const newIndex = (activeImageIndex + 1) % cardImages.length
                        setActiveImageIndex(newIndex)
                      }}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
              </Pressable>

              {/* Thumbnail Strip */}
              {cardImages.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.thumbnailStrip}
                >
                  {cardImages.map((uri, index) => (
                    <TouchableOpacity 
                      key={index}
                      onPress={() => setActiveImageIndex(index)}
                      style={[
                        styles.thumbnail,
                        index === activeImageIndex && styles.thumbnailActive
                      ]}
                    >
                      <Image 
                        source={{ uri }} 
                        style={styles.thumbnailImage}
                        resizeMode="cover"
                      />
                      {index === activeImageIndex && (
                        <View style={styles.thumbnailActiveBorder} />
                      )}
                    </TouchableOpacity>
                  ))}
                  
                  {/* Add More Button in Thumbnail Strip */}
                  <TouchableOpacity 
                    style={styles.addThumbnail}
                    onPress={handleAddImages}
                    disabled={updating}
                  >
                    <LinearGradient
                      colors={['rgba(167, 139, 250, 0.2)', 'rgba(139, 92, 246, 0.1)']}
                      style={styles.addThumbnailGradient}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color="#a78bfa" />
                      ) : (
                        <Ionicons name="add" size={28} color="#a78bfa" />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              )}

              {/* Single Add Button if only one or no thumbnail strip */}
              {cardImages.length === 1 && (
                <TouchableOpacity 
                  style={styles.addMoreButton}
                  onPress={handleAddImages}
                  disabled={updating}
                >
                  <LinearGradient
                    colors={['rgba(167, 139, 250, 0.15)', 'rgba(139, 92, 246, 0.05)']}
                    style={styles.addMoreGradient}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="#a78bfa" />
                    ) : (
                      <Ionicons name="add-circle-outline" size={20} color="#a78bfa" />
                    )}
                    <Text style={styles.addMoreText}>
                      {updating ? 'Adding...' : 'Add More Images'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.emptyGallery}>
              <LinearGradient
                colors={['rgba(167, 139, 250, 0.1)', 'rgba(139, 92, 246, 0.05)']}
                style={styles.emptyGalleryGradient}
              >
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="images-outline" size={48} color="#a78bfa" />
                </View>
                <Text style={styles.emptyTitle}>No Images Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Add images to your document to view them here
                </Text>
                <TouchableOpacity 
                  style={styles.emptyAddButton}
                  onPress={handleAddImages}
                  disabled={updating}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    style={styles.emptyAddGradient}
                  >
                    {updating ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="camera" size={20} color="#fff" />
                        <Text style={styles.emptyAddText}>Add Your First Image</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.quickActionsTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionCard} 
                onPress={handleShare}
                disabled={sharing || cardImages.length === 0}
              >
                <LinearGradient
                  colors={['rgba(59, 130, 246, 0.15)', 'rgba(37, 99, 235, 0.05)']}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionIconCircle}>
                    {sharing ? (
                      <ActivityIndicator size={22} color="#3b82f6" />
                    ) : (
                      <Ionicons name="share-social" size={22} color="#3b82f6" />
                    )}
                  </View>
                  <Text style={styles.actionText}>
                    {sharing ? 'Sharing...' : 'Share'}
                  </Text>
                  <Text style={styles.actionSubtext}>
                    {cardImages.length === 0 ? 'No images' : 'To other apps'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard} 
                onPress={handleDownloadImage}
                disabled={downloading || cardImages.length === 0}
              >
                <LinearGradient
                  colors={['rgba(16, 185, 129, 0.15)', 'rgba(5, 150, 105, 0.05)']}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionIconCircle}>
                    {downloading ? (
                      <ActivityIndicator size={22} color="#10b981" />
                    ) : (
                      <Ionicons name="download" size={22} color="#10b981" />
                    )}
                  </View>
                  <Text style={styles.actionText}>
                    {downloading ? 'Downloading...' : 'Download'}
                  </Text>
                  <Text style={styles.actionSubtext}>
                    {cardImages.length === 0 ? 'No images' : 'Save to gallery'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* <TouchableOpacity 
                style={styles.actionCard} 
                onPress={() => Alert.alert('Print', 'Print to PDF coming soon!')}
              >
                <LinearGradient
                  colors={['rgba(245, 158, 11, 0.15)', 'rgba(217, 119, 6, 0.05)']}
                  style={styles.actionGradient}
                >
                  <View style={styles.actionIconCircle}>
                    <Ionicons name="print" size={22} color="#f59e0b" />
                  </View>
                  <Text style={styles.actionText}>Print PDF</Text>
                  <Text style={styles.actionSubtext}>Coming soon</Text>
                </LinearGradient>
              </TouchableOpacity> */}
            </View>
          </View>
        </ScrollView>

        {/* Floating Action Buttons */}
        <View style={styles.floatingActions}>
          <TouchableOpacity 
            style={styles.fabEdit}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.fabGradient}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
              <Text style={styles.fabText}>Edit</Text>
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.fabDelete}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <View style={styles.fabDeleteInner}>
              <Ionicons name="trash-outline" size={22} color="#ef4444" />
              <Text style={styles.fabDeleteText}>Delete</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Full Screen Image Viewer Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        >
          <View style={styles.imageViewerContainer}>
            <LinearGradient
              colors={['#000', '#0a0a0a']}
              style={styles.imageViewerGradient}
            >
              {/* Close Button */}
              <SafeAreaView style={styles.imageViewerHeader}>
                <TouchableOpacity 
                  onPress={() => setImageViewerVisible(false)}
                  style={styles.imageViewerClose}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.imageViewerCounter}>
                  {activeImageIndex + 1} / {cardImages.length}
                </Text>
              </SafeAreaView>

              {/* Main Image */}
              <View style={styles.imageViewerContent}>
                <Image 
                  source={{ uri: cardImages[activeImageIndex] }} 
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
              </View>

              {/* Navigation Controls */}
              {cardImages.length > 1 && (
                <View style={styles.imageViewerControls}>
                  <TouchableOpacity 
                    style={styles.imageViewerNavButton}
                    onPress={() => navigateImage('prev')}
                  >
                    <Ionicons name="chevron-back" size={32} color="#fff" />
                  </TouchableOpacity>
                  <View style={styles.imageViewerDots}>
                    {cardImages.map((_, index) => (
                      <View 
                        key={index}
                        style={[
                          styles.imageViewerDot,
                          index === activeImageIndex && styles.imageViewerDotActive
                        ]}
                      />
                    ))}
                  </View>
                  <TouchableOpacity 
                    style={styles.imageViewerNavButton}
                    onPress={() => navigateImage('next')}
                  >
                    <Ionicons name="chevron-forward" size={32} color="#fff" />
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editModalVisible}
          onRequestClose={() => !updating && setEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1e1b4b', '#1a1537']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Edit Document</Text>
                    <Text style={styles.modalSubtitle}>Update your document name</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setEditModalVisible(false)}
                    style={styles.closeModalButton}
                    disabled={updating}
                  >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="document-text" size={14} color="#a78bfa" /> Document Name
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter document name"
                    placeholderTextColor="#64748B"
                    value={editedName}
                    onChangeText={setEditedName}
                    editable={!updating}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={styles.modalCancelButton} 
                    onPress={() => setEditModalVisible(false)}
                    disabled={updating}
                  >
                    <Text style={styles.modalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.modalSaveButton} 
                    onPress={handleUpdateCard}
                    disabled={updating}
                  >
                    <LinearGradient
                      colors={updating ? ['#64748b', '#475569'] : ['#8b5cf6', '#7c3aed']}
                      style={styles.modalSaveGradient}
                    >
                      {updating ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      )}
                      <Text style={styles.modalSaveText}>
                        {updating ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
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
    padding: 24,
  },
  loadingBox: {
    backgroundColor: 'rgba(30, 27, 75, 0.8)',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breadcrumbText: {
    fontSize: 13,
    color: '#a78bfa',
    fontWeight: '600',
  },
  shareButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gallerySection: {
    marginBottom: 28,
  },
  gallerySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  imageCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  imageCounterText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a78bfa',
  },
  featuredImageContainer: {
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  featuredImage: {
    width: '100%',
    height: 400,
    backgroundColor: 'rgba(30, 27, 75, 0.5)',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
  },
  imageBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  imageIndexText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -22 }],
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  navArrowLeft: {
    left: 16,
  },
  navArrowRight: {
    right: 16,
  },
  thumbnailStrip: {
    paddingVertical: 8,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  thumbnailActive: {
    borderColor: '#a78bfa',
    borderWidth: 3,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailActiveBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
  },
  addThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addThumbnailGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderStyle: 'dashed',
  },
  addMoreButton: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  addMoreText: {
    color: '#a78bfa',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyGallery: {
    marginBottom: 28,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyGalleryGradient: {
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyAddButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  emptyAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  quickActions: {
    marginBottom: 24,
  },
  quickActionsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  actionGradient: {
    padding: 18,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  actionSubtext: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  floatingActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 24,
    backgroundColor: 'rgba(15, 10, 31, 0.98)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(167, 139, 250, 0.2)',
  },
  fabEdit: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  fabDelete: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  fabDeleteInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  fabDeleteText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
  imageViewerContainer: {
    flex: 1,
  },
  imageViewerGradient: {
    flex: 1,
  },
  imageViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  imageViewerClose: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageViewerCounter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  imageViewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: width,
    height: height * 0.7,
  },
  imageViewerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  imageViewerNavButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageViewerDots: {
    flexDirection: 'row',
    gap: 8,
  },
  imageViewerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  imageViewerDotActive: {
    backgroundColor: '#a78bfa',
    width: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 28,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  closeModalButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  inputWrapper: {
    marginBottom: 28,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#a78bfa',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  modalInput: {
    backgroundColor: 'rgba(15, 10, 31, 0.8)',
    borderWidth: 2,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    borderRadius: 16,
    padding: 18,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalCancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSaveButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalSaveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  modalSaveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})