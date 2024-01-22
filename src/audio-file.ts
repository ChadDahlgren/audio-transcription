import { exec } from 'child_process';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class AudioFile {
    private fileInfo: {
        namePrefix: string;
        fullName: string;
        extension: string;
        directory: string;
        fullPath: string;
        splitDirectory: string;
    }
    private segmentDuration: number = 20 * 60;
    private splitDirectoryName = "split";

    constructor() {}

    async profile() {
        const { stdout } = await execPromise(
            `ffprobe -v error -show_format -show_streams ${this.fileInfo.fullPath}`
        );
        return stdout;
    }

    async split() {
        if (this.fileInfo.fullPath) {
    
            await fsPromises.mkdir(this.fileInfo.splitDirectory, { recursive: true });
            const { stdout } = await execPromise(
                `ffmpeg -i ${this.fileInfo.fullPath} -f segment -segment_time ${this.segmentDuration} -c copy ${this.fileInfo.splitDirectory+"/"+this.fileInfo.namePrefix}-%03d.mp3`
            );
            return await this.buildFileList();
        }
    }

    async buildFileList() {
        const fileList = await fsPromises.readdir(this.fileInfo.splitDirectory+"/");
        const fileArray = fileList.map((file) => path.join(this.fileInfo.splitDirectory+"/", file));

        return fileArray;
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
}
