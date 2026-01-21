import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native'
import React, { useEffect, useRef } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '../hooks/useAuth'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const { width, height } = Dimensions.get('window')

export default function Index() {
  const { user, loading } = useAuth()
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    if (!loading && user) {
      router.replace('/(tabs)')
    }
  }, [loading, user])

  if (loading) {
    return (
      <LinearGradient
        colors={['#1e1b4b', '#312e81', '#4c1d95']}
        style={styles.center}
      >
        <View style={styles.loadingContainer}>
          <Ionicons name="document-text-outline" size={56} color="#fff" />
          <Text style={styles.loadingText}>docvault </Text>
          <Text style={styles.loadingSubtext}>Loading...</Text>
        </View>
      </LinearGradient>
    )
  }

  if (user) {
    return null
  }

  return (
    <LinearGradient
      colors={['#1e1b4b', '#312e81', '#4c1d95']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo & Brand */}
            <View style={styles.brandContainer}>
              <View style={styles.logoWrapper}>
                <LinearGradient
                  colors={['#8b5cf6', '#6366f1']}
                  style={styles.logoGradient}
                >
                  <Ionicons name="camera" size={48} color="#fff" />
                </LinearGradient>
                <View style={styles.logoBadge}>
                  <Ionicons name="flash" size={16} color="#fbbf24" />
                </View>
              </View>
              <Text style={styles.brandName}>docvault </Text>
              <Text style={styles.tagline}>Your Emergency Document Vault</Text>
            </View>

            {/* Hero Section */}
            <View style={styles.hero}>
              <Text style={styles.headline}>
                Never Lose Important{'\n'}Documents Again
              </Text>
              <Text style={styles.description}>
                Stop panic-searching through thousands of photos. Snap, organize, and find your crucial documents instantly.
              </Text>
            </View>

            {/* Feature Pills */}
            <View style={styles.pillsContainer}>
              <View style={styles.pill}>
                <Ionicons name="flash-outline" size={16} color="#fbbf24" />
                <Text style={styles.pillText}>Instant Access</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="shield-checkmark" size={16} color="#34d399" />
                <Text style={styles.pillText}>Secure</Text>
              </View>
              <View style={styles.pill}>
                <Ionicons name="layers-outline" size={16} color="#60a5fa" />
                <Text style={styles.pillText}>Organized</Text>
              </View>
            </View>

            {/* Use Cases */}
            <View style={styles.useCases}>
              <Text style={styles.useCasesTitle}>Perfect For:</Text>
              <View style={styles.useCaseGrid}>
                {[
                  { icon: 'medkit-outline', text: 'Medical Docs', color: '#ef4444' },
                  { icon: 'airplane-outline', text: 'Travel', color: '#3b82f6' },
                  { icon: 'shield-outline', text: 'Insurance', color: '#10b981' },
                  { icon: 'school-outline', text: 'Certificates', color: '#f59e0b' },
                  { icon: 'card-outline', text: 'IDs & Cards', color: '#8b5cf6' },
                  { icon: 'receipt-outline', text: 'Receipts', color: '#ec4899' },
                ].map((item, index) => (
                  <View key={index} style={styles.useCaseCard}>
                    <View style={[styles.useCaseIcon, { backgroundColor: item.color + '20' }]}>
                      <Ionicons name={item.icon} size={20} color={item.color} />
                    </View>
                    <Text style={styles.useCaseText}>{item.text}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Features */}
            <View style={styles.features}>
              {[
                {
                  icon: 'camera',
                  title: 'Snap & Save',
                  desc: 'Capture documents in seconds',
                  gradient: ['#8b5cf6', '#6366f1'],
                },
                {
                  icon: 'folder-open',
                  title: 'Smart Organize',
                  desc: 'Custom sections that make sense',
                  gradient: ['#ec4899', '#8b5cf6'],
                },
                
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <LinearGradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    colors={feature.gradient}
                    style={styles.featureIcon}
                  >
                    <Ionicons name={feature.icon} size={24} color="#fff" />
                  </LinearGradient>
                  <View style={styles.featureContent}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/signin')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8b5cf6', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGradient}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/signin')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Already have an account? Sign In</Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    paddingBottom: 120,
    
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom:60,

  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logoBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#1f2937',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e1b4b',
  },
  brandName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
  hero: {
    marginBottom: 32,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 40,
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    lineHeight: 24,
    textAlign: 'center',
  },
  pillsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
    flexWrap: 'wrap',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  pillText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  useCases: {
    marginBottom: 40,
  },
  useCasesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  useCaseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  useCaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  useCaseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  useCaseText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  features: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    padding: 20,
    bottom:6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureContent: {
    flex: 1,
   
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  actionsContainer: {
    position: 'absolute',
    bottom: 0,

    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
    backgroundColor: 'rgba(30, 27, 75, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  primaryBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
})