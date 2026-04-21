import { ChatMessage, SuggestionBatch, TranscriptChunk } from "../types";

interface Props {
    chunks: TranscriptChunk[],
    batches: SuggestionBatch[],
    messages: ChatMessage[]
}

function ExportButton({chunks, batches, messages}: Props){
    const handleExport = () => {
        const exportData = {
            transcript: chunks,
            suggestions: batches,
            chat: messages
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a');
        a.href = url;
        a.download = 'twinmind-session.json'
        a.click();
        URL.revokeObjectURL(url);
    }
    return (<>
        <button
            onClick={handleExport}
            className="px-3 py-1 text-sm rounded border border-gray-600 cursor-pointer hover:border-gray-400 hover:text-white transition-colors"
        >
            Download Session
        </button>
    </>)
}

export default ExportButton;