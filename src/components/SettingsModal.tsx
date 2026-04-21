'use client'

import { useState } from "react"
import { Settings, DEFAULT_SETTINGS } from "../types"

interface Props {
    settings: Settings;
    onSave: (settings: Settings) => void;
}

function SettingsModal({ settings, onSave }: Props) {
    const [open, setOpen] = useState(false)
    const [draft, setDraft] = useState<Settings>(settings)

    const handleOpen = () => {
        setDraft(settings)
        setOpen(true)
    }

    const handleSave = () => {
        onSave(draft)
        setOpen(false)
    }

    const handleReset = () => {
        setDraft(DEFAULT_SETTINGS)
    }

    return (
        <>
            <button onClick={handleOpen} className="px-3 py-1 border border-gray-600 rounded text-sm hover:border-gray-400">
                ⚙ Settings
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-xl mx-4 flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-4 border-b border-gray-700">
                            <span className="font-semibold">Settings</span>
                            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">✕</button>
                        </div>

                        <div className="overflow-y-auto p-4 flex flex-col gap-5">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Groq API Key</label>
                                <input
                                    type="password"
                                    className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm"
                                    placeholder="gsk_..."
                                    value={draft.apiKey}
                                    onChange={e => setDraft(prev => ({ ...prev, apiKey: e.target.value }))}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Live Suggestion Prompt</label>
                                <textarea
                                    rows={5}
                                    className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm resize-none"
                                    value={draft.suggestionPrompt}
                                    onChange={e => setDraft(prev => ({ ...prev, suggestionPrompt: e.target.value }))}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Detailed Answer Prompt (on card click)</label>
                                <textarea
                                    rows={4}
                                    className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm resize-none"
                                    value={draft.detailedAnswerPrompt}
                                    onChange={e => setDraft(prev => ({ ...prev, detailedAnswerPrompt: e.target.value }))}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-gray-400 uppercase font-bold">Chat Prompt</label>
                                <textarea
                                    rows={4}
                                    className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm resize-none"
                                    value={draft.chatPrompt}
                                    onChange={e => setDraft(prev => ({ ...prev, chatPrompt: e.target.value }))}
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Suggestion Context (chunks)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={50}
                                        className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm"
                                        value={draft.suggestionContextChunks}
                                        onChange={e => setDraft(prev => ({ ...prev, suggestionContextChunks: Number(e.target.value) }))}
                                    />
                                    <span className="text-xs text-gray-500">Recent transcript chunks sent to suggestion model</span>
                                </div>

                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Chat & Detailed Answer Context (chunks)</label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={200}
                                        className="border border-gray-600 rounded px-3 py-2 bg-transparent text-sm"
                                        value={draft.chatContextChunks}
                                        onChange={e => setDraft(prev => ({ ...prev, chatContextChunks: Number(e.target.value) }))}
                                    />
                                    <span className="text-xs text-gray-500">Transcript chunks sent to typed chat questions and detailed card-click answers</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between p-4 border-t border-gray-700">
                            <button onClick={handleReset} className="px-3 py-1 text-sm text-gray-400 hover:text-white">
                                Reset to defaults
                            </button>
                            <div className="flex gap-2">
                                <button onClick={() => setOpen(false)} className="px-4 py-2 text-sm border border-gray-600 rounded hover:border-gray-400">
                                    Cancel
                                </button>
                                <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-500 rounded text-white hover:bg-blue-600">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SettingsModal