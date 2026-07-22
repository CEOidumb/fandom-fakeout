export const STAGE_ORDER = {
  LOBBY: 0,
  REVEAL: 1,
  DISCUSSION: 2,
  VOTING: 3,
  RESULTS: 4,
}

export const STAGE_TIMERS = {
  DISCUSSION: 60,
  VOTING: 20,
}

export const AI_DIFFICULTIES = [
  { id: 'easy', name: 'Easy', description: 'A clearer connection for newer or casual players.' },
  { id: 'medium', name: 'Medium', description: 'Related, but avoids directly describing the answer.' },
  { id: 'hard', name: 'Hard', description: 'An indirect connection that rewards deep topic knowledge.' },
]

export const DEFAULT_AI_DIFFICULTY = 'medium'

export const TOPIC_SELECTION_MODES = [
  { id: 'catalog', name: 'Choose', description: 'Pick a category and topic from the game library.' },
  { id: 'random', name: 'Random', description: 'Choose a different library category and topic when each round starts.' },
  { id: 'custom', name: 'Custom', description: 'Type any category and topic for Gemini to build a round around.' },
]

export const DEFAULT_TOPIC_SELECTION_MODE = 'catalog'

export const WORD_SOURCES = [
  { id: 'ai', name: 'AI Generated', description: 'Gemini creates a fresh word and hint for each round.' },
  { id: 'built-in', name: 'Built-In', description: 'Use a tested word and hint from the game library.' },
]

export const DEFAULT_WORD_SOURCE = 'ai'

export const HINT_MODES = [
  { id: 'hint', name: 'Show Hint', description: 'The Imposter receives a related clue to help them blend in.' },
  { id: 'none', name: 'No Hint', description: 'The Imposter only sees their role and must figure out the topic from the discussion.' },
]

export const DEFAULT_HINT_MODE = 'hint'

export const CATEGORY_DISPLAY_MODES = [
  { id: 'show', name: 'Show Category', description: 'Every player sees the category with their role.' },
  { id: 'hide', name: 'Hide Category', description: 'Players must identify the category from their word and the discussion.' },
]

export const DEFAULT_CATEGORY_DISPLAY_MODE = 'show'

export const TIMER_MODES = [
  { id: 'timed', name: 'Timed', description: 'Phases advance automatically when their countdown ends.' },
  { id: 'untimed', name: 'No Timer', description: 'Advance manually whenever the group is ready.' },
]

export const DEFAULT_TIMER_MODE = 'timed'
