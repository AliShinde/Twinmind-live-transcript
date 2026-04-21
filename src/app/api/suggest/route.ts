import { Suggestion } from "@/src/types";
import Groq from "groq-sdk";
export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-groq-api-key')
        if(!apiKey) return Response.json({error: 'Missing api key'}, {status: 401})
        const groq = new Groq({apiKey: apiKey})
        const {text, prompt} = await request.json()
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: `Transcript: ${text}`
                }
            ],
            response_format: { type: 'json_object' },
            model: "openai/gpt-oss-120b"
        })
        const responseJson = JSON.parse(response.choices[0].message.content!)
        const suggestions: Suggestion[] = responseJson.suggestions.map((s: {type: string, preview: string}) => ({
            id: crypto.randomUUID(),
            type: s.type,
            preview: s.preview
        }))
        return Response.json({suggestions})

    } catch (error){
        console.log({"Error": error});
        return Response.json({error: 'Suggestions failed'}, {status: 500});
    }
}