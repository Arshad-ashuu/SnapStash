
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Modal, TextInput, ActivityIndicator, Share } from 'react-native'
import React, { useState, useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { getMyShareCode, getFamilyMembers, addFamilyMember, removeFamilyMember, updateFamilyMemberNickname } from '../../services/supabaseService'

export default function Family() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [shareCodeModalVisible, setShareCodeModalVisible] = useState(false)
  const [editNicknameModalVisible, setEditNicknameModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [myShareCode, setMyShareCode] = useState('')
  const [inputShareCode, setInputShareCode] = useState('')
  const [nicknameInput, setNicknameInput] = useState('')
  const [adding, setAdding] = useState(false)
  const [updatingNickname, setUpdatingNickname] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [familyData, shareCode] = await Promise.all([
        getFamilyMembers(),
        getMyShareCode()
      ])
      setMembers(familyData)
      setMyShareCode(shareCode)
    } catch (error) {
      console.error('Error loading family data:', error)
      Alert.alert('Error', 'Failed to load family members')
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!inputShareCode.trim()) {
      Alert.alert('Error', 'Please enter a share code')
      return
    }

    try {
      setAdding(true)
      await addFamilyMember(inputShareCode)
      setAddModalVisible(false)
      setInputShareCode('')
      Alert.alert('Success', 'Family member added successfully!')
      loadData()
    } catch (error) {
      console.error('Error adding family member:', error)
      Alert.alert('Error', error.message || 'Failed to add family member')
    } finally {
      setAdding(false)
    }
  }

  const handleRemoveMember = (member) => {
    Alert.alert(
      'Remove Family Member',
      `Remove ${member.nickname || member.family_email} from your family?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFamilyMember(member.id)
              Alert.alert('Success', 'Family member removed')
              loadData()
            } catch (error) {
              Alert.alert('Error', 'Failed to remove family member')
            }
          }
        }
      ]
    )
  }

  const handleEditNickname = (member) => {
    setSelectedMember(member)
    setNicknameInput(member.nickname || '')
    setEditNicknameModalVisible(true)
  }

  const handleUpdateNickname = async () => {
    try {
      setUpdatingNickname(true)
      await updateFamilyMemberNickname(selectedMember.id, nicknameInput.trim())
      setEditNicknameModalVisible(false)
      Alert.alert('Success', 'Nickname updated!')
      loadData()
    } catch (error) {
      console.error('Error updating nickname:', error)
      Alert.alert('Error', 'Failed to update nickname')
    } finally {
      setUpdatingNickname(false)
    }
  }

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Join my family on DocVault! Use my share code: ${myShareCode}`,
        title: 'Share Code'
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const viewMemberCards = (member) => {
    router.push({
      pathname: '/familyCards',
      params: {
        familyUserId: member.family_user_id,
        familyEmail: member.family_email
      }
    })
  }

  if (loading) {
    return (
      <LinearGradient colors={['#0f0a1f', '#1e1b4b', '#312e81']} style={styles.gradient}>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#a78bfa" />
            <Text style={styles.loadingText}>Loading family...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient colors={['#0f0a1f', '#1e1b4b', '#312e81']} style={styles.gradient}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerText}>Family Members</Text>
            <Text style={styles.subHeaderText}>{members.length} members connected</Text>
          </View>
          <TouchableOpacity 
            style={styles.shareCodeButton}
            onPress={() => setShareCodeModalVisible(true)}
          >
            <Ionicons name="qr-code-outline" size={24} color="#a78bfa" />
          </TouchableOpacity>
        </View>

        {/* My Share Code Card */}
        <View style={styles.shareCodeCard}>
          <LinearGradient
            colors={['rgba(167, 139, 250, 0.15)', 'rgba(139, 92, 246, 0.05)']}
            style={styles.shareCodeGradient}
          >
            <View style={styles.shareCodeHeader}>
              <View style={styles.shareCodeIconCircle}>
                <Ionicons name="key" size={24} color="#a78bfa" />
              </View>
              <View style={styles.shareCodeInfo}>
                <Text style={styles.shareCodeLabel}>My Share Code</Text>
                <Text style={styles.shareCodeText}>{myShareCode}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShareCode}>
              <Ionicons name="share-social" size={18} color="#a78bfa" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {members.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="people-outline" size={48} color="#a78bfa" />
              </View>
              <Text style={styles.emptyTitle}>No Family Members Yet</Text>
              <Text style={styles.emptySubtitle}>
                Add family members to share your documents
              </Text>
            </View>
          ) : (
            members.map((member) => (
              <TouchableOpacity 
                key={member.id} 
                style={styles.card}
                onPress={() => viewMemberCards(member)}
              >
                <LinearGradient
                  colors={['rgba(139, 92, 246, 0.3)', 'rgba(99, 102, 241, 0.2)']}
                  style={styles.iconContainer}
                >
                  <Ionicons name="person" size={28} color="#fff" />
                </LinearGradient>
                <View style={styles.cardContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.memberName}>
                      {member.nickname || member.family_email}
                    </Text>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation()
                        handleEditNickname(member)
                      }}
                      style={styles.editNicknameButton}
                    >
                      <Ionicons name="create-outline" size={18} color="#a78bfa" />
                    </TouchableOpacity>
                  </View>
                  {member.nickname && (
                    <Text style={styles.memberEmail}>{member.family_email}</Text>
                  )}
                  <Text style={styles.memberRole}>Family Member</Text>
                </View>
                <TouchableOpacity 
                  onPress={(e) => {
                    e.stopPropagation()
                    handleRemoveMember(member)
                  }}
                  style={styles.removeButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ef4444" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <LinearGradient
              colors={['#8b5cf6', '#7c3aed']}
              style={styles.addButtonGradient}
            >
              <Ionicons name="add-outline" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Family Member</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        {/* Edit Nickname Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={editNicknameModalVisible}
          onRequestClose={() => !updatingNickname && setEditNicknameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1e1b4b', '#1a1537']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Edit Nickname</Text>
                    <Text style={styles.modalSubtitle}>Give a friendly name</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setEditNicknameModalVisible(false)}
                    style={styles.closeButton}
                    disabled={updatingNickname}
                  >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="person" size={14} color="#a78bfa" /> Nickname
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter nickname (e.g., Zoro, Mom, Dad)"
                    placeholderTextColor="#64748B"
                    value={nicknameInput}
                    onChangeText={setNicknameInput}
                    editable={!updatingNickname}
                  />
                  {selectedMember && (
                    <Text style={styles.emailHint}>
                      Email: {selectedMember.family_email}
                    </Text>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.modalAddButton} 
                  onPress={handleUpdateNickname}
                  disabled={updatingNickname}
                >
                  <LinearGradient
                    colors={updatingNickname ? ['#64748b', '#475569'] : ['#8b5cf6', '#7c3aed']}
                    style={styles.modalAddGradient}
                  >
                    {updatingNickname ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    )}
                    <Text style={styles.modalAddText}>
                      {updatingNickname ? 'Saving...' : 'Save Nickname'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Add Member Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={addModalVisible}
          onRequestClose={() => !adding && setAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <LinearGradient
                colors={['#1e1b4b', '#1a1537']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <View>
                    <Text style={styles.modalTitle}>Add Family Member</Text>
                    <Text style={styles.modalSubtitle}>Enter their share code</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setAddModalVisible(false)}
                    style={styles.closeButton}
                    disabled={adding}
                  >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>
                    <Ionicons name="key" size={14} color="#a78bfa" /> Share Code
                  </Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Enter 6-character code"
                    placeholderTextColor="#64748B"
                    value={inputShareCode}
                    onChangeText={(text) => setInputShareCode(text.toUpperCase())}
                    maxLength={6}
                    autoCapitalize="characters"
                    editable={!adding}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.modalAddButton} 
                  onPress={handleAddMember}
                  disabled={adding}
                >
                  <LinearGradient
                    colors={adding ? ['#64748b', '#475569'] : ['#8b5cf6', '#7c3aed']}
                    style={styles.modalAddGradient}
                  >
                    {adding ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Ionicons name="person-add" size={20} color="#fff" />
                    )}
                    <Text style={styles.modalAddText}>
                      {adding ? 'Adding...' : 'Add Member'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* My Share Code Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={shareCodeModalVisible}
          onRequestClose={() => setShareCodeModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.shareCodeModalContent}>
              <LinearGradient
                colors={['#1e1b4b', '#1a1537']}
                style={styles.shareCodeModalGradient}
              >
                <TouchableOpacity 
                  onPress={() => setShareCodeModalVisible(false)}
                  style={styles.closeButtonTop}
                >
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>

                <View style={styles.shareCodeDisplay}>
                  <Ionicons name="key" size={48} color="#a78bfa" />
                  <Text style={styles.shareCodeDisplayTitle}>Your Share Code</Text>
                  <View style={styles.shareCodeBox}>
                    <Text style={styles.shareCodeBoxText}>{myShareCode}</Text>
                  </View>
                  <Text style={styles.shareCodeHint}>
                    Share this code with family members so they can access your documents
                  </Text>
                  <TouchableOpacity style={styles.shareCodeShareButton} onPress={handleShareCode}>
                    <LinearGradient
                      colors={['#8b5cf6', '#7c3aed']}
                      style={styles.shareCodeShareGradient}
                    >
                      <Ionicons name="share-social" size={20} color="#fff" />
                      <Text style={styles.shareCodeShareText}>Share Code</Text>
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
    padding: 20, 
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerText: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 4 
  },
  subHeaderText: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500'
  },
  shareCodeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  shareCodeCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  shareCodeGradient: {
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shareCodeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  shareCodeInfo: {
    flex: 1,
  },
  shareCodeLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
    marginBottom: 4,
  },
  shareCodeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#a78bfa',
    letterSpacing: 2,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  shareButtonText: {
    color: '#a78bfa',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollView: { 
    flex: 1, 
    paddingHorizontal: 20 
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
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.2)',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  memberName: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#fff', 
    flex: 1,
  },
  editNicknameButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
  },
  memberEmail: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '500',
    marginBottom: 4,
  },
  memberRole: { 
    fontSize: 13, 
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500'
  },
  removeButton: {
    padding: 8,
  },
  addButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 20,
    marginTop: 8,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  addButtonText: { 
    fontSize: 16, 
    color: '#fff', 
    fontWeight: '700' 
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
  closeButton: {
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
  emailHint: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 8,
    fontWeight: '500',
  },
  modalAddButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalAddGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  modalAddText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  shareCodeModalContent: {
    margin: 20,
    borderRadius: 32,
    overflow: 'hidden',
  },
  shareCodeModalGradient: {
    padding: 32,
  },
  closeButtonTop: {
    alignSelf: 'flex-end',
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  shareCodeDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  shareCodeDisplayTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 16,
    marginBottom: 24,
  },
  shareCodeBox: {
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderWidth: 2,
    borderColor: '#a78bfa',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  shareCodeBoxText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#a78bfa',
    letterSpacing: 4,
  },
  shareCodeHint: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  shareCodeShareButton: {
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
  },
  shareCodeShareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 8,
  },
  shareCodeShareText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
})