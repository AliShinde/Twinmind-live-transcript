import Groq from "groq-sdk";
export async function POST(request:Request) {
    try{
        const apiKey = request.headers.get('x-groq-api-key')
        if(!apiKey) return Response.json({error: 'Missing API Key'}, {status: 401})
        const groq = new Groq({apiKey: apiKey});
        const formData = await request.formData();
        const file = formData.get('audio') as File;

        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: "whisper-large-v3",
            response_format: "json"
        })

        return Response.json({text: transcription.text})
    } catch(error){
        console.log("Error: ", error);
        return Response.json({error: 'Transcription failed'}, {status: 500})
    }
}