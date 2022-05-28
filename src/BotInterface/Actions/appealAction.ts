import stringFormat from '../../utils/stringFormat';
import AppealManager from '../AppealManager';
import { AbstractUser } from '../User';
import appealChangeStatus from './appealChangeStatus';
import bridge from './bridge';
import * as strings from '../../../strings.json';
import { botPayloadHandler } from '../Types/botPayloadHandler';

let appealAction: botPayloadHandler = async (user: AbstractUser, payload: any) => {
    if (await appealChangeStatus(user, payload) && payload.act === 'go_to_dialog') {
        let author = await AppealManager.getAuthor(payload.id)
        user.message(stringFormat(strings.bridge.player_dialogue, await author.getNickname()));
        author.message(strings.bridge.admin_dialogue);
        await bridge(user, author);
    }
}

export default appealAction;