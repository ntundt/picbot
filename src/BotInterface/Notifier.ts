import { LocaleString } from '../utils/stringFormat';
import DatabaseInterface from './DatabaseInterface';
import { messageOptions } from './Types/messageOptions';
import { AbstractUser, UserCreator } from './User';

export default class Notifier {

    /**
     * Получить пользователей, подписанных на уведомления типа subscriptionType
     * @param subscriptionType 
     * @returns промис с пользователями
     */
    public static async getSubscribers(subscriptionType: string): Promise<Array<AbstractUser>> {
        let response = await DatabaseInterface.subscriptionRepository.findOne({ 
            where: {
                name: subscriptionType
            },
            relations: ['accounts']
        });

        let users: Array<AbstractUser> = [];
        for (let i = 0; i < response.accounts.length; i++) {
            users.push(UserCreator.create(response.accounts[i].habitat, response.accounts[i].userId));
        }
        
        return users;
    }

    public static async getAllSubscriptions(): Promise<string[]> {
        let subscriptions = await DatabaseInterface.subscriptionRepository.find();
        return subscriptions.map((value) => value.name);
    }

    /**
     * Уведомить пользователей
     * @param subcriptionType тип уведомлений
     * @param message текст уведомления
     */
    public static async notify(subcriptionType: string, message: string | LocaleString, options: messageOptions = {}): Promise<void> {
        let subscribers = await this.getSubscribers(subcriptionType);
        if (typeof message === 'string') {
            subscribers.forEach(user => user.message(message, options));
        } else if (message instanceof LocaleString) {
            subscribers.forEach(user => user.messageLocale(message, options));
        }
    }

}