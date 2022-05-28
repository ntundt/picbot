import IMessage from './IMessage';
import { SocialNetwork } from './SocialNetworks';
import { TelegramUser } from './User';
import IAttachment from './IAttachment';
import TelegramAttachment from './TelegramAttachment';

export default class TelegramMessage implements IMessage {

    private static mediaGroupRegistry: IAttachment[][] = [];

    public readonly object: any;
    public readonly habitat: SocialNetwork;

    public constructor(object: any) {
        this.object = object;

        if (this.hasAttachments() && typeof this.object.media_group_id !== 'undefined') {
            if (typeof TelegramMessage.mediaGroupRegistry[this.object.media_group_id] !== 'undefined') {
                TelegramMessage.mediaGroupRegistry[this.object.media_group_id].push(new TelegramAttachment(this.object));
            } else {
                TelegramMessage.mediaGroupRegistry[this.object.media_group_id] = [new TelegramAttachment(this.object)];
            }
        }
    }

    public getSender(): TelegramUser {
        return new TelegramUser(this.object.from.id);
    }

    public getSenderId(): number {
        return this.object.from.id
    }

    public getPeerId(): number {
        return 0;
    }

    public getText(): string {
        return this.object.text ?? this.object.caption ?? ' ';
    }

    public hasAttachments(): boolean {
        return typeof this.object.photo !== 'undefined'
        || typeof this.object.video !== 'undefined'
        || typeof this.object.document !== 'undefined'
        || typeof this.object.audio !== 'undefined'
        || typeof this.object.animation !== 'undefined'
        || typeof this.object.voice !== 'undefined'
        || typeof this.object.video_note !== 'undefined'
        || typeof this.object.location !== 'undefined';
    }

    public getAttachments(): IAttachment[] {
        if (typeof this.object.media_group_id !== 'undefined') {
            return TelegramMessage.mediaGroupRegistry[this.object.media_group_id];
        }
        if (this.hasAttachments()) {
            return [new TelegramAttachment(this.object)];
        }
        return [];
    }

    public isMediaGroupMember(): boolean {
        return typeof this.object.media_group_id !== 'undefined';
    }

}