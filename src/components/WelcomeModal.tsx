'use client'

interface Props {
    open: boolean;
    onClose: () => void;
}

function WelcomeModal({ open, onClose }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md mx-4 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <span className="font-semibold">Welcome to your Personal Assistant</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
                </div>

                <div className="p-4 flex flex-col gap-4 text-sm text-gray-200">
                    <p>
                        Live meeting transcript assistant — it transcribes your mic in real time and gives you live suggestions (questions to ask, talking points, fact-checks) you can dive into via chat.
                    </p>
                    <p>
                        Add your own Groq API key from <span className="text-white font-medium">⚙ Settings</span> to get started.
                    </p>
                </div>

                <div className="flex justify-end p-4 border-t border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-400 rounded text-sm font-medium"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WelcomeModal;
