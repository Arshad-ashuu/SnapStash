import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Link, router } from 'expo-router'

export default function index() {
  return (
    <SafeAreaView>

    <TouchableOpacity onPress={()=> router.push('/signin')} style={{padding: 20, backgroundColor: 'red', margin: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center'}}>
      <Text>index</Text>
    </TouchableOpacity>
    </SafeAreaView>
  )
}