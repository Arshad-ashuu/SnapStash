import { supabase } from '../config/supabase'
import { decode } from 'base64-arraybuffer'

export const uploadImage = async (uri, userId) => {
  try {
    const fileExt = uri.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`

    // Fetch the image as a blob
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // Convert blob to base64
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1]
        resolve(base64data)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })

    // Convert base64 to ArrayBuffer for Supabase
    const arrayBuffer = decode(base64)

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from('card-images')
      .upload(fileName, arrayBuffer, {
        contentType: `image/${fileExt}`,
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data } = supabase.storage
      .from('card-images')
      .getPublicUrl(fileName)

    return data.publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export const deleteImage = async (imageUrl) => {
  try {
    // Extract file path from public URL
    const urlParts = imageUrl.split('card-images/')
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL')
    }
    
    const filePath = urlParts[1]

    const { error } = await supabase.storage
      .from('card-images')
      .remove([filePath])

    if (error) throw error
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}