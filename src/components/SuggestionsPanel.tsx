'use client'

import { useEffect, useRef } from "react"
import { SuggestionBatch, TranscriptChunk, Settings } from "../types"

interface Props {
    chunks: TranscriptChunk[],
    isRecording: boolean,
    batches: SuggestionBatch[],
    setBatches: React.Dispatch<React.SetStateAction<SuggestionBatch[]>>,
    onSuggestionClick: (text: string) => void,
    settings: Settings
}

function SuggestionsPanel({chunks, isRecording, batches, setBatches, onSuggestionClick, settings}: Props) {
    const chunksRef = useRef(chunks);
    chunksRef.current = chunks;
    const settingsRef = useRef(settings);
    settingsRef.current = settings;

    async function fetchSuggestion() {
        const recentChunks = chunksRef.current.slice(-settingsRef.current.suggestionContextChunks);
        const texts = recentChunks.map(t => t.text).join(" ");
        if (!texts.trim()) return;
        const response = await fetch('/api/suggest', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-groq-api-key': settingsRef.current.apiKey
            },
            body: JSON.stringify({
                text: texts,
                prompt: settingsRef.current.suggestionPrompt
            })
        })
        const data = await response.json()
        const newSuggestionBatch: SuggestionBatch = {
            id: crypto.randomUUID(),
            suggestions: data.suggestions,
            timestamp: Date.now()
        }
        setBatches(prev => [newSuggestionBatch, ...prev]);
    }

    useEffect(() => {
        if (!isRecording) return;
        const interval = setInterval(fetchSuggestion, 30_000);
        return () => clearInterval(interval);
    }, [isRecording]);

    return (<>
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between">
                <span>2. Live Suggestions</span>
                <span>{batches.length} Batch</span>
            </div>
            <button onClick={fetchSuggestion} className="mt-4 px-3 py-1 border border-gray-500 rounded w-fit">
                 ↺ Reload suggestions
            </button>
            <div className="mt-4 flex flex-col gap-6 overflow-y-auto">
                {batches.map((batch) => (
                    <div key={batch.id} className="flex flex-col gap-3">
                        {batch.suggestions.map((s) => (
                            <div key={s.id} className="border border-gray-600 rounded p-3 cursor-pointer hover:border-gray-400" onClick={() => onSuggestionClick(s.preview)}>
                                <span className="text-xs font-bold uppercase">{s.type.replace(/_/g, ' ')}</span>
                                <p className="mt-1">{s.preview}</p>
                            </div>
                        ))}
                        <span className="text-xs text-gray-500 text-center">— {new Date(batch.timestamp).toLocaleTimeString()} —</span>
                    </div>
                ))}
            </div>
        </div>
    </>)
}

export default SuggestionsPanel;