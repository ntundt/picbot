import IAttachment from '../IAttachment';
import { Keyboard } from '../Keyboard';

export type messageOptions = {
    keyboard?: Keyboard;
    attachments?: IAttachment[];
}