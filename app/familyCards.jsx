// ============================================
// FILE: app/familyCards.jsx (CREATE THIS NEW FILE)
// ============================================

import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, router } from 'expo-router'
import { getFamilyMemberCards } from '../services/supabaseService'

export default function FamilyCards() {
  const { familyUserId, familyEmail } = useLocalSearchParams()
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [])

  const loadCards = async () => {
    try {
      setLoading(true)
      const data = await getFamilyMemberCards(familyUserId)
      setCards(data)
    } catch (error) {
      console.error('Error loading cards:', error)
      Alert.alert('Error', 'Failed to load cards')
    } finally {
      setLoading(false)
    }
  }

  const viewCard = (card) => {
    router.push({
      pathname: '/cardDetail',
      params: {
        cardId: card.id,
        cardName: card.name,
        sectionTitle: card.sections?.title || 'Unknown',
        sectionId: card.section_id,
        images: JSON.stringify(card.images || [])
      }
    })
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0f0a1f', '#1e1b4b', '#312e81']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a78bfa" />
            <Text style={styles.loadingText}>Loading documents...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0f0a1f', '#1e1b4b', '#312e81']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText} numberOfLines={1}>{familyEmail}</Text>
            <View style={styles.breadcrumb}>
              <Ionicons name="lock-open" size={12} color="#a78bfa" />
              <Text style={styles.breadcrumbText}>Shared Documents</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.15)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.statsGradient}
          >
            <View style={styles.statItem}>
              <Ionicons name="documents" size={28} color="#a78bfa" />
              <Text style={styles.statNumber}>{cards.length}</Text>
              <Text style={styles.statLabel}>Shared Documents</Text>
            </View>
          </LinearGradient>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {cards.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="folder-open-outline" size={48} color="#a78bfa" />
              </View>
              <Text style={styles.emptyTitle}>No Documents Shared</Text>
              <Text style={styles.emptySubtitle}>
                This family member hasn't shared any documents yet
              </Text>
            </View>
          ) : (
            <View style={styles.cardsGrid}>
              {cards.map((card) => (
                <TouchableOpacity 
                  key={card.id} 
                  style={styles.cardItem}
                  onPress={() => viewCard(card)}
                >
                  <LinearGradient
                    colors={['rgba(30, 27, 75, 0.8)', 'rgba(26, 21, 55, 0.6)']}
                    style={styles.cardGradient}
                  >
                    {/* Card Image or Placeholder */}
                    <View style={styles.cardImageContainer}>
                      {card.images && card.images.length > 0 ? (
                        <Image 
                          source={{ uri: card.images[0] }} 
                          style={styles.cardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.cardImagePlaceholder}>
                          <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.3)" />
                        </View>
                      )}
                      
                      {/* Image Count Badge */}
                      {card.images && card.images.length > 0 && (
                        <View style={styles.imageCountBadge}>
                          <Ionicons name="images" size={12} color="#fff" />
                          <Text style={styles.imageCountText}>{card.images.length}</Text>
                        </View>
                      )}
                    </View>

                    {/* Card Info */}
                    <View style={styles.cardInfo}>
                      <View style={styles.cardHeader}>
                        <View style={styles.sectionBadge}>
                          <Text style={styles.sectionIcon}>{card.sections?.icon || '📁'}</Text>
                          <Text style={styles.sectionTitle} numberOfLines={1}>
                            {card.sections?.title || 'Unknown'}
                          </Text>
                        </View>
                      </View>
                      
                      <Text style={styles.cardName} numberOfLines={2}>{card.name}</Text>
                      
                      <View style={styles.cardFooter}>
                        <View style={styles.viewBadge}>
                          <Ionicons name="eye" size={12} color="#a78bfa" />
                          <Text style={styles.viewText}>View Only</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.4)" />
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
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
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
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
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statsGradient: {
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
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
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 22,
  },
  cardsGrid: {
    gap: 16,
  },
  cardItem: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: 'rgba(15, 10, 31, 0.5)',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.05)',
  },
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  imageCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 8,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  sectionIcon: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a78bfa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 24,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a78bfa',
  },
})