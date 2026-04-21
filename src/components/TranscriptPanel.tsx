'use client';
import { TranscriptChunk } from "../types";
import { useRef, useEffect } from "react";

interface Props {
    chunks: TranscriptChunk[],
    isRecording: boolean,
    onStart: () => void,
    onStop: () => void
}

function TranscriptPanel({chunks, isRecording, onStart, onStop}: Props) {
    const autoScrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        autoScrollRef.current?.scrollIntoView()
    }, [chunks])
    return (<>
        <div className="p-4 h-full flex flex-col">
            <div className="flex justify-between mt-4">
                <span>1. MIC & TRANSCRIPT</span>
                <span>{isRecording ? 'RECORDING' : 'IDLE'}</span>
            </div>
            <div className="flex justify-center mt-4">
                <button onClick={isRecording ? onStop : onStart}
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white ${isRecording ? 'bg-red-500' : 'bg-blue-500'}`}>
                    <span className="text-white text-2xl">
                        {isRecording ? '⏹' : '🎙'}
                    </span>
                </button>
            </div>
            {chunks.length === 0 && (
                <p className="text-gray-500 text-center mt-8">Your transcript will appear here..</p>
            )}
            <ul className="overflow-y-auto flex-1 mt-4">
                {chunks.map((m) => (
                    <li key={m.id} className="mb-2">
                        <span className="text-gray-400 text-xs mr-2">
                            {new Date(m.timestamp).toLocaleTimeString()}
                        </span>
                        {m.text}
                    </li>
                ))}
                <div ref={autoScrollRef}></div>
            </ul>
        </div>
    </>)
}

export default TranscriptPanel;