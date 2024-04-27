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
    attachments?: Attachment[],
}

type Attachment = {
    file_id: string,
    tools?: string[],
};

type Question = {
    question: string,
    answers: string[],
    correctAnswer: number,
}

type Choice = {
    finish_reason: string,
    message: Message,
}

type Resource = {
    id: string,
}

type Run = {
    id: string,
    status: string,
    thread_id: string,
}

export async function generateQuiz(topic?: string, files?: File[]): Promise<Question[]> {
    if (topic !== undefined && files !== undefined) {
        throw 'Cannot generate quiz by both topic and files and the same time';
    }
    if (topic === undefined && files === undefined) {
        throw 'Either topic or files had to be filled';
    }

    let retries = 0;
    while (true) {
        const maxRetries = 10;
        if (++retries > maxRetries) throw 'Failed to generate quiz';

        let quizJson: string;
        if (topic !== undefined) {
            // prompt by topic
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
            quizJson = response.message.content;
        } else {
            // prompt by files
            console.log(`Generating quiz using files (${retries}/${maxRetries})`);
            const assistantPromise = createAssistant(`
            Jesteś botem generującym quizy. Na podstawie załączonych plików wygeneruj quiz w postaci JSON.
            Jeżeli załączonym plikiem jest inny quiz/test, wygeneruj quiz posiadający podobny zestaw pytań.
            W innym przypadku użyj danych z pliku jako jednego ze źródeł danych przy tworzeniu pytań.
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
            ]}`);
            const filePromises = files!.map(uploadFile);
            const [assistant, ...gptFiles] =
                await Promise.all([assistantPromise, ...filePromises]);

            let run = await createThreadAndRun(assistant.id, {
                role: 'user',
                content: '',
                attachments: gptFiles.map(it => ({file_id: it.id, tools: ['file_search']})),
            });

            let runFailed = false;
            do {
                if (run.status ! in ['completed', 'queued', 'in_progress']) {
                    console.debug('Run failed');
                    runFailed = true;
                    break;
                }
                await delay(200);
                run = await retrieveRun(run.thread_id, run.id);
            } while (run.status !== 'completed');
            if (runFailed) continue;

            const response = (await listMessages(run.thread_id, run.id))[0];
            quizJson = response.content;
        }

        try {
            let quiz = JSON.parse(quizJson).quiz as Question[];

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

async function createAssistant(instructions: string): Promise<Resource> {
    const response = await axios.post(`${baseUrl}/assistants`, {
        model: 'gpt-4-turbo',
        instructions: instructions,
        tools: [{type: 'file_search'}],
        temperature: 0.5, // makes output more predictable
        response_format: {type: 'json_object'},
    }, {
        headers: {
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
            Authorization: apiKey,
        } as RawAxiosRequestHeaders,
    });

    console.log(response.data);

    return response.data;
}

async function uploadFile(file: File): Promise<Resource> {
    const formData = new FormData();
    formData.append('purpose', 'assistants');
    formData.append('file', file, file.name);
    const response = await axios.post(`${baseUrl}/files`, formData, {
        headers: {
            'Content-Type': 'application/json',
            Authorization: apiKey,
        } as RawAxiosRequestHeaders,
    });

    console.log(response.data);

    return response.data;
}

async function createThreadAndRun(assistant: string, message: Message): Promise<Run> {
    const response = await axios.post(`${baseUrl}/threads/runs`, {
        assistant_id: assistant,
        thread: {
            messages: [message],
        },
        tool_choice: {type: 'file_search'},
    }, {
        headers: {
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
            Authorization: apiKey,
        } as RawAxiosRequestHeaders,
    });

    console.log(response.data);

    return response.data;
}

async function retrieveRun(thread: string, runId: string): Promise<Run> {
    const response = await axios.get(`${baseUrl}/threads/${thread}/runs/${runId}`, {
        headers: {
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
            Authorization: apiKey,
        } as RawAxiosRequestHeaders,
    });

    console.log(response.data);

    return response.data;
}

async function listMessages(thread: string, run: string): Promise<Message[]> {
    const response = await axios.get(`${baseUrl}/threads/${thread}/messages`, {
        params: {run_id: run},
        headers: {
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2',
            Authorization: apiKey,
        } as RawAxiosRequestHeaders,
    });

    console.log(response.data);

    return response.data.data;
}

function delay(ms: number): Promise<void> {
    return new Promise(res => setTimeout(res, ms));
}

export class ChatGpt {
    messages: Message[] = [];

    async sendMessage(message: string, options: { json?: boolean }): Promise<Choice> {
        this.messages.push({role: 'user', content: message});
        console.log(this.messages);

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
