import stringFormat from '../../utils/stringFormat';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import * as strings from '../../../strings.json';
import { UserCreator } from '../User';
import Validator from '../../utils/Validator';
import Server from '../Server';

let nickname: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();
    let oldNickname = await user.getNickname();
    let argv = message.getText().split(' ');

    // TODO: Add check if user is banned

    if (argv.length === 1) {
        let changed = new Date((await user.getEntity()).nicknameChangedTimestamp * 1000);
        let changedStr = `${changed.getDate() < 10 ? '0' + changed.getDate() : changed.getDate()}`
            + `.${changed.getMonth() + 1 < 10 ? '0' + (changed.getMonth() + 1) : changed.getMonth() + 1}`
            + `.${changed.getFullYear()}`
            + ` ${changed.getHours() < 10 ? '0' + changed.getHours() : changed.getHours()}`
            + `:${changed.getMinutes() < 10 ? '0' + changed.getMinutes() : changed.getMinutes()}`
            + `:${changed.getSeconds() < 10 ? '0' + changed.getSeconds() : changed.getSeconds()}`;
        user.message(stringFormat(strings.your_nickname_is, oldNickname, changedStr));
        return;
    }

    if ((await user.getEntity()).nicknameChangedTimestamp * 1000 + 86400000 > Date.now()) {
        user.message(strings.error.nickname_changed_less_than_24_hours_ago);
        return;
    }

    if (!Validator.isMinecraftNickname(argv[1])) {
        user.message(strings.error.nickname_invalid);
        return;
    }

    if (await UserCreator.nicknameTaken(argv[1])) {
        user.message(stringFormat(strings.error.nickname_already_used, argv[1]));
        return;
    }

    await user.setNickname(argv[1]);
    Server.command(`whitelist remove ${oldNickname}`);
    Server.command(`whitelist add ${argv[1]}`);
    user.message(strings.nickname_whitelisted);
}

export default nickname;