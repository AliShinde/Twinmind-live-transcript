'use client'
import { useState } from "react";
import { ChatMessage } from "../types";

interface Props {
    messages: ChatMessage[],
    onSendMessage: (text: string) => void
}

function ChatPanel({messages, onSendMessage}: Props) {
    const [inputText, setInputText] = useState("")
    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText)
        setInputText("")
    }
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between">
                <span>3. CHAT</span>
            </div>
            <div className="flex-1 overflow-y-auto mt-4 flex flex-col gap-3">
                {messages.map((m) => (
                    <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                        <span className="text-xs text-gray-400">{m.role === 'user' ? 'YOU' : 'ASSISTANT'}</span>
                        <p>{m.text}</p>
                    </div>
                ))}
            </div>
            <div className="flex gap-2 mt-4">
                <input className="flex-1 border border-gray-600 rounded px-3 py-2 bg-transparent"
                    placeholder="Ask anything..." value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}/>
                <button className="px-4 py-2 bg-blue-500 rounded text-white" onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

export default ChatPanel;