import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import { Alert, Platform } from 'react-native'

export const downloadImage = async (imageUrl) => {
  try {
    // Android needs permission
   const { status } = await MediaLibrary.requestPermissionsAsync()
if (status !== 'granted') {
  Alert.alert('Permission required')
  return
}
    const fileName = imageUrl.split('/').pop()
    const fileUri = FileSystem.documentDirectory + fileName

    const { uri } = await FileSystem.downloadAsync(imageUrl, fileUri)
    await MediaLibrary.saveToLibraryAsync(uri)

    Alert.alert('Downloaded', 'Image saved to gallery')
  } catch (error) {
    console.error(error)
    Alert.alert('Error', 'Failed to download image')
  }
}
