import { useEffect } from 'react'
import { STAGE_TIMERS } from '../config/gameOptions'

export default function useHostTimer({
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
}) {
  useEffect(() => {
    let interval = null
    let transitionTimeout = null

    if (selectedTimerMode !== 'timed') {
      return undefined
    }

    const shouldCountDown = (
      gameStage === 'DISCUSSION'
      || (!isLocalMode && gameStage === 'VOTING')
    )

    if (shouldCountDown && timer > 0) {
      const parsedDeadline = Date.parse(phaseEndsAt)

      if (Number.isNaN(parsedDeadline)) {
        setPhaseEndsAt(
          new Date(Date.now() + STAGE_TIMERS[gameStage] * 1000).toISOString()
        )
        return undefined
      }

      const updateRemainingTime = () => {
        const secondsRemaining = Math.max(
          0,
          Math.ceil((parsedDeadline - Date.now()) / 1000)
        )
        setTimer(secondsRemaining)
      }

      updateRemainingTime()
      interval = setInterval(updateRemainingTime, 250)
    } else if (timer === 0 && isLocalMode && gameStage === 'DISCUSSION') {
      // Pass & Play ends on a private reveal instead of online voting.
      transitionTimeout = setTimeout(() => {
        setIsLocalImposterRevealed(false)
        setPhaseEndsAt(null)
        setStage('RESULTS')
      }, 0)
    } else if (timer === 0 && !isLocalMode && lobbyMode === 'HOST') {
      // Only the online host owns automatic phase changes.
      transitionTimeout = setTimeout(async () => {
        if (gameStage === 'DISCUSSION') {
          const published = await publishOnlineStage('VOTING')
          if (!published) return

          setTimer(STAGE_TIMERS.VOTING)
          setStage('VOTING')
        } else if (gameStage === 'VOTING') {
          const published = await publishOnlineStage('RESULTS')
          if (!published) return

          setStage('RESULTS')
        }
      }, 0)
    }

    return () => {
      clearInterval(interval)
      clearTimeout(transitionTimeout)
    }
  }, [
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
  ])
}
