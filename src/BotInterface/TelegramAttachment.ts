import IAttachment, { AttachmentType } from './IAttachment';
import TelegramInterface from './TelegramInterface';
import { UnsupportedAttachmentError } from './VKAttachment';
import VKInterface from './VKInterface';
import * as config from '../../config.json';
import https, { request } from 'https';
import { ReadStream } from 'typeorm/platform/PlatformTools';
import { Blob } from 'buffer';
import { deflateRaw } from 'zlib';
let FormData = require('form-data');

let fetch = require('node-fetch');

export default class TelegramAttachment implements IAttachment {

    private vkUploaded?: string;
    private type: AttachmentType;
    private object: any;

    public constructor(messageObject: any) {
        if (typeof messageObject.photo !== 'undefined') {
            this.type = AttachmentType.Photo;
        } else {
            this.type = AttachmentType.Other;
        }

        if (this.type == AttachmentType.Photo) {
            this.object = messageObject.photo;
        }
    }

    public getType(): AttachmentType {
        return this.type;
    }
    
    public getTelegramType(): 'photo' | 'video' {
        switch (this.type) {
            case AttachmentType.Photo:
                return 'photo';
            case AttachmentType.Video:
                return 'video';
            default:
                throw new UnsupportedAttachmentError();
        }
    }

    private getMaxResolution(): any {
        return this.object.sort((a: any, b: any) => b.width + b.height - a.width - a.height)[0];
    }

    public async getMaxResolutionUrl(): Promise<string> {
        switch (this.type) {
            case AttachmentType.Photo:
                let file_id = this.getMaxResolution().file_id;
                return `https://api.telegram.org/file/bot${config.telegram.accessToken}/${(await TelegramInterface.bot.getFile(file_id)).file_path}`;
            default:
                throw new UnsupportedAttachmentError();
        } 
    }

    public async saveLocally(): Promise<string> {
        return '';
    }

    public async uploadToVK(): Promise<string> {
        if (typeof this.vkUploaded !== 'undefined') {
            return this.vkUploaded;
        }
        
        switch (this.getType()) {
            case AttachmentType.Photo:
                const server = await VKInterface.vk.uploader.getUploadURL('photos.getMessagesUploadServer');
                const maxResUrl = await this.getMaxResolutionUrl();
                console.log('maxresurl:',maxResUrl);
                
                let fileBuff: Buffer = await new Promise(resolve => {
                    let buffers: Buffer[] = [];
                    https.get(maxResUrl, res => {
                        res.on('data', chunk => {
                            buffers.push(chunk);
                        });
                        res.on('end', () => {
                            resolve(Buffer.concat(buffers));
                        });
                    });
                });
                let fileStream = ReadStream.from(fileBuff);

                let data = new FormData();
                data.append('photo', fileStream, {contentType: 'image/jpeg', filename: 'test.jpg'});
                const opts = {
                    method: 'POST',
                    body: data,
                    headers: {
                        ...(data.getHeaders())
                    }
                };
                console.log(opts);
                let response = await fetch(server, opts);

                console.log(await response.json());
                
                console.log(data.getHeaders());

                //let file = await VKInterface.vk.uploader.uploadFile();
                // let file = await VKInterface.vk.uploader.uploadFile(server, fileStream);
                // this.vkUploaded = `photo${file.owner_id}_${file.id}_${file.access_key}`;
                // console.log(this.vkUploaded);
                break;
            case AttachmentType.Other:
                throw new UnsupportedAttachmentError();
        }

        return this.vkUploaded;
    }

    public async getTelegramMedia(): Promise<string> {
        return this.getMaxResolution().file_id;
    }

}