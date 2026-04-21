# TwinMind Live Suggestions

A real-time meeting assistant that transcribes your conversation and surfaces useful suggestions as you speak. Built for the TwinMind assignment (April 2026).

Three panels: microphone + live transcript on the left, auto-refreshing suggestion cards in the middle, and a chat panel on the right that streams detailed answers when you click a card or type a question.

## Stack

- **Next.js 16 (App Router, TypeScript)** — one codebase handles the UI and the three API routes (`/api/transcribe`, `/api/suggest`, `/api/chat`).
- **Tailwind CSS** — utility-first styling, no design system overhead.
- **Groq** for every model call:
  - `whisper-large-v3` for transcription
  - `openai/gpt-oss-120b` for suggestions and chat
- **Browser `MediaRecorder`** for audio capture (no external recording library).
- **localStorage** for settings persistence (API key, prompts, context windows).

## Setup

```bash
git clone https://github.com/AliShinde/Twinmind-live-transcript.git
cd Twinmind-live-transcript
npm install
npm run dev
```

Open [this url](https://twinmind-live-transcript-fv8oxyndd-alishindes-projects.vercel.app/), open the Settings gear, paste your Groq API key (get one at https://console.groq.com/keys), and start recording.

No environment variables required — the API key is supplied by the user at runtime and sent with each request as an `x-groq-api-key` header. Nothing is hardcoded or shipped.

## Architecture

- **Transcript chunking:** `MediaRecorder` is started with a 30-second timeslice. Each chunk is prepended with the recording's header blob before being sent to Whisper, so every request is a self-contained, decodable WebM file.
- **Suggestions:** every 30 seconds (and on the Reload button), the recent N transcript chunks are sent to GPT-OSS with a structured prompt. The model returns JSON with exactly 3 typed suggestions. New batches stack at the top; older batches stay visible.
- **Chat:** clicking a suggestion card sends its preview text into the chat with a separate, longer prompt (`detailedAnswerPrompt`). Typed questions use the `chatPrompt`. Both flows stream tokens back from Groq via a `ReadableStream` on the server and `response.body.getReader()` on the client, so text appears progressively.
- **Export:** a single button serializes `{ transcript, suggestions, chat }` to JSON. Every record (transcript chunk, suggestion batch, chat message) carries a `timestamp`.
- **Settings:** a modal edits API key, three prompts (live suggestion, detailed answer, chat), and two context windows (suggestions, chat/detailed answer). All persisted to localStorage. Reset-to-defaults ships sensible values.

## Prompt strategy

The suggestion prompt was the highest-leverage piece — quality of live suggestions is the primary evaluation criterion.

- **Chain-of-thought classification.** The prompt asks the model to silently classify the conversation (type, tone, recent focus) before producing suggestions. This anchors the output to the actual context instead of generating generic advice.
- **Explicit JSON shape with placeholder content.** A concrete JSON example at the end of the prompt locks field names (`suggestions`, `type`, `preview`) and type values (`question_to_ask`, `talking_point`, `fact_check`, etc.) — the model otherwise drifted to `"text"` and `"question"`. Placeholder strings (`"<the exact question..."`) are used instead of real content to prevent the model from biasing toward the example's topic.
- **Per-type rules.** Each suggestion type has a one-line directive stating what the preview should BE (not describe). This prevents meta-previews like "ask about their approach to scaling" and produces directly-actionable text.
- **Specificity constraint.** Every preview must contain a concrete word, number, or tool from the transcript. This is what separates useful suggestions from filler.

The detailed-answer and chat prompts enforce tight length budgets (3-4 sentences) with a hard ban on markdown, headers, and preamble. Early iterations produced walls of text with `**What was said**` headers; the tightened prompts now match the prototype's scan-friendly density. Both prompts lead with transcript grounding and use external knowledge only to add depth the transcript lacks.

## Tradeoffs

- **Sliding window instead of summarization for context.** GPT-OSS 120B has a ~128k-token context window, which is well beyond anything a live meeting produces in a typical session. Summarization would cost an extra API round-trip and lossy compression for no gain at this scale. If sessions stretched into multi-hour territory, a rolling summary would become worth it.
- **Single context-window setting for chat + detailed answers.** The requirement called for separate windows for "chat" and "expanded answers on click." Both flows share the same `/api/chat` endpoint and same state, so I exposed one field labeled "Chat & Detailed Answer Context" rather than adding a knob that would behave identically under the hood. Fewer confusing settings, same result.
- **No streaming for suggestions** (only for chat). Suggestions are small, structured JSON — streaming a 3-object payload adds code without user-visible benefit. Chat responses can run long and benefit from progressive reveal, so that's where streaming is applied.
- **`MediaRecorder` header-blob workaround.** WebM fragments after the first aren't decodable standalone because they lack the initialization header. Every subsequent chunk is prepended with the cached first blob before being sent to Whisper. Simple, reliable, avoids server-side ffmpeg.
- **`alert()` for missing API key** on mic start. It's blocking and clear; a toast would be nicer but adds UI dependencies. For an auth-like validation, the native alert's interruption is appropriate.
- **No persistence of transcript/suggestions/chat** across reloads — this matches the requirement explicitly ("no login, no persistence"). Only settings persist.
- **Session-only, client-side API key.** The key lives in localStorage and is sent with every request. This is the simplest, spec-compliant approach for a take-home. A production app would proxy through a server-held key with auth.

## File layout

```
src/
  app/
    api/
      chat/route.ts          Streaming chat (detailed + typed questions)
      suggest/route.ts       3-suggestion JSON batch
      transcribe/route.ts    Whisper passthrough
    layout.tsx, page.tsx     Root component, all state lifted here
  components/
    TranscriptPanel.tsx      Left column: record button + scrolling transcript
    SuggestionsPanel.tsx     Middle column: batch list + reload
    ChatPanel.tsx            Right column: messages + input
    SettingsModal.tsx        Modal with API key, prompts, context windows
    ExportButton.tsx         Session JSON download
  types/index.ts             Shared types + DEFAULT_SETTINGS
```

## What's not included

- Mobile/responsive layout — desktop-first.
- Speaker diarization — Whisper returns plain text.
- Retry/backoff on API errors — transcription and suggestion errors are logged but not surfaced to the UI beyond a partial chat-stream error message.
