import {
  AI_DIFFICULTIES,
  CATEGORY_DISPLAY_MODES,
  HINT_MODES,
  TIMER_MODES,
  TOPIC_SELECTION_MODES,
  WORD_SOURCES,
} from '../config/gameOptions'
import {
  CATEGORY_CATALOG,
  getCategory,
  getSubcategory,
} from '../data/categories'

const choiceClass = (isSelected) => `rounded-xl border px-2 py-2.5 text-sm font-semibold leading-tight break-words transition-all ${
  isSelected
    ? 'border-violet-400/70 bg-violet-500/15 text-violet-100'
    : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-400/40 hover:text-white'
}`

export default function CategorySelector({
  categoryId,
  subcategoryId,
  selectionMode,
  customCategory,
  customTopic,
  wordSource,
  difficulty,
  hintMode,
  categoryDisplayMode,
  timerMode,
  onCategoryChange,
  onSubcategoryChange,
  onSelectionModeChange,
  onCustomCategoryChange,
  onCustomTopicChange,
  onWordSourceChange,
  onDifficultyChange,
  onHintModeChange,
  onCategoryDisplayModeChange,
  onTimerModeChange,
}) {
  const category = getCategory(categoryId)
  const subcategory = getSubcategory(categoryId, subcategoryId)
  const wordSourceDetails = WORD_SOURCES.find((option) => option.id === wordSource) || WORD_SOURCES[0]
  const difficultyDetails = AI_DIFFICULTIES.find((option) => option.id === difficulty) || AI_DIFFICULTIES[1]
  const timerModeDetails = TIMER_MODES.find((option) => option.id === timerMode) || TIMER_MODES[0]
  const hintModeDetails = HINT_MODES.find((option) => option.id === hintMode) || HINT_MODES[0]
  const categoryDisplayDetails = CATEGORY_DISPLAY_MODES.find((option) => option.id === categoryDisplayMode) || CATEGORY_DISPLAY_MODES[0]
  const selectionModeDetails = TOPIC_SELECTION_MODES.find((option) => option.id === selectionMode) || TOPIC_SELECTION_MODES[0]

  return (
    <div className="my-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-left sm:p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-200">Game Mode</h3>
        <p className="mt-1 text-xs text-slate-400">
          Choose from the library, surprise the group, or create your own topic.
        </p>
      </div>

      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Topic selection
      </span>
      <div className="grid grid-cols-3 gap-2">
        {TOPIC_SELECTION_MODES.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelectionModeChange(option.id)}
            className={choiceClass(option.id === selectionModeDetails.id)}
          >
            {option.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">{selectionModeDetails.description}</p>

      {selectionMode === 'catalog' && (
        <>
          <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Category
          </span>
          <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {CATEGORY_CATALOG.map((catalogCategory) => (
              <button
                key={catalogCategory.id}
                type="button"
                onClick={() => onCategoryChange(catalogCategory.id)}
                className={`${choiceClass(catalogCategory.id === category.id)} sm:px-3 ${
                  catalogCategory.id === category.id
                    ? 'border-violet-400 bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30'
                    : ''
                }`}
              >
                {catalogCategory.name}
              </button>
            ))}
          </div>

          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Specific topic
          </span>
          <div className="grid max-h-56 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:max-h-64 sm:grid-cols-3">
            {category.subcategories.map((catalogSubcategory) => (
              <button
                key={catalogSubcategory.id}
                type="button"
                onClick={() => onSubcategoryChange(catalogSubcategory.id)}
                className={`${choiceClass(catalogSubcategory.id === subcategory.id)} sm:px-3`}
              >
                {catalogSubcategory.name}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">{subcategory.description}</p>
        </>
      )}

      {selectionMode === 'random' && (
        <div className="mt-5 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4">
          <span className="block text-sm font-bold text-violet-200">Mystery selection</span>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            Every new round randomly picks one category and one specific topic from the full game library.
          </p>
        </div>
      )}

      {selectionMode === 'custom' && (
        <div className="mt-5 space-y-4 rounded-2xl border border-violet-400/20 bg-violet-500/5 p-4">
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="custom-category">
              Category name
            </label>
            <input
              id="custom-category"
              type="text"
              maxLength={60}
              value={customCategory}
              onChange={(event) => onCustomCategoryChange(event.target.value)}
              placeholder="Example: Music"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500" htmlFor="custom-topic">
              Fandom or topic
            </label>
            <input
              id="custom-topic"
              type="text"
              maxLength={80}
              value={customTopic}
              onChange={(event) => onCustomTopicChange(event.target.value)}
              placeholder="Example: 2000s Hip-Hop"
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Be specific enough that everyone playing knows what kinds of answers to expect.
          </p>
        </div>
      )}

      <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Round timer
      </span>
      <div className="grid grid-cols-2 gap-2">
        {TIMER_MODES.map((option) => (
          <button key={option.id} type="button" onClick={() => onTimerModeChange(option.id)} className={choiceClass(option.id === timerModeDetails.id)}>
            {option.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">{timerModeDetails.description}</p>

      <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Imposter hint
      </span>
      <div className="grid grid-cols-2 gap-2">
        {HINT_MODES.map((option) => (
          <button key={option.id} type="button" onClick={() => onHintModeChange(option.id)} className={choiceClass(option.id === hintModeDetails.id)}>
            {option.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">{hintModeDetails.description}</p>

      {hintModeDetails.id === 'hint' && (
        <>
          <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Word and hint source
          </span>
          <div className={`grid gap-2 ${selectionMode === 'custom' ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {WORD_SOURCES
              .filter((option) => selectionMode !== 'custom' || option.id !== 'built-in')
              .map((option) => (
                <button key={option.id} type="button" onClick={() => onWordSourceChange(option.id)} className={choiceClass(option.id === wordSourceDetails.id)}>
                  {option.name}
                </button>
              ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            {selectionMode === 'custom'
              ? 'Gemini creates a fresh word and hint for your custom topic.'
              : wordSourceDetails.description}
          </p>

          {wordSourceDetails.id === 'ai' && (
            <>
              <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                AI hint difficulty
              </span>
              <div className="grid grid-cols-3 gap-2">
                {AI_DIFFICULTIES.map((option) => (
                  <button key={option.id} type="button" onClick={() => onDifficultyChange(option.id)} className={choiceClass(option.id === difficultyDetails.id)}>
                    {option.name}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-400">{difficultyDetails.description}</p>
            </>
          )}
        </>
      )}

      <span className="mt-5 mb-2 block text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        Category on role card
      </span>
      <div className="grid grid-cols-2 gap-2">
        {CATEGORY_DISPLAY_MODES.map((option) => (
          <button key={option.id} type="button" onClick={() => onCategoryDisplayModeChange(option.id)} className={choiceClass(option.id === categoryDisplayDetails.id)}>
            {option.name}
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">{categoryDisplayDetails.description}</p>
    </div>
  )
}
