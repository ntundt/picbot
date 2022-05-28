import stringFormat from '../../utils/stringFormat';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import * as strings from '../../../strings.json';
import { UserCreator } from '../User';
import Validator from '../../utils/Validator';
import Server from '../Server';
import BotCommandDispatcher from '../Bot';
import AppealManager from '../AppealManager';

let appeal: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();

    user.message(strings.write_appeal);
    let appeal = await BotCommandDispatcher.input(user);

    await AppealManager.add(user, appeal.getText(), appeal.getAttachments());
    user.message(strings.appeal_added);
}

export default appeal;