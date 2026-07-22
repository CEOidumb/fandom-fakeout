/// <reference path="./globals.d.ts" />
import { corsHeaders } from 'npm:@supabase/supabase-js@^2/cors'

type GenerateRequest = {
  category?: unknown
  subcategory?: unknown
  difficulty?: unknown
  recentRegularWords?: unknown
}

type GeminiContent = {
  type?: string
  text?: string
}

type GeminiStep = {
  type?: string
  content?: GeminiContent[]
}

const responseHeaders = {
  ...corsHeaders,
  'Content-Type': 'application/json',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders })
}

function cleanLabel(value: unknown, fieldName: string) {
  if (typeof value !== 'string') throw new Error(`${fieldName} is required.`)
  const label = value.trim().replace(/\s+/g, ' ')
  if (!label || label.length > 80) throw new Error(`${fieldName} is invalid.`)
  return label
}

function cleanWord(value: unknown) {
  if (typeof value !== 'string') return ''
  const word = value.trim().replace(/\s+/g, ' ')
  return word.length <= 40 && word.split(' ').length <= 4 ? word : ''
}

function cleanDifficulty(value: unknown) {
  return value === 'easy' || value === 'hard' ? value : 'medium'
}

function extractOutputText(payload: { steps?: GeminiStep[] }) {
  return (payload.steps || [])
    .filter((step) => step.type === 'model_output')
    .flatMap((step) => step.content || [])
    .filter((content) => content.type === 'text' && typeof content.text === 'string')
    .map((content) => content.text)
    .join('')
}

export default {
  async fetch(request: Request) {
    if (request.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405)
    }

    try {
      const apiKey = Deno.env.get('GEMINI_API_KEY')
      if (!apiKey) throw new Error('GEMINI_API_KEY has not been added to Supabase secrets.')

      const body = await request.json() as GenerateRequest
      const category = cleanLabel(body.category, 'Category')
      const subcategory = cleanLabel(body.subcategory, 'Subcategory')
      const difficulty = cleanDifficulty(body.difficulty)
      const recentRegularWords = Array.isArray(body.recentRegularWords)
        ? body.recentRegularWords
          .filter((word): word is string => typeof word === 'string')
          .map((word) => cleanWord(word))
          .filter(Boolean)
          .slice(0, 12)
        : []

      const recentWordsInstruction = recentRegularWords.length > 0
        ? `Do not reuse any of these recent civilian words: ${recentRegularWords.join(', ')}.`
        : 'Choose a varied word that would make repeat rounds feel fresh.'

      const difficultyInstruction = {
        easy: 'EASY: Give a clear connection from the same topic, but do not directly state the answer’s type, job, species, appearance, or definition.',
        medium: 'MEDIUM: Give a less direct association, such as a connected place, object, person, event, use, or phrase. A casual player should need to think about it.',
        hard: 'HARD: Give an indirect deep-cut association that someone with strong topic knowledge can connect to the answer. Never describe what the answer literally is.',
      }[difficulty]

      const prompt = `
Create one fair word pair for a social deduction party game called Fandom Fakeout.

Category: ${category}
Specific topic: ${subcategory}
Hint difficulty: ${difficulty}

The regular word is shown to every Civilian. It must be a recognizable, specific person, character, team, location, item, ability, event, or concept from the selected topic.
The undercover word is shown only to the Imposter. It must be a related but broader clue that helps them participate without revealing the regular word immediately.

Rules:
- Each value must be 1 to 4 words and no more than 40 characters.
- The two values must be different.
- The undercover word must not contain the regular word.
- Never make the clue an exact synonym, definition, role, species, job, or obvious category of the answer.
- For example, if the regular word is Woody, forbidden clues include "toy cowboy", "cowboy", and "Toy Story character". Better clues could connect him to Andy, Roundup, Bonnie, or a pull string depending on difficulty.
- ${difficultyInstruction}
- Prefer material that people familiar with the selected topic would recognize.
- Keep the content suitable for a general-audience party game.
- ${recentWordsInstruction}
`.trim()

      const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          model: Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash',
          input: prompt,
          store: false,
          generation_config: {
            temperature: difficulty === 'easy' ? 0.9 : difficulty === 'hard' ? 1.25 : 1.1,
            thinking_level: 'low',
          },
          response_format: {
            type: 'text',
            mime_type: 'application/json',
            schema: {
              type: 'object',
              properties: {
                regular: {
                  type: 'string',
                  description: 'The specific secret word shown to Civilian players.',
                },
                undercover: {
                  type: 'string',
                  description: 'The broader related hint shown to the Imposter.',
                },
              },
              required: ['regular', 'undercover'],
              additionalProperties: false,
            },
          },
        }),
      })

      const geminiPayload = await geminiResponse.json()
      if (!geminiResponse.ok) {
        console.error('Gemini API error:', geminiPayload)
        throw new Error('Gemini could not generate a word pair.')
      }

      const outputText = extractOutputText(geminiPayload)
      if (!outputText) throw new Error('Gemini returned an empty response.')

      const generated = JSON.parse(outputText)
      const regular = cleanWord(generated.regular)
      const undercover = cleanWord(generated.undercover)
      const regularLower = regular.toLowerCase()
      const undercoverLower = undercover.toLowerCase()

      if (
        !regular ||
        !undercover ||
        regularLower === undercoverLower ||
        undercoverLower.includes(regularLower)
      ) {
        throw new Error('Gemini returned an invalid word pair.')
      }

      return jsonResponse({ regular, undercover, source: 'gemini' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown word-generation error.'
      console.error('generate-word-pair:', message)
      return jsonResponse({ error: message }, 500)
    }
  },
}
