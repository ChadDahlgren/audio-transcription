import { SecureContextOptions } from "tls";
import { OpenAIService } from "./openai.service";

export interface Section {
    section: number;
    summary: string;
    actionItems: string[];
    bulletPoints: string[];
    paragraphs: Paragraph[];
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
            section.paragraphs = generatedParagraphs.paragraphs;
        }

        return this.summary;
    }

    async buildSections(transcriptions: object) {

        const outputStructure = '{"sections":[{"section":1,"summary":"","bulletPoints":["bulletpoint 1"],"paragraphs":[],"rawTextofSection":""},{"section":2,"summary":"","bulletPoints":["bulletpoint 1"],"paragraphs":[],"rawTextofSection":""}]}';
        const instructions = 'Included is text from many audio files that have been transcribed. The parts are in order. Combine it together as that is how the original audio file was. If there are parts where things are repeated many times in a row, as if a transcribe error happened, please sanitize those. Take the full text and based on logical sections, break them apart into paragraphs to make it more human readable. For each section create a summary of that section. Include the full raw text of each section. Leave the paragraph property as an empty array in the JSON structure.';
        const combinedInstructions = instructions.concat(" ", outputStructure, " Input: ", JSON.stringify(transcriptions));
        
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

    async buildHtmlSummary(){
        const template = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Council Meeting Notes</title>
            <style>
                #content {
                    margin: 20px;
                    padding: 20px;
                    border: 1px solid #ddd;
                }
        
                .section {
                    margin-bottom: 30px;
                }
        
                .summary, .bullet-points, .paragraphs {
                    margin-top: 10px;
                }
        
                .bullet-points li {
                    list-style-type: square;
                }
        
                .paragraph {
                    text-indent: 20px;
                    margin-top: 5px;
                }
            </style>
        </head>
        <body>
            <div id="content">
                <!-- Dynamic content will go here -->
            </div>
            <script src="script.js"></script> <!-- Link to your JavaScript file -->
        </body>
        </html>
        `;

        const generatedHtml = await this.buildHtmlFromJson(this.summary);
        
        const html = template.replace('<!-- Dynamic content will go here -->', generatedHtml);

        return html;
    }

    async buildHtmlFromJson(data: Sections) {
        let htmlContent = '';
    
        data.sections.forEach(section => {
            let sectionHtml = '<div class="section">';
    
            // Add summary
            sectionHtml += `<p class="summary">${section.summary}</p>`;
    
            // Add bullet points
            sectionHtml += '<ul class="bullet-points">';
            section.bulletPoints.forEach(point => {
                sectionHtml += `<li>${point}</li>`;
            });
            sectionHtml += '</ul>';
    
            // Add paragraphs
            sectionHtml += '<div class="paragraphs">';
            section.paragraphs.forEach(paragraph => {
                sectionHtml += `<p class="paragraph">${paragraph.text}</p>`;
            });
            sectionHtml += '</div>';
    
            sectionHtml += '</div>'; // Close section div
            htmlContent += sectionHtml;
        });
    
        return htmlContent;
    }
}