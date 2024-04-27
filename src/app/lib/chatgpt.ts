import axios from 'axios';

type message = {
    role: 'user' | 'system',
    content: string,
}

export class ChatGpt {
    private messages: message[] = [];

    async chat(message: string): Promise<string> {
        this.messages.push({role: 'user', content: message});
        const response = await axios.post('https://https://training.nerdbord.io/api/v1/openai/chat/completions', {
            'model': 'gpt-4-turbo',
            'messages': this.messages,
        }, {
            headers: {
                Authorization: '',
            }
        });

        console.log(response.data);

        return response.data;
    }
}
