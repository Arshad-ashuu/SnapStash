import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform } from 'react-native';

export const downloadImage = async (imageUrl) => {
  try {
    if (!imageUrl) {
      Alert.alert('Error', 'No image URL provided');
      return;
    }

    console.log('Requesting permissions...');
    
    // Request media library permissions (only photos, no audio)
    const { status, canAskAgain, granted } = await MediaLibrary.requestPermissionsAsync(false);
    
    console.log('Permission status:', { status, canAskAgain, granted });

    if (status !== 'granted') {
      if (canAskAgain) {
        Alert.alert(
          'Permission Required', 
          'docvault  needs permission to save images to your gallery. Please allow access when prompted.',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Try Again', 
              onPress: async () => {
                const retry = await MediaLibrary.requestPermissionsAsync(false);
                if (retry.status === 'granted') {
                  await downloadImage(imageUrl);
                }
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'Permission Denied',
          'Please enable storage access in your device settings:\nSettings > Apps > docvault  > Permissions',
          [{ text: 'OK' }]
        );
      }
      return;
    }

    console.log('Starting download from:', imageUrl);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = `docvault _${timestamp}.${extension}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    // Download the image
    console.log('Downloading to:', fileUri);
    const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);

    if (downloadResult.status !== 200) {
      throw new Error(`Download failed with status: ${downloadResult.status}`);
    }

    console.log('Download successful, creating asset...');

    // Save to device gallery
    const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
    console.log('Asset created:', asset.id);

    // Try to organize into album (optional, won't fail if it doesn't work)
    if (Platform.OS === 'android') {
      try {
        const albumName = 'docvault ';
        const album = await MediaLibrary.getAlbumAsync(albumName);
        
        if (album === null) {
          await MediaLibrary.createAlbumAsync(albumName, asset, false);
          console.log('Created album and added image');
        } else {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          console.log('Added image to existing album');
        }
      } catch (albumError) {
        console.log('Album organization skipped:', albumError.message);
      }
    }

    // Clean up temp file
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    } catch (cleanupError) {
      console.log('Cleanup skipped:', cleanupError.message);
    }

    Alert.alert(
      '✓ Success!', 
      Platform.OS === 'android' 
        ? 'Image saved to Gallery' 
        : 'Image saved to Photos'
    );
    
    return asset.uri;
  } catch (error) {
    console.error('Download error:', error);
    
    let errorMessage = 'Failed to download image. Please try again.';
    
    if (error.message?.includes('Network') || error.message?.includes('fetch')) {
      errorMessage = 'Network error. Please check your internet connection.';
    } else if (error.message?.includes('permission')) {
      errorMessage = 'Permission denied. Please enable storage access in Settings.';
    } else if (error.message?.includes('space')) {
      errorMessage = 'Not enough storage space on device.';
    }
    
    Alert.alert('Download Failed', errorMessage);
    throw error;
  }
};