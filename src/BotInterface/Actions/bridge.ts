import Bot from '../Bot';
import { AbstractUser } from '../User';
import * as strings from '../../../strings.json';

let bridgeEnd: (value: any) => void;

let relay = async (user1: AbstractUser, user2: AbstractUser) => {
    let msg = await Bot.input(user1);
    if (msg.getText() === '/exit') {
        user1.message(strings.bridge.aborted);
        user2.message(strings.bridge.aborted_by_interlocutor);
        Bot.abortInput(user2);
        bridgeEnd(void 0);
        return;
    }
    user2.message(msg.getText());
    await relay(user1, user2);
}

// Запустить диалог между пользователями через бота
let bridge = (user1: AbstractUser, user2: AbstractUser) => {
    relay(user1, user2);
    relay(user2, user1);
    return new Promise(resolve => {
        bridgeEnd = resolve;
    });
}

export default bridge;