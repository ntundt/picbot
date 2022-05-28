import express from 'express';
import Bot from './BotInterface/Bot';
import * as config from '../config.json';
import VKMessage from './BotInterface/VKMessage';
import { UserCreator, VKUser } from './BotInterface/User';
import TelegramMessage from './BotInterface/TelegramMessage';
import TelegramInterface from './BotInterface/TelegramInterface';

let apiRouter = express.Router();

apiRouter.use(express.json());

apiRouter.post('/vkCallbackApiHandler', async function(request, response) {
    try {
        switch (request.body.type) {
            case 'confirmation':
                response.end(config.vk.confirmationToken);
                return;
            case 'message_new':
                let message: VKMessage = new VKMessage(request.body.object.message);
                if (message.hasPayload()) {
                    Bot.dispatchPayload(message.getSender(), message.getPayload());
                } else if (Bot.isUserPending(message.getSender()) || message.getText().charAt(0) === '/') {
                    await Bot.processMessage(message);
                }
                console.log(JSON.stringify(request.body, null, 4));
                break;
            default:
                console.warn('Received an action of unsupported type', request.body);
                break;
        }
    } catch (e) { (new VKUser(165054978)).message(e.message + '\n' + (e.stack ? e.stack : '')); }
    response.end('ok');
});

apiRouter.post('/telegramEventHandler', async function(request, response) {
    console.log(JSON.stringify(request.body, null, 4));

    if (typeof request.body.callback_query !== 'undefined') {
        let sender = UserCreator.create('Telegram', request.body.callback_query.message.chat.id);
        Bot.dispatchPayload(sender, JSON.parse(request.body.callback_query.data));
    } else if (typeof request.body.message !== 'undefined') {
        let message: TelegramMessage = new TelegramMessage(request.body.message);
        if (message.hasAttachments() && message.isMediaGroupMember()) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (Bot.isUserPending(message.getSender()) || message.getText().charAt(0) === '/') {
            Bot.processMessage(message);
        }
    } else {
        console.warn('Received a message of unsupported type');
    }
    response.end();
});

apiRouter.get('/test', function(request, response) {
    response.end('Test successful');
})

export default apiRouter;
