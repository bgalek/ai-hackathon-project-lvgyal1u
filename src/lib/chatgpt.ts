import axios, { RawAxiosRequestHeaders } from "axios";

type Message = {
    role: "user" | "system" | "assistant";
    content: string;
};

export type Question = {
    question: string;
    answers: string[];
    correctAnswer: number;
};

type Choice = {
    finish_reason: string;
    message: Message;
};

const SYSTEM_CONTEXT = `
Jesteś botem generującym quizy. Użytkownik poda ci temat, a ty wygenerujesz quiz w postaci JSON.
Każde pytanie powinno posiadać 4 możliwe odpowiedzi oraz poprawną odpowiedź.
Każdy quiz powinien mieć dokładnie 10 pytań. Odpowiedź musi być poprawnym formatem JSON..

Np. dla tematu "Zasady BHP", przykładowa odpowiedź to:
[
    {
        "question": "Jakie są główne cele przestrzegania zasad BHP?",
        "answers": [
            "Ochrona zdrowia i życia pracowników",
            "Ochrona mienia",
            "Ochrona środowiska naturalnego",
            "Wszystkie powyższe",
        ],
        "correctAnswer": 3
    }
]`;

export class OpenAI {
    async sendMessage(message: string, systemContext?: string, jsonResponse = false): Promise<Choice> {
        const response = await fetch("https://training.nerdbord.io/api/v1/openai/chat/completions", {
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "0fb37792bba9668ad9f53ffc5b2624393f7886ff3bb764f243b1c7a838d98364406b3a3e481c8857f77f80d4539c31c8d1e248447a8c8a9642cb6b12128eafc9",
            },
            body: JSON.stringify({
                messages: [
                    { role: "user", content: message },
                    ...(systemContext ? [{ role: "system", content: systemContext }] : []),
                ],
                ...(jsonResponse && { response_format: { type: "json_object" } }),
            }),
            method: "POST",
        });
        const { choices } = await response.json();

        const [choice] = choices;

        return choice;
    }

    async generateQuiz(topic: string) {
        const response = await this.sendMessage(`Temat quizu: ${topic}`, SYSTEM_CONTEXT, true);

        const match = /(\[[\s\S]*])/g.exec(response.message.content);
        const [json] = match || [];
        if (!json) return console.error("Response did not contain JSON.");

        try {
            return JSON.parse(json);
        } catch (error) {
            console.error("Error while parsing JSON: ", error);
        }
    }
}
