import stringFormat from '../utils/stringFormat';
import Appeal from './DatabaseEntities/Appeal';
import DatabaseInterface from './DatabaseInterface';
import Notifier from './Notifier';
import { appealStatus } from './Types/appealStatus';
import { AbstractUser, UserCreator } from './User';
import * as strings from '../../strings.json';
import { ButtonColor, Keyboard } from './Keyboard';
import IAttachment from './IAttachment';

export default class AppealManager {

    public static async add(user: AbstractUser, text: string, attachments: IAttachment[]): Promise<void> {
        let appeal = new Appeal;
        appeal.date = Date.now() / 1000;
        appeal.author = await user.getEntity();
        appeal.status = appealStatus.open;
        
        appeal = await DatabaseInterface.appealRepository.save(appeal);

        let appealActions = new Keyboard;
        appealActions.addButton(strings.notifications.take_assignment, `{\"type\":\"app_act\",\"act\":\"take_assignment\",\"id\":${appeal.id}}`);
        appealActions.addLine();
        appealActions.addButton(strings.notifications.satisfy, `{\"type\":\"app_act\",\"act\":\"satisfy\",\"id\":${appeal.id}}`, ButtonColor.green);
        appealActions.addLine();
        appealActions.addButton(strings.notifications.close, `{\"type\":\"app_act\",\"act\":\"close\",\"id\":${appeal.id}}`, ButtonColor.red);
        appealActions.addButton(strings.notifications.close_no_notification, `{\"type\":\"app_act\",\"act\":\"close_no_notif\",\"id\":${appeal.id}}`, ButtonColor.red);
        appealActions.addLine();
        appealActions.addButton(strings.notifications.go_to_dialog, `{\"type\":\"app_act\",\"act\":\"go_to_dialog\",\"id\":${appeal.id}}`)
        Notifier.notify('appeals', stringFormat(strings.notifications.new_appeal, await user.getNickname(), text), { keyboard: appealActions, attachments });
    }

    public static async setStatus(appealId: number, status: appealStatus, notify: boolean = true) {
        let appeal = await DatabaseInterface.appealRepository.findOne(appealId, {relations:['author']});

        let author = UserCreator.create(appeal.author.habitat, appeal.author.userId);

        appeal.status = status;

        await DatabaseInterface.appealRepository.save(appeal);

        if (notify) {
            let appealDate = new Date(appeal.date * 1000);
            let appealDateStr = `${appealDate.getDate() < 10 ? '0' + appealDate.getDate() : appealDate.getDate()}`
                + `.${appealDate.getMonth() + 1 < 10 ? '0' + (appealDate.getMonth() + 1) : appealDate.getMonth() + 1}`
                + `.${appealDate.getFullYear()}`
                + ` ${appealDate.getHours() < 10 ? '0' + appealDate.getHours() : appealDate.getHours()}`
                + `:${appealDate.getMinutes() < 10 ? '0' + appealDate.getMinutes() : appealDate.getMinutes()}`;
            switch (status) {
                case appealStatus.closed:
                    author.message(stringFormat(strings.notifications.appeal_closed, appealDateStr));
                    break;
                case appealStatus.working:
                    author.message(stringFormat(strings.notifications.appeal_taken, appealDateStr));
                    break;
                case appealStatus.resolved:
                    author.message(stringFormat(strings.notifications.appeal_satisfied, appealDateStr));
                    break;
            }
        }
    }

    public static async someoneWorking(appealId: number): Promise<boolean> {
        let appeal = await DatabaseInterface.appealRepository.findOne(appealId, { relations: ['admin'] });
        return appeal.admin ? true : false;
    }

    public static async whoIsWorking(appealId: number): Promise<AbstractUser> {
        let appeal = await DatabaseInterface.appealRepository.findOne(appealId, { relations: ['admin'] });
        return UserCreator.create(appeal.admin.habitat, appeal.admin.userId);
    }

    public static async getAuthor(appealId: number): Promise<AbstractUser> {
        let appeal = await DatabaseInterface.appealRepository.findOne(appealId, { relations: ['author'] });
        return UserCreator.create(appeal.author.habitat, appeal.author.userId);
    }

    public static async setWorking(appealId: number, user: AbstractUser): Promise<void> {
        let appeal = await DatabaseInterface.appealRepository.findOne(appealId, { relations: ['admin'] });
        appeal.admin = await user.getEntity();
        await DatabaseInterface.appealRepository.save(appeal);
    } 

}