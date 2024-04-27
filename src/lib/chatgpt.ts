import axios, {RawAxiosRequestHeaders} from 'axios';

type Message = {
    role: 'user' | 'system' | 'assistant',
    content: string,
}

type Question = {
    question: string,
    answers: string[],
    correctAnswer: number,
}

type Choice = {
    finish_reason: string,
    message: Message,
}

export async function generateQuiz(topic: string): Promise<Question[]> {
    let retries = 0;
    while (true) {
        const maxRetries = 10;
        if (++retries > maxRetries) throw 'Failed to generate quiz';
        console.log(`Generating quiz for topic (${retries}/${maxRetries}): ${topic}`);
        const chatGpt = new ChatGpt();
        chatGpt.messages.push({
            role: 'system',
            content: `
            Jesteś botem generującym quizy. Użytkownik poda ci temat, a ty wygenerujesz quiz w postaci JSON.
            Każde pytanie powinno posiadać 4 możliwe odpowiedzi oraz poprawną odpowiedź.
            Każdy quiz powinien mieć dokładnie 10 pytań. Upewnij się, że twoja odpowiedź jest poprawnym JSONem.
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
            ]`
        });
        const response = await chatGpt.sendMessage(`Temat quizu: ${topic}`);
        const match = /(\[[\s\S]*])/g.exec(response.message.content);
        const json = match?.[1];
        if (!json) {
            console.debug('Response did not contain JSON.');
            continue;
        }
        try {
        return JSON.parse(json);
        } catch (e) {
            console.debug('Error while parsing JSON: ', e)
        }
    }
}

export class ChatGpt {
    messages: Message[] = [];

    async sendMessage(message: string): Promise<Choice> {
        this.messages.push({role: 'user', content: message});
        console.log(this.messages);
        const response = await axios.post('https://training.nerdbord.io/api/v1/openai/chat/completions', {
            'messages': this.messages,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: '0fb37792bba9668ad9f53ffc5b2624393f7886ff3bb764f243b1c7a838d98364406b3a3e481c8857f77f80d4539c31c8d1e248447a8c8a9642cb6b12128eafc9',
            } as RawAxiosRequestHeaders,
        });

        console.log(response.data);

        const choice = response.data.choices[0] as Choice;
        this.messages.push(choice.message);

        return choice;
    }
}
