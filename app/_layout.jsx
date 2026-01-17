import React from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { View, Platform } from 'react-native'

export default function RootLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <StatusBar style="light" backgroundColor="#0F172A" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0F172A' },
          animation: 'fade',
          presentation: Platform.OS === 'android' ? 'card' : 'default',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="card" />
        <Stack.Screen name="cardDetail" />
      </Stack>
    </View>
  )
}