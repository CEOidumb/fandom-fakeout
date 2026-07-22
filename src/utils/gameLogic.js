export function extractPlayerNames(playersField) {
  if (!playersField) return []

  const players = typeof playersField === 'string'
    ? JSON.parse(playersField)
    : playersField

  if (!Array.isArray(players)) return []

  return players
    .map((player) => (typeof player === 'string' ? player : player?.name))
    .filter(Boolean)
}

export function assignPlayerRoles(
  playerNames,
  wordPair,
  { showHint = true, category = '' } = {}
) {
  const imposterIndex = Math.floor(Math.random() * playerNames.length)

  return playerNames.map((name, index) => ({
    name,
    role: index === imposterIndex ? 'Imposter' : 'Civilian',
    word: index === imposterIndex
      ? (showHint ? wordPair.undercover : null)
      : wordPair.regular,
    category: category || null,
  }))
}

export function calculateVoteResult(votes, playerRoles) {
  const voteEntries = Object.entries(votes || {})
    .map(([name, count]) => [name, Number(count) || 0])
  const maxVotes = Math.max(0, ...voteEntries.map(([, count]) => count))
  const topPlayers = voteEntries
    .filter(([, count]) => count === maxVotes)
    .map(([name]) => name)
  const getRole = (name) => (
    playerRoles.find((player) => player.name === name)?.role || 'Unknown'
  )

  if (maxVotes === 0) {
    return {
      winner: 'Imposter Won',
      explanation: 'Nobody received a vote, so the Imposter escaped unseen.',
      votedOut: 'Nobody',
      actualRole: 'No player was eliminated',
    }
  }

  if (topPlayers.length > 1) {
    return {
      winner: 'Imposter Won',
      explanation: `The vote tied between ${topPlayers.join(' and ')}, so the Imposter slipped away in the confusion.`,
      votedOut: `Nobody (tie between ${topPlayers.join(' and ')})`,
      actualRole: topPlayers.map((name) => `${name}: ${getRole(name)}`).join(', '),
    }
  }

  const eliminatedName = topPlayers[0]
  const eliminatedRole = getRole(eliminatedName)
  const civiliansWon = eliminatedRole === 'Imposter'

  return {
    winner: civiliansWon ? 'Civilians Won' : 'Imposter Won',
    explanation: civiliansWon
      ? `${eliminatedName} was the Imposter. The Civilians caught them.`
      : `${eliminatedName} was a Civilian. The real Imposter survived.`,
    votedOut: eliminatedName,
    actualRole: eliminatedRole,
  }
}
