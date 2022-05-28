import stringFormat from '../../utils/stringFormat';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import * as strings from '../../../strings.json';
import Notifier from '../Notifier';
import BotCommandDispatcher from '../Bot';

let subscribe: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();

    let userSubscriptions = await user.getSubscriptions();
    let allSubscriptions = await Notifier.getAllSubscriptions();

    user.message(stringFormat(strings.send_needed_subscriptions, allSubscriptions.join('\n'), userSubscriptions.join('\n')));
    let res = (await BotCommandDispatcher.input(user, async (message: IMessage): Promise<boolean> => {
        return allSubscriptions.some(subscription => message.getText().includes(subscription));
    })).getText();

    let subscriptionsToAdd: string[] = [];

    allSubscriptions.forEach((value) => {
        if (res.includes(value)) {
            subscriptionsToAdd.push(value);
        }
    });

    if (subscriptionsToAdd.length)
    await user.addSubscriptions(subscriptionsToAdd);

    user.message(strings.subscriptions_added);
}

export default subscribe;