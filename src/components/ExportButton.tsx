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
        <button onClick={handleExport}>Download Session</button>
    </>)
}

export default ExportButton;