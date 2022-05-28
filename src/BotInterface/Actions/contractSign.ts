import { s } from '../../utils/stringFormat';
import DatabaseInterface from '../DatabaseInterface';
import Notifier from '../Notifier';
import { botPayloadHandler } from '../Types/botPayloadHandler';
import { AbstractUser, UserCreator } from '../User';

let contractSign: botPayloadHandler = async (user: AbstractUser, payload: any) => {
    let contract = await DatabaseInterface.contractRepository.findOne(payload.id, { relations: ['participants', 'participantsConfirmed'] });

    if (!contract) {
        user.messageLocale(s('contractreg.contract_does_not_exit'));
        return;
    }

    if (!contract.participants.some(participant => UserCreator.getByEntity(participant).equals(user))) {
        user.messageLocale(s('contractreg.you_do_not_participate'));
        return;
    }

    if (contract.participantsConfirmed.some(participant => UserCreator.getByEntity(participant).equals(user))) {
        user.messageLocale(s('contractreg.you_have_already_signed'));
        return;
    }

    let userEntity = await user.getEntity();
    contract.participantsConfirmed.push(userEntity);
    DatabaseInterface.contractRepository.save(contract);

    if (contract.participants.length == contract.participantsConfirmed.length) {
        user.messageLocale(s('contractreg.signed_effect_taken'));
        Notifier.notify('contracts', s('contractreg.contract_taken_effect', contract.id, contract.text, 
            contract.participants.map(particiapnt => particiapnt.nickname).join(', ')));
    } else {
        user.messageLocale(s('contractreg.signed'));
    }
    contract.participants.forEach(participantEntity => {
        let participant = UserCreator.getByEntity(participantEntity);
        if (!participant.equals(user)) {
            if (contract.participants.length == contract.participantsConfirmed.length) {
                participant.messageLocale(s('contractreg.player_signed_effect_taken', userEntity.nickname, contract.id));
            } else {
                participant.messageLocale(s('contractreg.player_signed', userEntity.nickname, contract.id));
            }
        }
    })
}

export default contractSign;