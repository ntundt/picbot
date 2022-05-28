import IAttachment from './IAttachment';
import IMessage from './IMessage';
import { SocialNetwork } from './SocialNetworks';
import { VKUser } from './User';
import VKAttachment from './VKAttachment';


export default class VKMessage implements IMessage {
    
    private object: any;
    public readonly habitat: SocialNetwork = 'VK';
    
    public constructor(object: any) {
        this.object = object;
    }
    
    public getSender(): VKUser {
        return new VKUser(this.getSenderId());
    }

    public getSenderId(): number {
        return this.object.from_id;
    }

    public getPeerId(): number {
        return this.object.peer_id;
    }
    
    public getText(): string {
        return this.object.text;
    }

    public hasPayload(): boolean {
        try {
            return typeof this.object.payload !== 'undefined';
        } catch (e) {
            return false;
        }
    }

    public getPayload(): object {
        return JSON.parse(this.object.payload);
    }

    public hasAttachments(): boolean {
        return typeof this.object.attachments !== 'undefined';
    }

    public getAttachments(): IAttachment[] {
        let attachments: IAttachment[] = [];

        for (let attachment of this.object.attachments) {
            attachments.push(new VKAttachment(attachment))
        }

        return attachments;
    }
}
