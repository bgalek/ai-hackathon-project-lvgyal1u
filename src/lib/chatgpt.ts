import axios, {RawAxiosRequestHeaders} from 'axios';

const nerdBordUrl = 'https://training.nerdbord.io/api/v1/openai';
const nerdBordApiKey = '';

const openApiUrl = 'https://api.openai.com/v1'
const openApiKey = 'Bearer ';

const baseUrl = openApiUrl;
const apiKey = openApiKey;

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
            Pamiętaj, że odpowiedzi są indeksowane od zera.
            Np. dla tematu "Zasady BHP", przykładowa odpowiedź to: 
            { "quiz": [
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
            ]}`
        });
        const response = await chatGpt.sendMessage(`Temat quizu: ${topic}`, {json: true});
        try {
            let quiz = JSON.parse(response.message.content).quiz as Question[];

            if (quiz.length < 10) {
                console.debug(`Quiz contained less than 10 questions`);
                continue;
            }
            quiz = quiz.slice(0, 10);

            let areQuestionsValid = true;
            for (const question of quiz) {
                if (question.answers.length !== 4) {
                    console.debug("Questions didn't had exactly 4 answers");
                    areQuestionsValid = false;
                    break;
                }

                if (question.correctAnswer < 0 || question.correctAnswer > 3) {
                    console.debug('correctAnswer outside of permitted range');
                    areQuestionsValid = false;
                    break;
                }
            }
            if (!areQuestionsValid) continue;

            return quiz;
        } catch (e) {
            console.debug('Error while parsing JSON: ', e)
        }
    }
}

export class ChatGpt {
    messages: Message[] = [];

    async sendMessage(message: string, options: { json?: boolean, files?: File[] } = {}): Promise<Choice> {
        this.messages.push({role: 'user', content: message});
        console.log(this.messages);

        const promises: Promise<any>[] = [];
        for (const file of options.files ?? []) {
            const formData = new FormData();
            formData.append('purpose', 'assistants');
            formData.append('file', file, file.name);
            promises.push(axios.post(`${baseUrl}/chat/v1/files`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: apiKey,
                } as RawAxiosRequestHeaders,
            }));
        }

        await Promise.all(promises);

        const response = await axios.post(`${baseUrl}/chat/completions`, {
            model: 'gpt-4-turbo',
            messages: this.messages,
            response_format: options.json ? {type: 'json_object'} : undefined,
        }, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: apiKey,
            } as RawAxiosRequestHeaders,
        });

        console.log(response.data);

        const choice = response.data.choices[0] as Choice;
        this.messages.push(choice.message);

        return choice;
    }
}
