import IMessage from './IMessage';
import * as commands from '../../commands.json';
import * as strings from '../../strings.json';
import { AbstractUser } from './User';
import Notifier from './Notifier';
import stringFormat from '../../src/utils/stringFormat';
import start from './Actions/start';
import help from './Actions/help';
import nickname from './Actions/nickname';
import subscribe from './Actions/subscribe';
import unsubscribe from './Actions/unsubscribe';
import appeal from './Actions/appeal';
import appealAction from './Actions/appealAction';
import contractSign from './Actions/contractSign';
import contractreg from './Actions/contractreg';
import CommandHandler from './Types/CommandHandler';
import rcon from './Actions/rcon';
import { config } from './Actions/config';
import cmd from './Actions/cmd';

export default class Bot {

    public static async init() {
        // todo: check if all users are whitelisted
        //let whitelisted = await Server.command('whitelist list');
        //for (let i = 0; i)
    }

    private static commandHandlers: CommandHandler[] = [];

    private static pending: {
        resolve: (value: IMessage) => void, 
        reject: () => void,
        validator: (value: IMessage) => Promise<boolean>,
        user: AbstractUser
    }[] = [];

    /**
     * Ожидает ли бот сообщения от пользователя
     * @param user 
     * @returns 
     */
    public static isUserPending(user: AbstractUser) {
        return this.pending.some((value) => value.user.equals(user));
    }

    /**
     * Ожидать ввода пользователем значения
     * @param user 
     * @param validator функция-валидатор ввода. Если возвращает true, завершает промис с успехом; если false, то ждет ввода дальше
     * @returns промис с объектом сообщения
     */
    public static input(user: AbstractUser, validator: (message: IMessage) => Promise<boolean> = async () => true): Promise<IMessage> {
        return new Promise((resolve, reject) => {
            Bot.pending.push({ resolve, reject, validator, user });
        });
    }

    /**
     * Отменить ввод значения
     * @param user 
     * @returns был ли ввод значения отменен
     */
    public static abortInput(user: AbstractUser): boolean {
        let rejectedAnything = false;
        for (let i = 0; i < this.pending.length; i++) {
            if (this.pending[i].user.equals(user)) {
                this.pending[i].reject();
                this.pending.splice(i, 1);
                i--;
                rejectedAnything = true;
            }
        }
        return rejectedAnything;
    }

    private static async dispatchMessage(message: IMessage) {
        for (let i = 0; i < this.pending.length; i++) {
            if (this.pending[i].user.equals(message.getSender())) {
                let target = this.pending[i];
                if (message.getText().split(' ')[0] !== '/cancel') {
                    if (await target.validator(message)) {
                        target.resolve(message);
                        this.pending.splice(i, 1);
                    }
                } else {
                    target.reject();
                    this.pending.splice(i, 1);
                }
                return true;
            }
        }
        return false;
    }

    public static async dispatchPayload(user: AbstractUser, payload: any): Promise<void> {
        switch (payload.type) {
        case 'app_act':
            if (await user.hasRights(['appeals'])) {
                appealAction(user, payload);
            } else {
                user.message(strings.error.user_has_no_rights);
            }
            break;
        case 'contract_sign': 
            contractSign(user, payload);
            break;
        }
    }

    /**
     * Обработать команду в сообщении
     * @param message объект сообщения
     * @returns void
     */
    public static async processMessage(message: IMessage): Promise<void> {
        let user: AbstractUser = message.getSender();
        
        Notifier.notify('userMessage',
            stringFormat(strings.notification_got_message_from_user, message.getSenderId(), message.getText())
        );

        try {
            let cmdName = message.getText().split(' ')[0];
            if (commands.commands.map(value => value.baseName).includes(cmdName)) {
                let userRights = await user.getRights();
                if (!commands.commands.some(
                    (value) => cmdName === value.baseName && (userRights.includes(value.permission) || value.permission === ''))
                ) {
                    user.message(strings.error.user_has_no_rights);
                    return;
                }
            }

            if (!await this.dispatchMessage(message) && cmdName.startsWith('/')) {
                switch (cmdName) {
                    case '/start':
                        start(message);
                        break;
                    case '/help':
                        help(message);
                        break;
                    case '/nickname':
                        nickname(message);
                        break;
                    case '/subscribe':
                        subscribe(message);
                        break;
                    case '/unsubscribe':
                        unsubscribe(message);
                        break;
                    case '/contract':
                        contractreg(message);
                        break;
                    case '/appeal':
                        appeal(message);
                        break;
                    case '/config':
                        config(message);
                        break;
                    case '/cmd':
                        cmd(message);
                        break;
                    case '/rcon':
                        rcon(message);
                        break;
                }
            }
        } catch (e) {
            user.message(e.message);
        }
    }

}
