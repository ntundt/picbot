import { AbstractUser } from './User';
import { SocialNetwork } from './SocialNetworks';
import IAttachment from './IAttachment';

export default interface IMessage {

    /**
     * Object received from source network’s API
     */
    //object: any;
    
    /**
     *  Social network or messenger message came from
     */
    habitat: SocialNetwork;
    
    getSender(): AbstractUser;
    getSenderId(): number;
    getPeerId(): number;
    getText(): string;

    hasAttachments(): boolean;
    getAttachments(): IAttachment[];

}
