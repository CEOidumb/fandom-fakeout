import { supabase } from '../supabaseClient'

const RECENT_AI_WORD_LIMIT = 12

function normalizeGeneratedWord(value) {
  if (typeof value !== 'string') return ''

  const word = value.trim().replace(/\s+/g, ' ')
  return word.length <= 40 && word.split(' ').length <= 4 ? word : ''
}

function getRecentAiWords(historyKey) {
  try {
    const storageKey = `recent-ai-words:${historyKey}`
    const savedWords = JSON.parse(localStorage.getItem(storageKey) || '[]')

    return Array.isArray(savedWords)
      ? savedWords
          .filter((word) => typeof word === 'string')
          .slice(0, RECENT_AI_WORD_LIMIT)
      : []
  } catch {
    return []
  }
}

function rememberAiWord(historyKey, regularWord) {
  try {
    const recentWords = getRecentAiWords(historyKey)
    const nextWords = [
      regularWord,
      ...recentWords.filter(
        (word) => word.toLowerCase() !== regularWord.toLowerCase()
      ),
    ]

    localStorage.setItem(
      `recent-ai-words:${historyKey}`,
      JSON.stringify(nextWords.slice(0, RECENT_AI_WORD_LIMIT))
    )
  } catch {
    // Private browsing or strict browser settings may disable local storage.
  }
}

export async function generateAiWordPair({
  categoryName,
  topicName,
  difficulty,
  historyKey,
}) {
  const safeHistoryKey = historyKey || `${categoryName}:${topicName}`.toLowerCase()
  const { data, error } = await supabase.functions.invoke('generate-word-pair', {
    body: {
      category: categoryName,
      subcategory: topicName,
      difficulty,
      recentRegularWords: getRecentAiWords(safeHistoryKey),
    },
  })

  if (error) throw error

  const regular = normalizeGeneratedWord(data?.regular)
  const undercover = normalizeGeneratedWord(data?.undercover)

  if (!regular || !undercover || regular.toLowerCase() === undercover.toLowerCase()) {
    throw new Error('Gemini returned an invalid word pair.')
  }

  rememberAiWord(safeHistoryKey, regular)
  return { regular, undercover }
}
