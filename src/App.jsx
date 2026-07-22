import { useCallback, useRef, useState } from 'react'
import {
  AI_DIFFICULTIES,
  CATEGORY_DISPLAY_MODES,
  DEFAULT_CATEGORY_DISPLAY_MODE,
  DEFAULT_AI_DIFFICULTY,
  DEFAULT_HINT_MODE,
  DEFAULT_TOPIC_SELECTION_MODE,
  DEFAULT_TIMER_MODE,
  DEFAULT_WORD_SOURCE,
  HINT_MODES,
  STAGE_TIMERS,
  TIMER_MODES,
  TOPIC_SELECTION_MODES,
  WORD_SOURCES,
} from './config/gameOptions'
import {
  DEFAULT_CATEGORY_ID,
  DEFAULT_SUBCATEGORY_ID,
  getCategory,
  getRandomCategorySelection,
  getRandomWordPair,
  getSubcategory,
} from './data/categories'
import useHostTimer from './hooks/useHostTimer'
import useRoomSync from './hooks/useRoomSync'
import DiscussionScreen from './screens/DiscussionScreen'
import LobbyScreen from './screens/LobbyScreen'
import ResultsScreen from './screens/ResultsScreen'
import RevealScreen from './screens/RevealScreen'
import VotingScreen from './screens/VotingScreen'
import { generateAiWordPair } from './services/wordGeneration'
import { supabase } from './supabaseClient'
import { assignPlayerRoles, extractPlayerNames } from './utils/gameLogic'

export default function App() {
  // Shared round state
  const [gameStage, setGameStage] = useState('LOBBY')
  const gameStageRef = useRef(gameStage)
  const [playerRoles, setPlayerRoles] = useState([])
  const [isLocalMode, setIsLocalMode] = useState(true)
  const [isHolding, setIsHolding] = useState(false)
  const [timer, setTimer] = useState(STAGE_TIMERS.DISCUSSION)
  const [phaseEndsAt, setPhaseEndsAt] = useState(null)
  const [votes, setVotes] = useState({})
  const [hasVoted, setHasVoted] = useState(false)

  // Game settings
  const [selectedCategoryId, setSelectedCategoryId] = useState(DEFAULT_CATEGORY_ID)
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(DEFAULT_SUBCATEGORY_ID)
  const [topicSelectionMode, setTopicSelectionMode] = useState(DEFAULT_TOPIC_SELECTION_MODE)
  const [customCategory, setCustomCategory] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [selectedWordSource, setSelectedWordSource] = useState(DEFAULT_WORD_SOURCE)
  const [selectedDifficulty, setSelectedDifficulty] = useState(DEFAULT_AI_DIFFICULTY)
  const [selectedHintMode, setSelectedHintMode] = useState(DEFAULT_HINT_MODE)
  const [selectedCategoryDisplayMode, setSelectedCategoryDisplayMode] = useState(DEFAULT_CATEGORY_DISPLAY_MODE)
  const [selectedTimerMode, setSelectedTimerMode] = useState(DEFAULT_TIMER_MODE)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isGeneratingWordPair, setIsGeneratingWordPair] = useState(false)
  const aiFallbackNoticeShownRef = useRef(false)

  // Pass & Play state
  const [localPlayers, setLocalPlayers] = useState([])
  const [localNameInput, setLocalNameInput] = useState('')
  const [revealIndex, setRevealIndex] = useState(0)
  const [isLocalImposterRevealed, setIsLocalImposterRevealed] = useState(false)

  // Online room state
  const [lobbyMode, setLobbyMode] = useState('CHOOSE')
  const [onlinePlayers, setOnlinePlayers] = useState([])
  const [onlineNickname, setOnlineNickname] = useState('')
  const [onlinePlayerId, setOnlinePlayerId] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [joinCodeInput, setJoinCodeInput] = useState('')
  const [syncStatus, setSyncStatus] = useState('idle')

  const setStage = useCallback((nextStage) => {
    gameStageRef.current = nextStage
    setGameStage(nextStage)
  }, [])

  const resetOnlineSession = useCallback(() => {
    setRoomCode('')
    setJoinCodeInput('')
    setOnlinePlayerId('')
    setOnlinePlayers([])
    setPlayerRoles([])
    setVotes({})
    setHasVoted(false)
    setTimer(STAGE_TIMERS.DISCUSSION)
    setPhaseEndsAt(null)
    setSyncStatus('idle')
    setIsLocalMode(false)
    setLobbyMode('ONLINE')
    setStage('LOBBY')
  }, [setStage])

  const publishOnlineStage = useCallback(async (nextStage) => {
    if (isLocalMode || !roomCode) return true

    const nextPhaseEndsAt = (
      selectedTimerMode === 'timed' && STAGE_TIMERS[nextStage] !== undefined
        ? new Date(Date.now() + STAGE_TIMERS[nextStage] * 1000).toISOString()
        : null
    )

    const { data, error } = await supabase
      .from('rooms')
      .update({
        game_stage: nextStage,
        phase_ends_at: nextPhaseEndsAt,
      })
      .eq('room_code', roomCode)
      .select('game_stage')
      .single()

    if (error || data?.game_stage !== nextStage) {
      console.error(`Could not publish ${nextStage} stage:`, error)
      setSyncStatus('error')
      return false
    }

    setPhaseEndsAt(nextPhaseEndsAt)
    return true
  }, [isLocalMode, roomCode, selectedTimerMode])

  useHostTimer({
    gameStage,
    timer,
    setTimer,
    phaseEndsAt,
    setPhaseEndsAt,
    isLocalMode,
    lobbyMode,
    selectedTimerMode,
    publishOnlineStage,
    setIsLocalImposterRevealed,
    setStage,
  })

  useRoomSync({
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
  })

  const handleAddLocalPlayer = (event) => {
    event.preventDefault()
    const playerName = localNameInput.trim()
    if (!playerName) return

    setLocalPlayers((currentPlayers) => [...currentPlayers, playerName])
    setLocalNameInput('')
  }

  const resolveRoundSelection = () => {
    if (topicSelectionMode === 'random') {
      const { category, subcategory } = getRandomCategorySelection()
      return {
        categoryId: category.id,
        subcategoryId: subcategory.id,
        categoryName: category.name,
        topicName: subcategory.name,
        historyKey: `${category.id}:${subcategory.id}`,
      }
    }

    if (topicSelectionMode === 'custom') {
      const categoryName = customCategory.trim()
      const topicName = customTopic.trim()

      if (!categoryName || !topicName) {
        throw new Error('Add both a custom category and topic before starting.')
      }

      return {
        categoryId: null,
        subcategoryId: null,
        categoryName,
        topicName,
        historyKey: `custom:${categoryName}:${topicName}`.toLowerCase(),
      }
    }

    const category = getCategory(selectedCategoryId)
    const subcategory = getSubcategory(selectedCategoryId, selectedSubcategoryId)
    return {
      categoryId: category.id,
      subcategoryId: subcategory.id,
      categoryName: category.name,
      topicName: subcategory.name,
      historyKey: `${category.id}:${subcategory.id}`,
    }
  }

  const getRoundWordPair = async () => {
    const roundSelection = resolveRoundSelection()

    if (topicSelectionMode === 'custom' && selectedWordSource !== 'ai') {
      throw new Error('Custom topics require AI Generated as the word source.')
    }

    if (selectedWordSource === 'built-in') {
      const wordPair = getRandomWordPair(
        roundSelection.categoryId,
        roundSelection.subcategoryId
      )
      return { ...wordPair, categoryName: roundSelection.categoryName }
    }

    try {
      const wordPair = await generateAiWordPair({
        categoryName: roundSelection.categoryName,
        topicName: roundSelection.topicName,
        difficulty: selectedDifficulty,
        historyKey: roundSelection.historyKey,
      })
      return { ...wordPair, categoryName: roundSelection.categoryName }
    } catch (error) {
      if (topicSelectionMode === 'custom') {
        alert(
          'Gemini could not create this custom round. Check the topic or try again in a moment.'
        )
        throw error
      }

      console.warn(
        'Gemini word generation failed. Using a built-in backup pair for this round.',
        error
      )

      if (!aiFallbackNoticeShownRef.current) {
        aiFallbackNoticeShownRef.current = true
        alert(
          'Gemini is not connected or is temporarily unavailable, so this round will use a backup word pair.'
        )
      }

      const wordPair = getRandomWordPair(
        roundSelection.categoryId,
        roundSelection.subcategoryId
      )
      return { ...wordPair, categoryName: roundSelection.categoryName }
    }
  }

  const handleStartLocalGame = async () => {
    if (localPlayers.length < 3 || isGeneratingWordPair) return

    setIsGeneratingWordPair(true)

    try {
      const wordPair = await getRoundWordPair()
      const roles = assignPlayerRoles(localPlayers, wordPair, {
        showHint: selectedHintMode === 'hint',
        category: selectedCategoryDisplayMode === 'show'
          ? wordPair.categoryName
          : '',
      })

      setIsLocalMode(true)
      setPlayerRoles(roles)
      setRevealIndex(0)
      setVotes({})
      setHasVoted(false)
      setIsLocalImposterRevealed(false)
      setTimer(STAGE_TIMERS.DISCUSSION)
      setPhaseEndsAt(null)
      setStage('REVEAL')
    } catch (error) {
      console.error('Could not start local round:', error)
    } finally {
      setIsGeneratingWordPair(false)
    }
  }

  const createOnlineRoom = async () => {
    const nickname = onlineNickname.trim()
    if (!nickname) {
      alert('Enter a nickname for online play!')
      return
    }

    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase()
    const hostPlayer = {
      name: nickname,
      id: crypto.randomUUID(),
      isHost: true,
    }

    const { error } = await supabase.from('rooms').insert([{
      room_code: randomCode,
      host_id: hostPlayer.id,
      game_stage: 'LOBBY',
      players: [hostPlayer],
      votes: {},
      selected_category: selectedCategoryId,
      selected_subcategory: selectedSubcategoryId,
      selection_mode: topicSelectionMode,
      custom_category: customCategory.trim(),
      custom_topic: customTopic.trim(),
      word_source: selectedWordSource,
      ai_difficulty: selectedDifficulty,
      hint_mode: selectedHintMode,
      show_category: selectedCategoryDisplayMode === 'show',
      timer_mode: selectedTimerMode,
      phase_ends_at: null,
    }])

    if (error) {
      alert('Failed to connect to backend server.')
      return
    }

    setRoomCode(randomCode)
    setOnlinePlayerId(hostPlayer.id)
    setOnlinePlayers([nickname])
    setIsLocalMode(false)
    setLobbyMode('HOST')
  }

  const joinOnlineRoom = async (event) => {
    event.preventDefault()

    const nickname = onlineNickname.trim()
    const cleanCode = joinCodeInput.trim().toUpperCase()

    if (!nickname || !cleanCode) {
      alert('Enter nickname and 4-letter code!')
      return
    }

    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_code', cleanCode)
      .single()

    if (error || !room) {
      alert('Room not found!')
      return
    }

    const existingPlayers = Array.isArray(room.players) ? room.players : []
    const newPlayer = {
      name: nickname,
      id: crypto.randomUUID(),
      isHost: false,
    }
    const updatedPlayers = [...existingPlayers, newPlayer]

    const { error: updateError } = await supabase
      .from('rooms')
      .update({ players: updatedPlayers })
      .eq('room_code', cleanCode)

    if (updateError) {
      alert('Failed to join.')
      return
    }

    setRoomCode(cleanCode)
    setOnlinePlayerId(newPlayer.id)
    setOnlinePlayers(extractPlayerNames(updatedPlayers))

    if (TIMER_MODES.some((option) => option.id === room.timer_mode)) {
      setSelectedTimerMode(room.timer_mode)
    }

    if (TOPIC_SELECTION_MODES.some((option) => option.id === room.selection_mode)) {
      setTopicSelectionMode(room.selection_mode)
    }
    if (typeof room.custom_category === 'string') setCustomCategory(room.custom_category)
    if (typeof room.custom_topic === 'string') setCustomTopic(room.custom_topic)
    if (WORD_SOURCES.some((option) => option.id === room.word_source)) {
      setSelectedWordSource(room.word_source)
    }
    if (AI_DIFFICULTIES.some((option) => option.id === room.ai_difficulty)) {
      setSelectedDifficulty(room.ai_difficulty)
    }
    if (HINT_MODES.some((option) => option.id === room.hint_mode)) {
      setSelectedHintMode(room.hint_mode)
    }
    if (typeof room.show_category === 'boolean') {
      setSelectedCategoryDisplayMode(room.show_category ? 'show' : 'hide')
    }

    setIsLocalMode(false)
    setLobbyMode('JOIN')
  }

  const handleStartOnlineGame = async () => {
    if (
      onlinePlayers.length < 3
      || lobbyMode !== 'HOST'
      || isGeneratingWordPair
    ) {
      return
    }

    setIsGeneratingWordPair(true)

    try {
      // The host creates one word pair and publishes the finished role list.
      // Guests only consume the result through room synchronization.
      const wordPair = await getRoundWordPair()
      const roles = assignPlayerRoles(onlinePlayers, wordPair, {
        showHint: selectedHintMode === 'hint',
        category: selectedCategoryDisplayMode === 'show'
          ? wordPair.categoryName
          : '',
      })

      const { error } = await supabase
        .from('rooms')
        .update({
          game_stage: 'REVEAL',
          player_roles: roles,
          votes: {},
          timer_mode: selectedTimerMode,
          selection_mode: topicSelectionMode,
          custom_category: customCategory.trim(),
          custom_topic: customTopic.trim(),
          word_source: selectedWordSource,
          ai_difficulty: selectedDifficulty,
          hint_mode: selectedHintMode,
          show_category: selectedCategoryDisplayMode === 'show',
          phase_ends_at: null,
        })
        .eq('room_code', roomCode)

      if (error) {
        console.error('Cloud start error:', error)
        alert('The round could not be started. Please try again.')
        return
      }

      setPlayerRoles(roles)
      setVotes({})
      setHasVoted(false)
      setTimer(STAGE_TIMERS.DISCUSSION)
      setPhaseEndsAt(null)
      setStage('REVEAL')
    } catch (error) {
      console.error('Could not start online round:', error)
    } finally {
      setIsGeneratingWordPair(false)
    }
  }

  const handleCategoryChange = async (nextCategoryId) => {
    const nextCategory = getCategory(nextCategoryId)
    const nextSubcategoryId = nextCategory.subcategories[0].id

    setSelectedCategoryId(nextCategory.id)
    setSelectedSubcategoryId(nextSubcategoryId)

    if (!isLocalMode && lobbyMode === 'HOST' && roomCode) {
      const { error } = await supabase
        .from('rooms')
        .update({
          selected_category: nextCategory.id,
          selected_subcategory: nextSubcategoryId,
        })
        .eq('room_code', roomCode)

      if (error) console.error('Could not sync category selection:', error)
    }
  }

  const handleSubcategoryChange = async (nextSubcategoryId) => {
    const nextSubcategory = getSubcategory(
      selectedCategoryId,
      nextSubcategoryId
    )

    setSelectedSubcategoryId(nextSubcategory.id)

    if (!isLocalMode && lobbyMode === 'HOST' && roomCode) {
      const { error } = await supabase
        .from('rooms')
        .update({ selected_subcategory: nextSubcategory.id })
        .eq('room_code', roomCode)

      if (error) console.error('Could not sync subcategory selection:', error)
    }
  }

  const handleDifficultyChange = (nextDifficulty) => {
    if (AI_DIFFICULTIES.some((option) => option.id === nextDifficulty)) {
      setSelectedDifficulty(nextDifficulty)
    }
  }

  const handleWordSourceChange = (nextWordSource) => {
    if (topicSelectionMode === 'custom' && nextWordSource === 'built-in') return

    if (WORD_SOURCES.some((option) => option.id === nextWordSource)) {
      setSelectedWordSource(nextWordSource)
    }
  }

  const handleTopicSelectionModeChange = (nextMode) => {
    if (!TOPIC_SELECTION_MODES.some((option) => option.id === nextMode)) return

    setTopicSelectionMode(nextMode)
    if (nextMode === 'custom') setSelectedWordSource('ai')
  }

  const handleHintModeChange = (nextHintMode) => {
    if (HINT_MODES.some((option) => option.id === nextHintMode)) {
      setSelectedHintMode(nextHintMode)
    }
  }

  const handleCategoryDisplayModeChange = (nextMode) => {
    if (CATEGORY_DISPLAY_MODES.some((option) => option.id === nextMode)) {
      setSelectedCategoryDisplayMode(nextMode)
    }
  }

  const handleSaveSettings = async () => {
    if (topicSelectionMode === 'custom' && (!customCategory.trim() || !customTopic.trim())) {
      alert('Add both a custom category name and a fandom or topic.')
      return
    }

    if (!isLocalMode && lobbyMode === 'HOST' && roomCode) {
      const { error } = await supabase
        .from('rooms')
        .update({
          selected_category: selectedCategoryId,
          selected_subcategory: selectedSubcategoryId,
          selection_mode: topicSelectionMode,
          custom_category: customCategory.trim(),
          custom_topic: customTopic.trim(),
          word_source: selectedWordSource,
          ai_difficulty: selectedDifficulty,
          hint_mode: selectedHintMode,
          show_category: selectedCategoryDisplayMode === 'show',
          timer_mode: selectedTimerMode,
        })
        .eq('room_code', roomCode)

      if (error) {
        console.error('Could not save online game settings:', error)
        alert('The settings could not be saved. Please try again.')
        return
      }
    }

    setIsSettingsOpen(false)
  }

  const handleTimerModeChange = async (nextTimerMode) => {
    if (!TIMER_MODES.some((option) => option.id === nextTimerMode)) return

    setSelectedTimerMode(nextTimerMode)

    if (!isLocalMode && lobbyMode === 'HOST' && roomCode) {
      const { error } = await supabase
        .from('rooms')
        .update({ timer_mode: nextTimerMode })
        .eq('room_code', roomCode)

      if (error) console.error('Could not sync timer mode:', error)
    }
  }

  const handleLocalRevealComplete = () => {
    setTimer(STAGE_TIMERS.DISCUSSION)
    setPhaseEndsAt(
      selectedTimerMode === 'timed'
        ? new Date(Date.now() + STAGE_TIMERS.DISCUSSION * 1000).toISOString()
        : null
    )
    setStage('DISCUSSION')
  }

  const handleBeginOnlineDiscussion = async () => {
    if (lobbyMode !== 'HOST') return

    const discussionEndsAt = (
      selectedTimerMode === 'timed'
        ? new Date(Date.now() + STAGE_TIMERS.DISCUSSION * 1000).toISOString()
        : null
    )

    const { error } = await supabase
      .from('rooms')
      .update({
        game_stage: 'DISCUSSION',
        phase_ends_at: discussionEndsAt,
      })
      .eq('room_code', roomCode)

    if (error) {
      console.error('Could not begin online discussion:', error)
      setSyncStatus('error')
      return
    }

    setTimer(STAGE_TIMERS.DISCUSSION)
    setPhaseEndsAt(discussionEndsAt)
    setStage('DISCUSSION')
  }

  const handleManualDiscussionEnd = async () => {
    if (selectedTimerMode !== 'untimed') return

    if (isLocalMode) {
      setIsLocalImposterRevealed(false)
      setPhaseEndsAt(null)
      setStage('RESULTS')
      return
    }

    if (lobbyMode !== 'HOST') return

    const published = await publishOnlineStage('VOTING')
    if (!published) return

    setHasVoted(false)
    setStage('VOTING')
  }

  const handleManualOnlineResults = async () => {
    if (
      isLocalMode
      || lobbyMode !== 'HOST'
      || selectedTimerMode !== 'untimed'
    ) {
      return
    }

    const published = await publishOnlineStage('RESULTS')
    if (published) setStage('RESULTS')
  }

  const handleCastVote = async (targetName) => {
    if (hasVoted) return

    setHasVoted(true)

    if (!isLocalMode && roomCode) {
      const { data: updatedVotes, error } = await supabase.rpc(
        'cast_room_vote',
        {
          p_room_code: roomCode,
          p_target_name: targetName,
        }
      )

      if (error) {
        setHasVoted(false)
        console.error('Vote sync error:', error)
        alert('Your vote could not be saved. Please try again.')
        return
      }

      setVotes(updatedVotes || {})
      return
    }

    setVotes((currentVotes) => ({
      ...currentVotes,
      [targetName]: (currentVotes[targetName] || 0) + 1,
    }))
  }

  const handleResetGame = async () => {
    if (isLocalMode) {
      setPlayerRoles([])
      setVotes({})
      setHasVoted(false)
      setIsLocalImposterRevealed(false)
      setTimer(STAGE_TIMERS.DISCUSSION)
      setPhaseEndsAt(null)
      setRevealIndex(0)
      setStage('LOBBY')
      return
    }

    // Only the host resets an online room. Room membership and settings stay.
    if (lobbyMode !== 'HOST' || !roomCode) return

    const { error } = await supabase
      .from('rooms')
      .update({
        votes: {},
        player_roles: [],
        game_stage: 'LOBBY',
        phase_ends_at: null,
      })
      .eq('room_code', roomCode)

    if (error) {
      console.error('Could not reset online room:', error)
      alert('The room could not be reset. Please try again.')
      return
    }

    setPlayerRoles([])
    setVotes({})
    setHasVoted(false)
    setTimer(STAGE_TIMERS.DISCUSSION)
    setPhaseEndsAt(null)
    setStage('LOBBY')
  }

  const handleLeaveOnlineRoom = async () => {
    if (isLocalMode || !roomCode) return

    if (lobbyMode === 'HOST') {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('room_code', roomCode)

      if (error) {
        console.error('Could not close online room:', error)
        alert('The room could not be closed. Please try again.')
        return
      }
    } else {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('players')
        .eq('room_code', roomCode)
        .single()

      if (!roomError && room) {
        const currentPlayers = Array.isArray(room.players) ? room.players : []
        const remainingPlayers = currentPlayers.filter((player) => {
          if (typeof player === 'string') {
            return player !== onlineNickname.trim()
          }

          return player?.id !== onlinePlayerId
        })

        const { error: updateError } = await supabase
          .from('rooms')
          .update({ players: remainingPlayers })
          .eq('room_code', roomCode)

        if (updateError) {
          console.error('Could not remove guest from room:', updateError)
        }
      }
    }

    resetOnlineSession()
  }

  const selectedCategory = getCategory(selectedCategoryId)
  const selectedSubcategory = getSubcategory(
    selectedCategoryId,
    selectedSubcategoryId
  )
  const selectedTimerModeDetails = (
    TIMER_MODES.find((option) => option.id === selectedTimerMode)
    || TIMER_MODES[0]
  )
  const selectedHintModeDetails = (
    HINT_MODES.find((option) => option.id === selectedHintMode)
    || HINT_MODES[0]
  )
  const gameSelectionSummary = topicSelectionMode === 'random'
    ? 'Random category & topic'
    : topicSelectionMode === 'custom'
      ? `${customCategory.trim() || 'Custom category'} / ${customTopic.trim() || 'Add a topic'}`
      : `${selectedCategory.name} / ${selectedSubcategory.name}`
  const areGameSettingsValid = (
    topicSelectionMode !== 'custom'
    || Boolean(customCategory.trim() && customTopic.trim())
  )
  const categorySelectorProps = {
    categoryId: selectedCategoryId,
    subcategoryId: selectedSubcategoryId,
    selectionMode: topicSelectionMode,
    customCategory,
    customTopic,
    wordSource: selectedWordSource,
    difficulty: selectedDifficulty,
    hintMode: selectedHintMode,
    categoryDisplayMode: selectedCategoryDisplayMode,
    timerMode: selectedTimerMode,
    onCategoryChange: handleCategoryChange,
    onSubcategoryChange: handleSubcategoryChange,
    onSelectionModeChange: handleTopicSelectionModeChange,
    onCustomCategoryChange: setCustomCategory,
    onCustomTopicChange: setCustomTopic,
    onWordSourceChange: handleWordSourceChange,
    onDifficultyChange: handleDifficultyChange,
    onHintModeChange: handleHintModeChange,
    onCategoryDisplayModeChange: handleCategoryDisplayModeChange,
    onTimerModeChange: handleTimerModeChange,
  }

  if (gameStage === 'LOBBY') {
    return (
      <LobbyScreen
        lobbyMode={lobbyMode}
        setLobbyMode={setLobbyMode}
        setIsLocalMode={setIsLocalMode}
        localPlayers={localPlayers}
        localNameInput={localNameInput}
        setLocalNameInput={setLocalNameInput}
        onAddLocalPlayer={handleAddLocalPlayer}
        gameSelectionSummary={gameSelectionSummary}
        selectedTimerModeDetails={selectedTimerModeDetails}
        selectedHintModeDetails={selectedHintModeDetails}
        categoryDisplayMode={selectedCategoryDisplayMode}
        areGameSettingsValid={areGameSettingsValid}
        isSettingsOpen={isSettingsOpen}
        setIsSettingsOpen={setIsSettingsOpen}
        onSaveSettings={handleSaveSettings}
        categorySelectorProps={categorySelectorProps}
        isGeneratingWordPair={isGeneratingWordPair}
        selectedWordSource={selectedWordSource}
        onStartLocalGame={handleStartLocalGame}
        onlineNickname={onlineNickname}
        setOnlineNickname={setOnlineNickname}
        onCreateOnlineRoom={createOnlineRoom}
        joinCodeInput={joinCodeInput}
        setJoinCodeInput={setJoinCodeInput}
        onJoinOnlineRoom={joinOnlineRoom}
        roomCode={roomCode}
        syncStatus={syncStatus}
        onlinePlayers={onlinePlayers}
        onStartOnlineGame={handleStartOnlineGame}
        onLeaveRoom={handleLeaveOnlineRoom}
      />
    )
  }

  if (gameStage === 'REVEAL') {
    return (
      <RevealScreen
        isLocalMode={isLocalMode}
        playerRoles={playerRoles}
        revealIndex={revealIndex}
        setRevealIndex={setRevealIndex}
        isHolding={isHolding}
        setIsHolding={setIsHolding}
        onLocalRevealComplete={handleLocalRevealComplete}
        onlineNickname={onlineNickname}
        lobbyMode={lobbyMode}
        onlinePlayers={onlinePlayers}
        onBeginOnlineDiscussion={handleBeginOnlineDiscussion}
      />
    )
  }

  if (gameStage === 'DISCUSSION') {
    return (
      <DiscussionScreen
        timerMode={selectedTimerMode}
        timer={timer}
        isLocalMode={isLocalMode}
        lobbyMode={lobbyMode}
        onManualEnd={handleManualDiscussionEnd}
      />
    )
  }

  if (gameStage === 'VOTING') {
    return (
      <VotingScreen
        timerMode={selectedTimerMode}
        timer={timer}
        hasVoted={hasVoted}
        playerRoles={playerRoles}
        lobbyMode={lobbyMode}
        onCastVote={handleCastVote}
        onRevealResults={handleManualOnlineResults}
      />
    )
  }

  if (gameStage === 'RESULTS') {
    return (
      <ResultsScreen
        isLocalMode={isLocalMode}
        playerRoles={playerRoles}
        isImposterRevealed={isLocalImposterRevealed}
        onRevealImposter={() => setIsLocalImposterRevealed(true)}
        onResetGame={handleResetGame}
        votes={votes}
        lobbyMode={lobbyMode}
        roomCode={roomCode}
        onLeaveRoom={handleLeaveOnlineRoom}
      />
    )
  }

  return null
}
