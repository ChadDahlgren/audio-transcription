import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import OpenAI from 'openai';

export interface Transcription {
    text: string;
}

export class OpenAIService {
    private openAIKey: string;
    private orgId: string;
    private model: string;

    constructor(apiKey: string, orgId: string, model: string = 'gpt-4') {
        this.openAIKey = apiKey;
        this.orgId = orgId;
        this.model = model;
    }

    async transcribeAudio(audioFile: string): Promise<Transcription> {
        console.log(audioFile);
        const formData = new FormData();
        formData.append('file', fs.createReadStream(audioFile));
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');
        formData.append('temperature', '0');
        formData.append('language', 'en');

        try {
            const response = await axios.post(
                'https://api.openai.com/v1/audio/transcriptions',
                formData,
                {
                    headers: {
                        ...formData.getHeaders(),
                        Authorization: `Bearer ${this.openAIKey}`,
                        Accept: 'application/json'
                    }
                }
            );

            console.log('Transcription response: ', response.data);
            return response.data as Transcription;
        } catch (error) {
            console.error('Error during transcription: ', error);
            throw error;
        }
    }

    async chatGPT(prompt: string) {
        const openai = new OpenAI({
            apiKey: this.openAIKey,
            organization: this.orgId
        });
        const completion = await openai.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: this.model
        });

        if (completion && completion.choices && completion.choices.length > 0) {
            const messageContent = completion.choices[0].message.content; // Access the content of the message
            console.log('Extracted Message:', messageContent);
            if (messageContent) 
                return JSON.parse(messageContent); // or process this content as needed
        }

        return completion;
    }
}
