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

export const addSection = async (sectionData) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('sections')
    .insert({
      ...sectionData,
      user_id: user.id,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export const getSections = async () => {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data
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

export const deleteSection = async (sectionId) => {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId)
  
  if (error) throw error
}

// ========== CARDS ==========

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

export const getCards = async (sectionId) => {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false })
  
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