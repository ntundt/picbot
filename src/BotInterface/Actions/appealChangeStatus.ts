import stringFormat from '../../utils/stringFormat';
import AppealManager from '../AppealManager';
import { appealStatus } from '../Types/appealStatus';
import { AbstractUser } from '../User';
import * as strings from '../../../strings.json';

let appealChangeStatus = async (user: AbstractUser, payload: any): Promise<boolean> => {
    let newStatus = appealStatus.open;
    let notif = true;

    if (payload.act === 'take_assignment') {
        newStatus = appealStatus.working;
    } else if (payload.act === 'satisfy') {
        newStatus = appealStatus.resolved;
    } else if (payload.act === 'close')  {
        newStatus = appealStatus.closed;
    } else if (payload.act === 'close_no_notif') {
        newStatus = appealStatus.working;
        notif = false;
    } else if (payload.act === 'go_to_dialog') {
        newStatus = appealStatus.working;
        notif = false;
    }

    if (!(await AppealManager.someoneWorking(payload.id))) {
        await AppealManager.setStatus(payload.id, newStatus, notif);
        await AppealManager.setWorking(payload.id, user);
        user.message(strings.appeal_status_set);
        return true;
    }

    let working = await AppealManager.whoIsWorking(payload.id);
    if (!working.equals(user)) {
        user.message(stringFormat(strings.appeal_someone_working, await working.getNickname()));
        return false;
    }
    
    await AppealManager.setStatus(payload.id, newStatus, notif);
    await AppealManager.setWorking(payload.id, user);
    user.message(strings.appeal_status_set);
    return true;
}

export default appealChangeStatus;