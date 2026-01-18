import { supabase } from '../config/supabase'

// ========== AUTH ==========

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ========== SECTIONS ==========

// export const addSection = async (sectionData) => {
//   const { data: { user } } = await supabase.auth.getUser()
  
//   const { data, error } = await supabase
//     .from('sections')
//     .insert({
//       ...sectionData,
//       user_id: user.id,
//     })
//     .select()
//     .single()
  
//   if (error) throw error
//   return data
// }

// export const getSections = async () => {
//   const { data, error } = await supabase
//     .from('sections')
//     .select('*')
//     .order('order_index', { ascending: true })
  
//   if (error) throw error
//   return data
// }

// Add these if not already present:

export const getSections = async () => {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

export const addSection = async (title, icon = '📁') => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('sections')
    .insert({
      title,
      icon,
      user_id: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteSection = async (sectionId) => {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId)
  
  if (error) throw error
}

export const updateSection = async (sectionId, updates) => {
  const { data, error } = await supabase
    .from('sections')
    .update(updates)
    .eq('id', sectionId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// export const deleteSection = async (sectionId) => {
//   const { error } = await supabase
//     .from('sections')
//     .delete()
//     .eq('id', sectionId)
  
//   if (error) throw error
// }

// ========== CARDS ==========

// export const addCard = async (sectionId, cardData) => {
//   const { data: { user } } = await supabase.auth.getUser()
  
//   const { data, error } = await supabase
//     .from('cards')
//     .insert({
//       ...cardData,
//       section_id: sectionId,
//       user_id: user.id,
//     })
//     .select()
//     .single()
  
//   if (error) throw error
//   return data
// }

// export const getCards = async (sectionId) => {
//   const { data, error } = await supabase
//     .from('cards')
//     .select('*')
//     .eq('section_id', sectionId)
//     .order('created_at', { ascending: false })
  
//   if (error) throw error
//   return data
// }

// export const updateCard = async (cardId, updates) => {
//   const { data, error } = await supabase
//     .from('cards')
//     .update({
//       ...updates,
//       updated_at: new Date().toISOString(),
//     })
//     .eq('id', cardId)
//     .select()
//     .single()
  
//   if (error) throw error
//   return data
// }

// export const deleteCard = async (cardId) => {
//   const { error } = await supabase
//     .from('cards')
//     .delete()
//     .eq('id', cardId)
  
//   if (error) throw error
// }



// Add these functions

export const getCards = async (sectionId) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export const addCard = async (sectionId, cardData) => {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('cards')
    .insert({
      ...cardData,
      section_id: sectionId,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateCard = async (cardId, updates) => {
  const { data, error } = await supabase
    .from('cards')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', cardId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const deleteCard = async (cardId) => {
  const { error } = await supabase
    .from('cards')
    .delete()
    .eq('id', cardId)
  
  if (error) throw error
}


// FILE 1: supabaseService.js (ADD THESE FUNCTIONS)
// ============================================

// ========== FAMILY SHARING ==========

// Generate or get user's share code
export const getMyShareCode = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user already has a share code
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('share_code')
    .eq('user_id', user.id)
    .single()
  
  if (existing?.share_code) {
    return existing.share_code
  }
  
  // Generate new 6-digit code
  const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  
  // Save to database
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: user.id,
      share_code: shareCode,
      email: user.email
    })
    .select()
    .single()
  
  if (error) throw error
  return shareCode
}

// Add family member by their share code
export const addFamilyMember = async (shareCode) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  // Find user with this share code
  const { data: targetUser, error: findError } = await supabase
    .from('user_profiles')
    .select('user_id, email')
    .eq('share_code', shareCode.toUpperCase())
    .single()
  
  if (findError || !targetUser) {
    throw new Error('Invalid share code')
  }
  
  if (targetUser.user_id === user.id) {
    throw new Error('You cannot add yourself')
  }
  
  // Check if already added
  const { data: existing } = await supabase
    .from('family_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('family_user_id', targetUser.user_id)
    .single()
  
  if (existing) {
    throw new Error('This family member is already added')
  }
  
  // Add family member
  const { data, error } = await supabase
    .from('family_members')
    .insert({
      user_id: user.id,
      family_user_id: targetUser.user_id,
      family_email: targetUser.email
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get my family members
export const getFamilyMembers = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      id,
      family_user_id,
      family_email,
      nickname,
      created_at
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Remove family member
export const removeFamilyMember = async (familyMemberId) => {
  const { error } = await supabase
    .from('family_members')
    .delete()
    .eq('id', familyMemberId)
  
  if (error) throw error
}

// Update family member nickname
export const updateFamilyMemberNickname = async (familyMemberId, nickname) => {
  const { data, error } = await supabase
    .from('family_members')
    .update({ nickname })
    .eq('id', familyMemberId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get cards shared by a family member
export const getFamilyMemberCards = async (familyUserId) => {
  const { data, error } = await supabase
    .from('cards')
    .select(`
      id,
      name,
      images,
      section_id,
      created_at,
      sections (
        title,
        icon
      )
    `)
    .eq('user_id', familyUserId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
