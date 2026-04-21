'use client'

import { useState, useRef, useEffect } from "react";
import { TranscriptChunk, SuggestionBatch, ChatMessage, Settings, DEFAULT_SETTINGS } from "../types";
import TranscriptPanel from "../components/TranscriptPanel";
import SuggestionsPanel from "../components/SuggestionsPanel";
import ChatPanel from "../components/ChatPanel";
import SettingsModal from "../components/SettingsModal";
import ExportButton from "../components/ExportButton";

function Page() {
    const [chunks, setChunks] = useState<TranscriptChunk[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const recorderRef = useRef<MediaRecorder | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
    const headerBlobRef = useRef<Blob | null>(null)
    const [batches, setBatches] = useState<SuggestionBatch[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const chunksRef = useRef<TranscriptChunk[]>([]);
    const messagesRef = useRef<ChatMessage[]>([]);
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
    const settingsRef = useRef(settings);

    useEffect(() => {
        const saved = localStorage.getItem('twinmind-settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            setSettings(parsed);
            settingsRef.current = parsed;
        }
    }, []);

    const handleSaveSettings = (newSettings: Settings) => {
        setSettings(newSettings);
        settingsRef.current = newSettings;
        localStorage.setItem('twinmind-settings', JSON.stringify(newSettings));
    }

    const sendMessage = async (text: string, useDetailedPrompt = false) => {
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: 'user',
            text: text,
            timestamp: Date.now()
        }
        const updatedMessages = [...messagesRef.current, userMessage];
        messagesRef.current = updatedMessages;
        setMessages(updatedMessages);

        const s = settingsRef.current;
        const contextChunks = chunksRef.current.slice(-s.chatContextChunks);
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json',
                'x-groq-api-key': s.apiKey
            },
            body: JSON.stringify({
                message: text,
                transcript: contextChunks.map(c => c.text).join(' '),
                history: updatedMessages,
                prompt: useDetailedPrompt ? s.detailedAnswerPrompt : s.chatPrompt
            })
        })

        const assistantId = crypto.randomUUID();
        const assistantMessage: ChatMessage = {
            id: assistantId,
            role: 'assistant',
            text: '',
            timestamp: Date.now()
        }
        messagesRef.current = [...messagesRef.current, assistantMessage];
        setMessages(messagesRef.current);

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = '';
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullText += decoder.decode(value, { stream: true });
                messagesRef.current = messagesRef.current.map(m =>
                    m.id === assistantId ? { ...m, text: fullText } : m
                );
                setMessages(messagesRef.current);
            }
        } catch (err) {
            console.error('Chat stream failed:', err);
            const errorSuffix = fullText
                ? '\n\n[Stream interrupted. Partial response shown above.]'
                : '[Error: chat stream failed. Check your API key and network, then try again.]';
            messagesRef.current = messagesRef.current.map(m =>
                m.id === assistantId ? { ...m, text: fullText + errorSuffix } : m
            );
            setMessages(messagesRef.current);
        }
    }

    const start = async () => {
        if (!settingsRef.current.apiKey.trim()) {
            alert('Please add your Groq API key in Settings before recording.');
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        streamRef.current = stream;
        setIsRecording(true);
        const recorder = new MediaRecorder(stream, {mimeType: 'audio/webm;codecs=opus'});
        recorderRef.current = recorder;

        recorderRef.current.ondataavailable = async (e) => {
            if(e.data.size === 0) return;
            let audioBlob: Blob;
            if(headerBlobRef.current === null) {
                headerBlobRef.current = e.data;
                audioBlob = new Blob([e.data], { type: 'audio/webm' });
            } else {
                audioBlob = new Blob([headerBlobRef.current, e.data], { type: 'audio/webm' });
            }
            const formData = new FormData()
            formData.append('audio', audioBlob, 'audio.webm');
            const responseText = await fetch('/api/transcribe', {
                method: 'POST',
                headers: {
                    'x-groq-api-key': settingsRef.current.apiKey
                },
                body: formData
            })
            const data = await responseText.json()
            const newChunk: TranscriptChunk = {
                id: crypto.randomUUID(),
                text: data.text,
                timestamp: Date.now()
            }
            chunksRef.current = [...chunksRef.current, newChunk];
            setChunks(prev => [...prev, newChunk]);
        }
        recorder.start(30_000);
    }

    const stop = () => {
        if(recorderRef.current !== null && streamRef.current){
            recorderRef.current.onstop = () => { headerBlobRef.current = null; }
            recorderRef.current.stop()
            streamRef.current.getTracks().forEach(t => t.stop());
            setIsRecording(false);
        }
    }

    return(
        <>
            <div className="flex flex-col h-screen">
                <div className="flex justify-end gap-4 items-center px-4 py-2 border-b border-gray-700">
                    <ExportButton chunks={chunks} batches={batches} messages={messages}/>
                    <SettingsModal settings={settings} onSave={handleSaveSettings} />
                </div>
                <div className="flex flex-1 min-h-0">
                    <div className="w-1/3 border-r border-gray-700">
                        <TranscriptPanel chunks={chunks} isRecording={isRecording} onStart={start} onStop={stop}/>
                    </div>
                    <div className="w-1/3 border-r border-gray-700">
                        <SuggestionsPanel chunks={chunks} isRecording={isRecording} batches={batches} setBatches={setBatches} onSuggestionClick={(text) => sendMessage(text, true)} settings={settings}/>
                    </div>
                    <div className="w-1/3">
                        <ChatPanel messages={messages} onSendMessage={(text) => sendMessage(text, false)}/>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Page;