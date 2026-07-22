import { useEffect } from 'react'
import {
  AI_DIFFICULTIES,
  HINT_MODES,
  STAGE_ORDER,
  STAGE_TIMERS,
  TIMER_MODES,
  TOPIC_SELECTION_MODES,
  WORD_SOURCES,
} from '../config/gameOptions'
import { CATEGORY_CATALOG } from '../data/categories'
import { supabase } from '../supabaseClient'
import { extractPlayerNames } from '../utils/gameLogic'

export default function useRoomSync({
  roomCode,
  isLocalMode,
  lobbyMode,
  gameStageRef,
  resetOnlineSession,
  setOnlinePlayers,
  setPlayerRoles,
  setVotes,
  setSelectedCategoryId,
  setSelectedSubcategoryId,
  setTopicSelectionMode,
  setCustomCategory,
  setCustomTopic,
  setSelectedWordSource,
  setSelectedDifficulty,
  setSelectedHintMode,
  setSelectedCategoryDisplayMode,
  setSelectedTimerMode,
  setTimer,
  setPhaseEndsAt,
  setHasVoted,
  setStage,
  setSyncStatus,
}) {
  useEffect(() => {
    if (!roomCode || isLocalMode) return undefined

    let active = true
    let realtimeConnected = false
    let pollInterval = null
    const channelName = `room-sync:${roomCode}`

    const handleRoomClosed = () => {
      if (!active) return

      active = false
      if (lobbyMode === 'JOIN') alert('The host closed this room.')
      resetOnlineSession()
    }

    const applyRoomSnapshot = (
      roomRow,
      source = 'poll',
      cloudStageChanged = false
    ) => {
      if (!active || !roomRow) return

      setOnlinePlayers(extractPlayerNames(roomRow.players))

      if (roomRow.player_roles && Array.isArray(roomRow.player_roles)) {
        setPlayerRoles(roomRow.player_roles)
      }

      if (roomRow.votes) {
        setVotes(roomRow.votes)
      }

      // Guests consume the host's settings. The host keeps its local form state
      // so a two-second poll cannot erase text while they type a custom topic.
      if (lobbyMode === 'JOIN') {
        const roomCategory = CATEGORY_CATALOG.find(
          (category) => category.id === roomRow.selected_category
        )
        const roomSubcategory = roomCategory?.subcategories.find(
          (subcategory) => subcategory.id === roomRow.selected_subcategory
        )

        if (roomCategory && roomSubcategory) {
          setSelectedCategoryId(roomCategory.id)
          setSelectedSubcategoryId(roomSubcategory.id)
        }

        if (TOPIC_SELECTION_MODES.some((option) => option.id === roomRow.selection_mode)) {
          setTopicSelectionMode(roomRow.selection_mode)
        }

        if (typeof roomRow.custom_category === 'string') {
          setCustomCategory(roomRow.custom_category)
        }

        if (typeof roomRow.custom_topic === 'string') {
          setCustomTopic(roomRow.custom_topic)
        }

        if (WORD_SOURCES.some((option) => option.id === roomRow.word_source)) {
          setSelectedWordSource(roomRow.word_source)
        }

        if (AI_DIFFICULTIES.some((option) => option.id === roomRow.ai_difficulty)) {
          setSelectedDifficulty(roomRow.ai_difficulty)
        }

        if (HINT_MODES.some((option) => option.id === roomRow.hint_mode)) {
          setSelectedHintMode(roomRow.hint_mode)
        }

        if (typeof roomRow.show_category === 'boolean') {
          setSelectedCategoryDisplayMode(roomRow.show_category ? 'show' : 'hide')
        }

        if (TIMER_MODES.some((option) => option.id === roomRow.timer_mode)) {
          setSelectedTimerMode(roomRow.timer_mode)
        }
      }

      const incomingStage = roomRow.game_stage
      if (!incomingStage || STAGE_ORDER[incomingStage] === undefined) return

      const currentStage = gameStageRef.current
      const isSameStage = incomingStage === currentStage
      const isForwardStage = (
        STAGE_ORDER[incomingStage] > STAGE_ORDER[currentStage]
      )

      // Only a realtime LOBBY event may intentionally reset an active game.
      // This prevents a delayed poll from dragging guests backward.
      const isLobbyReset = incomingStage === 'LOBBY' && source === 'realtime'

      if (isForwardStage || isLobbyReset) {
        setPhaseEndsAt(roomRow.phase_ends_at || null)

        // Set the timer before routing so guests enter VOTING at exactly 20.
        if (STAGE_TIMERS[incomingStage] !== undefined) {
          setTimer(STAGE_TIMERS[incomingStage])
        }

        if (incomingStage === 'VOTING' || incomingStage === 'LOBBY') {
          setHasVoted(false)
        }

        setStage(incomingStage)
      } else if (isSameStage) {
        setPhaseEndsAt(roomRow.phase_ends_at || null)

        if (
          cloudStageChanged
          && incomingStage === 'VOTING'
          && lobbyMode === 'JOIN'
        ) {
          // A poll may see VOTING first. The realtime transition still applies
          // the exact guest timer reset when its event arrives.
          setTimer(STAGE_TIMERS.VOTING)
        }
      }
    }

    const fetchRoomSnapshot = async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode)
        .single()

      if (!active) return

      if (error) {
        if (error.code === 'PGRST116') handleRoomClosed()
        else setSyncStatus('error')
        return
      }

      applyRoomSnapshot(data, 'poll')
      if (!realtimeConnected) setSyncStatus('polling')
    }

    fetchRoomSnapshot()
    pollInterval = setInterval(fetchRoomSnapshot, 2000)

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            handleRoomClosed()
            return
          }

          realtimeConnected = true
          setSyncStatus('live')
          applyRoomSnapshot(
            payload.new,
            'realtime',
            payload.old?.game_stage !== undefined
              && payload.old.game_stage !== payload.new?.game_stage
          )
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeConnected = true
          setSyncStatus('live')
          fetchRoomSnapshot()
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setSyncStatus('polling')
        }
      })

    return () => {
      active = false
      if (pollInterval) clearInterval(pollInterval)
      supabase.removeChannel(channel)
      setSyncStatus('idle')
    }
  }, [
    roomCode,
    isLocalMode,
    lobbyMode,
    gameStageRef,
    resetOnlineSession,
    setOnlinePlayers,
    setPlayerRoles,
    setVotes,
    setSelectedCategoryId,
    setSelectedSubcategoryId,
    setTopicSelectionMode,
    setCustomCategory,
    setCustomTopic,
    setSelectedWordSource,
    setSelectedDifficulty,
    setSelectedHintMode,
    setSelectedCategoryDisplayMode,
    setSelectedTimerMode,
    setTimer,
    setPhaseEndsAt,
    setHasVoted,
    setStage,
    setSyncStatus,
  ])
}
