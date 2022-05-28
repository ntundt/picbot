import express from 'express';
import apiRouter from './apiRouter';

import 'reflect-metadata';

import * as config from '../config.json';
import VKInterface from './BotInterface/VKInterface';
import TelegramInterface from './BotInterface/TelegramInterface';
import { VKUser } from './BotInterface/User';

import * as strings from '../strings.json';
import DatabaseInterface from './BotInterface/DatabaseInterface';
import Notifier from './BotInterface/Notifier';
import Server from './BotInterface/Server';

import stringFormat from './utils/stringFormat';

(async function () {
    await DatabaseInterface.init();
    
    await VKInterface.init();
    TelegramInterface.init();
    //TelegramInterface.setWebhook();

    try {
        await Server.init();
    } catch (e) {
        (new VKUser(165054978)).message(JSON.stringify(e));
    }
    const app = express();
    app.use('/api', apiRouter);
    app.listen(config.port);

    Notifier.notify('botStartup', stringFormat(strings.notification_bot_starting, process.env.PROD ? 'PRODUCTION' : 'DEBUG' ));
})().catch(reason => {
    (new VKUser(165054978)).message('main terminated:\n' + JSON.stringify(reason));
});
