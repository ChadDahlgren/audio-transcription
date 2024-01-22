import { OpenAIService } from "./openai.service";

export interface Section {
    section: number;
    summary: string;
    actionItems: string[];
    bulletPoints: string[];
    paragraph: Paragraph[];
    rawTextofSection: string;
}

export interface Sections {
    sections: Section[];
}

export interface Paragraph {
    order: number;
    text: string;
}

export class SummaryBuilder {
    
    private textToSummarize: object;

    private summary: any;

    async setTextToSummarize(text: object): Promise<void> {
        this.textToSummarize = text;
    }

    async buildSummary() {

        this.summary = await this.buildSections(this.textToSummarize);

        for (const section of this.summary.sections) {
            const generatedParagraphs = await this.buildParagraphs(section.rawTextofSection);
            section.paragraphs = generatedParagraphs;
        }

        return this.summary;
    }

    async buildSections(transcriptions: object) {

        const outputStructure = '{"sections":[{"section":1,"summary":"","bulletPoints":["bulletpoint 1"],"paragraphs":[],"rawTextofSection":""},{"section":2,"summary":"","bulletPoints":["bulletpoint 1"],"paragraphs":[],"rawTextofSection":""}]}';
        const instructions = 'Included is text from many audio files that have been transcribed. The parts are in order. Combine it together as that is how the original audio file was. If there are parts where things are repeated many times in a row, as if a transcribe error happened, please sanitize those. Take the full text and based on logical sections, break them apart into paragraphs to make it more human readable. For each section create a summary of that section. Include the full raw text of each section. Leave the paragraph property as an empty array in the JSON structure.';
        const combinedInstructions = instructions.concat(" ", outputStructure, " Input: ", JSON.stringify(transcriptions));
        //console.log('combinedInstructions', combinedInstructions);
        
        const openai = new OpenAIService('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', 'org-qIiv0wBFOklM1hRDiXxcUidx');
        const sections = await openai.chatGPT(combinedInstructions);

        return sections;
    }

    async buildParagraphs(text: string) {
        const outputStructure = '{"paragraphs":[{"order":1,"text":""},{"order":2,"text":""}]}';
        const instructions = 'I want to break this text down into paragraphs that make it easier for humans to read thru. Use this structure:';
        const combinedInstructions = instructions.concat(" ", outputStructure, " Input: ", text);
        
        const openai = new OpenAIService('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', 'org-qIiv0wBFOklM1hRDiXxcUidx');
        const paragraphs = await openai.chatGPT(combinedInstructions);

        return paragraphs;
    }

}