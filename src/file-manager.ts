import path from 'path';
import { promises as fsPromises } from 'fs';

export interface FileInfo {
        original: string;
        namePrefix: string;
        extension: string;
        directory: string;
        fullPath: string;
        splitDirectory: string;
}

export class FileManager {
    private fileInfo: FileInfo;
    private splitDirectoryName = "split";
    private summaryDataName = "summary.json";
    private summaryHtmlName = "summary.html";
    
    constructor() {
        console.log('FileManager constructor');
    }

    async getFileInfo() {
        return this.fileInfo;
    }   

    async saveFile(data: any, fileBuffer: Buffer) {
        try {
            const uniqueFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
            const fileExtension = path.extname(data.filename).toLowerCase();

            const dirPath = path.join(
                __dirname,
                '../audio-files/' + uniqueFileName
            );
            const newFilePath = path.join(
                dirPath,
                `${uniqueFileName}.mp3`
            );

            const newOriginalName = uniqueFileName+"-orginal"+fileExtension;

            await fsPromises.mkdir(dirPath, { recursive: true });
            await fsPromises.mkdir(dirPath+"/"+this.splitDirectoryName, { recursive: true });
            await fsPromises.writeFile(dirPath+"/"+newOriginalName, fileBuffer);

           return this.fileInfo = {
                original: newOriginalName,
                namePrefix: uniqueFileName,
                extension: ".mp3",
                directory: dirPath,
                fullPath: newFilePath,
                splitDirectory: dirPath+"/"+this.splitDirectoryName
            }
        } catch (err) {
            throw err;
        }
    }

    async saveSummaryFile(summary: object) {
        try {
            const dirPath = path.join(
                __dirname,
                '../audio-files/' + this.fileInfo.namePrefix
            );
            const newFilePath = path.join(
                dirPath,
                this.summaryDataName
            );

            await fsPromises.writeFile(newFilePath, JSON.stringify(summary));

        } catch (err) {
            throw err;
        }
    }

    async saveSummaryHtml(summary: string) {
        try {
            const dirPath = path.join(
                __dirname,
                '../audio-files/' + this.fileInfo.namePrefix
            );
            const newFilePath = path.join(
                dirPath,
                this.summaryHtmlName
            );

            await fsPromises.writeFile(newFilePath,summary);

        } catch (err) {
            throw err;
        }
    }
}