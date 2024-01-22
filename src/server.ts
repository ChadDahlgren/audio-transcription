import 'dotenv/config';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import multipart from '@fastify/multipart';
import { OpenAIService } from './openai.service';

import { AudioFile } from './audio-file';
import { SummaryBuilder } from './text-summary';
import { FileManager } from './file-manager';

const fastify = Fastify({ logger: true });

fastify.register(multipart, {
    limits: {
        fileSize: 500000000 // For multipart forms, the max file size in bytes (500MB)
    }
});

fastify.get(
    '/',
    function handler(request: FastifyRequest, reply: FastifyReply) {}
);

fastify.post(
    '/transcribe',
    async function handler(request: FastifyRequest, reply: FastifyReply) {
        const data = await request.file();

        if (!data) {
            return reply.code(400).send({ error: 'No file provided' });
        }

        const fileBuffer = await data.toBuffer();

        if (!data.filename) {
            return reply.code(400).send({ error: 'No filename provided' });
        }

        try {
            const fileManager = new FileManager();
            const audioFile = new AudioFile();

            await fileManager.saveFile(data, fileBuffer);
            await audioFile.setFileInfo(await fileManager.getFileInfo());
            const audioResponse = await audioFile.split();

            if (audioResponse) {
                const openAIService = new OpenAIService();
                const transcriptions = await Promise.all(
                    audioResponse.map((audio) =>
                        openAIService.transcribeAudio(audio)
                    )
                );

                if (transcriptions) {
                    const summary = new SummaryBuilder();
                    await summary.setTextToSummarize(transcriptions);
                    const summarySections = await summary.buildSummary();
                    console.log('Summary Sections', summarySections);

                    await fileManager.saveSummaryFile(summarySections);
                    await fileManager.saveSummaryHtml(
                        await summary.buildHtmlSummary()
                    );

                    return reply.code(200).send({ summarySections });
                }
            }
        } catch (err) {
            return reply.code(500).send({ error: err });
        }
    }
);

fastify.listen({ port: 5501, host: '0.0.0.0' }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
