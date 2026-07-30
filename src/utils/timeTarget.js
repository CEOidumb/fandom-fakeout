export const TIME_TARGET_MIN_TICKS = 20
export const TIME_TARGET_MAX_TICKS = 400
export const TIME_TARGET_HINT_RADIUS_TICKS = 100
export const TIME_TRIAL_MAX_CENTISECONDS = 3000

export function generateTimeTargetTicks() {
  const availableTicks = TIME_TARGET_MAX_TICKS - TIME_TARGET_MIN_TICKS + 1
  return TIME_TARGET_MIN_TICKS + Math.floor(Math.random() * availableTicks)
}

export function formatTimeTicks(ticks = 0) {
  const safeTicks = Math.max(0, Math.round(Number(ticks) || 0))
  const wholeSeconds = Math.floor(safeTicks / 20)
  const hundredths = (safeTicks % 20) * 5

  return `${String(wholeSeconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
}

export function formatStopwatchTime(centiseconds = 0) {
  const safeCentiseconds = Math.max(0, Math.round(Number(centiseconds) || 0))
  const wholeSeconds = Math.floor(safeCentiseconds / 100)
  const hundredths = safeCentiseconds % 100

  return `${String(wholeSeconds).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`
}

export function getTimeTargetHint(targetTicks) {
  const minimum = Math.max(0, targetTicks - TIME_TARGET_HINT_RADIUS_TICKS)
  const maximum = Math.min(TIME_TARGET_MAX_TICKS, targetTicks + TIME_TARGET_HINT_RADIUS_TICKS)

  return `${formatTimeTicks(minimum)} – ${formatTimeTicks(maximum)}`
}
