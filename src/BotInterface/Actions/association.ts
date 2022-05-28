import IMessage from '../IMessage';
import { ButtonColor, Keyboard } from '../Keyboard';
import botCommandHandler from '../Types/botCommandHandler';
import { UserCreator } from '../User';
import { s } from '../../utils/stringFormat';

let association: botCommandHandler = async (message: IMessage): Promise<void> => {
    let user = message.getSender();
    let userEntity = await user.getEntity(['association', 'head']);

    if (userEntity.association) {
        if (UserCreator.getByEntity(userEntity.association.head).equals(user)) {

        }
    } else {
        let keyboard = new Keyboard();
        keyboard.addButton(s('association.create'), `{"type":"association_create"}`, ButtonColor.default);

        user.messageLocale(s('association.you_are_not_a_member'), { keyboard });
    }
}

export default association;