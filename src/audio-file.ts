import { exec } from 'child_process';
import path from 'path';
import { promises as fsPromises } from 'fs';
import { promisify } from 'util';
import { FileInfo } from './file-manager';

const execPromise = promisify(exec);

export class AudioFile {
    private fileInfo: {
        original: string;
        namePrefix: string;
        extension: string;
        directory: string;
        fullPath: string;
        splitDirectory: string;
    }
    private segmentDuration: number = 6 * 60;

    constructor() {
    }

    async setFileInfo(fileInfo: FileInfo) {
        this.fileInfo = fileInfo;
    }

    async profile() {
        const { stdout } = await execPromise(
            `ffprobe -v error -show_format -show_streams ${this.fileInfo.fullPath}`
        );
        return stdout;
    }

    async convertFormat(){
        if (this.fileInfo.fullPath) {
            const { stdout } = await execPromise(
                `ffmpeg -i ${this.fileInfo.directory}/${this.fileInfo.original} -acodec libmp3lame -ab 192k ${this.fileInfo.directory}/${this.fileInfo.namePrefix}.mp3`
            ); 
            this.fileInfo.extension = ".mp3";
            return stdout;
        }
    }

    async split() {
        if (this.fileInfo.fullPath) {
    
            await this.convertFormat();
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
}
