import path from 'path';
import { promises as fsPromises } from 'fs';

export interface FileInfo {
        namePrefix: string;
        fullName: string;
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
            const fileName = uniqueFileName + fileExtension;

            const dirPath = path.join(
                __dirname,
                '../audio-files/' + uniqueFileName
            );
            const newFilePath = path.join(
                dirPath,
                `${uniqueFileName}${fileExtension}`
            );

            await fsPromises.mkdir(dirPath, { recursive: true });
            await fsPromises.mkdir(dirPath+"/"+this.splitDirectoryName, { recursive: true });
            await fsPromises.writeFile(newFilePath, fileBuffer);

           return this.fileInfo = {
                namePrefix: uniqueFileName,
                fullName: fileName,
                extension: fileExtension,
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