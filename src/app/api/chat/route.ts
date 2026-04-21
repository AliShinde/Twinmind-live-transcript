import { ChatMessage } from "@/src/types";
import Groq from "groq-sdk";

export async function POST(request: Request) {
    try {
        const apiKey = request.headers.get('x-groq-api-key')
        if (!apiKey) return Response.json({ error: "Missing api key" }, { status: 401 })
        const groq = new Groq({ apiKey: apiKey })
        const { message, transcript, history, prompt } = await request.json();
        const stream = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: `${prompt}\n\nTranscript so far:\n${transcript}`
                },
                ...history.map((m: ChatMessage) => ({
                    role: m.role,
                    content: m.text
                })),
                {
                    role: 'user',
                    content: message
                }
            ],
            model: "openai/gpt-oss-120b",
            stream: true
        })

        const encoder = new TextEncoder();
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        const text = chunk.choices[0]?.delta?.content ?? '';
                        if (text) controller.enqueue(encoder.encode(text));
                    }
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.log({ "Error": error });
        return Response.json({ error: 'Chat failed' }, { status: 500 });
    }
}