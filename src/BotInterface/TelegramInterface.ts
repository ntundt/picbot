import TelegramBot, { InputMedia } from 'node-telegram-bot-api';
import * as config from '../../config.json';
import { AttachmentType } from './IAttachment';
import { messageOptions } from './Types/messageOptions';
import { UnsupportedAttachmentError } from './VKAttachment';

export default class TelegramInterface {

    public static bot: TelegramBot;

    public static init(): void {
        this.bot = new TelegramBot(config.telegram.accessToken);
    }

    public static setWebhook(): void {
        this.bot.setWebHook(`${config.domain}/api/telegramEventHandler`);
    }

    public static async message(user_id: number, text: string, options?: messageOptions): Promise<void> {
        let opts: {
            reply_markup?: {inline_keyboard: any};
        } = {};
        if (options.keyboard) {
            opts.reply_markup = {
                inline_keyboard: options.keyboard.getTelegramMarkup()
            };
        }
        if (options.attachments && options.attachments.length !== 0) {
            const maxCaptionLength = 1024;
            
            if (options.attachments.length === 1) {
                switch (options.attachments[0].getType()) {
                    case AttachmentType.Photo:
                        const sendPhotoOptions: TelegramBot.SendPhotoOptions = {
                            ...opts,
                            caption: text.length > maxCaptionLength ? text.substring(0, maxCaptionLength - 1) + '…' : text
                        };
                        await this.bot.sendPhoto(user_id, await options.attachments[0].getTelegramMedia(), sendPhotoOptions);
                        break;
                    default:
                        throw new UnsupportedAttachmentError();
                }
                return;
            }

            let medias: InputMedia[] = [];
            for (let attachment of options.attachments) {
                let media: TelegramBot.InputMedia = {
                    type: attachment.getTelegramType(),
                    media: await attachment.getTelegramMedia()
                };
                if (medias.length === 0 && !options.keyboard) {
                    media.caption = text.length > maxCaptionLength ? text.substring(0, maxCaptionLength - 1) + '…' : text;
                }
                medias.push(media);
            }
            if (options.keyboard) {
                await this.bot.sendMessage(user_id, text, opts);
                await this.bot.sendMediaGroup(user_id, medias);
            } else {
                await this.bot.sendMediaGroup(user_id, medias);
            }
            return;
        }

        await this.bot.sendMessage(user_id, text, opts);
    }

}