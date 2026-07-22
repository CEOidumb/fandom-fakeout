# Fandom Fakeout

Fandom Fakeout is a React party game with local Pass & Play and Supabase-powered online multiplayer.

## How the Gemini word generator works

When a round starts:

1. The local device, or only the online host, asks the `generate-word-pair` Supabase Edge Function for a pair.
2. The Edge Function privately calls Gemini and validates its response.
3. The host assigns the Civilian and Imposter roles.
4. Online guests receive their assigned word through the existing Supabase room sync.

The Gemini key never goes into the React app. If Gemini is unavailable or the free-tier limit is reached, the game automatically uses one of the built-in backup pairs instead.

## One-time Gemini setup

### 1. Create a Gemini API key

Open [Google AI Studio](https://aistudio.google.com/app/apikey), create an API key, and copy it. Treat this key like a password.

### 2. Save the key as a Supabase secret

In your Supabase project dashboard, open the Edge Function secrets page and add:

- Name: `GEMINI_API_KEY`
- Value: your Gemini API key

Do not place this key in `.env.local`, `App.jsx`, or any other browser file.

### 3. Deploy the Edge Function

Open Cursor's terminal in this project and run:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase functions deploy generate-word-pair --use-api
```

Replace `YOUR_PROJECT_REF` with the first part of your Supabase URL. For example, if the URL is `https://abc123.supabase.co`, the project ref is `abc123`.

No new SQL query is needed for Gemini. The generated pair is stored inside the existing `player_roles` room data.

## Run the app

```powershell
npm run dev
```

Add at least three players and start a round. The button should briefly say `Gemini is making a fresh pair...`.

If the game displays the backup-pair message, check:

- The Edge Function was deployed with the exact name `generate-word-pair`.
- The Supabase secret is named exactly `GEMINI_API_KEY`.
- The Edge Function logs in the Supabase dashboard for the detailed error.

## Optional model setting

The function currently uses `gemini-3.5-flash`. To switch models later without editing code, add another Supabase secret named `GEMINI_MODEL` whose value is a supported Gemini model ID.
