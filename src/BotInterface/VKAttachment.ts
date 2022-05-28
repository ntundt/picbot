import IAttachment, { AttachmentType } from './IAttachment';
import VKInterface from './VKInterface';

export class UnsupportedAttachmentError extends Error { }

export default class VKAttachment implements IAttachment {

    private object: any;
    private vkUploaded?: string;
    private telegramUploaded?: string;

    public constructor(object: any) {
        this.object = object;
    }

    public getType(): AttachmentType {
        switch (this.object.type) {
            case 'photo':
                return AttachmentType.Photo;
            default:
                return AttachmentType.Other;
        }
    }

    public getTelegramType(): 'photo' | 'video' {
        if (this.object.type === 'photo' || this.object.type === 'video') {
            return this.object.type;
        } else {
            throw new UnsupportedAttachmentError();
        }
    }

    public async saveLocally(): Promise<string> {
        
        return '';
    }

    public getMaxResolutionUrl(): string {
        switch (this.getType()) {
            case AttachmentType.Photo:
                return this.object.photo.sizes.sort((a: any, b: any) => b.height + b.width - a.height - a.width)[0].url;
            case AttachmentType.Other:
                throw new UnsupportedAttachmentError();
        }
    }

    /**
     * Загрузить приложение ВКонтакте
     * @returns строка вида '<тип приложения><id владельца>_<id фото>_<access_key>'
     */
    public async uploadToVK(): Promise<string> {
        if (typeof this.vkUploaded !== 'undefined') {
            return this.vkUploaded;
        }
        let server: any;
        switch (this.getType()) {
            case AttachmentType.Photo:
                server = await VKInterface.vk.uploader.getUploadURL('photos.getMessagesUploadServer');
                let url = this.getMaxResolutionUrl();
                let file = await VKInterface.vk.uploader.uploadFetchedFile(server, url);
                let fileData = (await VKInterface.vk.post('photos.saveMessagesPhoto', file))[0];
                this.vkUploaded = `photo${fileData.owner_id}_${fileData.id}_${fileData.access_key}`;
                break;
            case AttachmentType.Other:
                throw new UnsupportedAttachmentError();
        }
        return this.vkUploaded;
    }

    /**
     * Получить строку media из Telegram Bot API
     * @returns строка media
     */
    public async getTelegramMedia(): Promise<string> {
        if (typeof this.telegramUploaded !== 'undefined') {
            return this.telegramUploaded;
        }
        
        /*let inputMedia: any = {};
        switch (this.getType()) {
            case AttachmentType.Photo:
                inputMedia.type = 'photo';
                break;
            default:
                throw new UnsupportedAttachmentError();
        }*/
        
        return this.getMaxResolutionUrl();
    }

}