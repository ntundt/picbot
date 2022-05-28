import stringFormat from '../../utils/stringFormat';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import * as strings from '../../../strings.json';
import Notifier from '../Notifier';
import BotCommandDispatcher from '../Bot';

let unsubscribe: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();

    let userSubscriptions = await user.getSubscriptions();
    let allSubscriptions = await Notifier.getAllSubscriptions();

    user.message(stringFormat(strings.send_needed_subscriptions, allSubscriptions.join('\n'), userSubscriptions.join('\n')));
    let res = (await BotCommandDispatcher.input(user)).getText();

    let subscriptionsToRemove: string[] = [];

    allSubscriptions.forEach((value) => {
        if (res.includes(value)) {
            subscriptionsToRemove.push(value);
        }
    });

    await user.removeSubscriptions(subscriptionsToRemove);

    user.message(strings.subscriptions_removed);
}

export default unsubscribe;