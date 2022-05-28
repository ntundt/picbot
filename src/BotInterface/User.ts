import Account from './DatabaseEntities/Account';
import DatabaseInterface from './DatabaseInterface';
import UserNotFoundError from './Exceptions/UserNotFoundError';
import { SocialNetwork } from './SocialNetworks';
import VKInterface from './VKInterface';
import TelegramInterface from './TelegramInterface';
import Validator from '../utils/Validator';
import stringFormat, { LocaleString } from '../utils/stringFormat';
import * as strings from '../../strings.json';
import * as commands from '../../commands.json';
import NicknameAlreadyUsedError from './Exceptions/NicknameAlreadyUsedError';
import { messageOptions } from './Types/messageOptions';
import { In } from 'typeorm';

export abstract class AbstractUser {

    public readonly habitat: SocialNetwork;
    public readonly userId: number;

    public constructor(userId: number) {
        this.userId = userId;
    }



    public async signedUp(): Promise<boolean> {
        let result = await DatabaseInterface.accountRepository.findOne({
            where: { 
                habitat: this.habitat, 
                userId: this.userId 
            } 
        });
        return result ? true : false;
    }

    public async signUp(nickname: string): Promise<void> {
        let account = new Account;
        account.id = 0;
        account.habitat = this.habitat;
        account.nickname = nickname;
        account.userId = this.userId;
        await DatabaseInterface.accountRepository.save(account);
    }



    public async getNickname(): Promise<string> {
        let result = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat, 
                userId: this.userId
            }
        });
        return result.nickname;
    };

    public async setNickname(nickname: string): Promise<void> {
        let result = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            }
        });
        try {
            await UserCreator.getByNickname(nickname);
            throw new NicknameAlreadyUsedError(stringFormat(strings.error.nickname_already_used, nickname));
        } catch (e) {
            if (e instanceof UserNotFoundError) {
                result.nickname = nickname;
                result.nicknameChangedTimestamp = Math.floor(Date.now() / 1000);
                await DatabaseInterface.accountRepository.save(result);
            } else {
                throw e;
            }
        }
    };



    public async hasRights(rights: Array<string>): Promise<boolean> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            },
            relations: ['permissions']
        });
        return rights.every(right => account.permissions.some(permission => permission.name === right));
    }

    public async getRights(): Promise<Array<string>> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            },
            relations: ['permissions']
        });

        let result: Array<string>;
        if (!account) {
            result = ['isNotRegistered'];
        } else {
            if (account.permissions) {
                result = ['isRegistered', ...account.permissions.map(permission => permission.name)];
            }
        }
        
        return result;
    }

    public async addRights(rights: Array<string>): Promise<void> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            }
        });

        let permissionsToAdd: Array<string> = [];
        rights.forEach(right => {
            if (!account.permissions.some(permission => permission.name === right)) {
                permissionsToAdd.push(right);
            }
        });

        let permissions = await DatabaseInterface.permissionRepository.find({
            where: {
                name: [...permissionsToAdd]
            }
        });
        account.permissions = [...account.permissions, ...permissions];
        await DatabaseInterface.accountRepository.save(account);
    }

    public async removeRights(rights: Array<string>): Promise<void> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            }
        });

        account.permissions = account.permissions.filter(permission => !rights.includes(permission.name));
        await DatabaseInterface.accountRepository.save(account);
    }

    public async setRights(rights: Array<string>): Promise<void> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            }
        });

        let permissions = await DatabaseInterface.permissionRepository.find({ 
            where: { 
                name: [...rights] 
            } 
        });
        account.permissions = [...permissions];
        await DatabaseInterface.accountRepository.save(account);
    }



    public async getSubscriptions(): Promise<string[]> {
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            },
            relations: ['subscriptions']
        });

        return account.subscriptions.map((value) => value.name);
    }

    public async removeSubscriptions(subscriptions: string[]): Promise<void> {
        if (subscriptions.length === 0) {
            return;
        }
        
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            },
            relations: ['subscriptions']
        });

        for (let i = 0; i < account.subscriptions.length; i++) {
            if (subscriptions.some((value) => value === account.subscriptions[i].name)) {
                account.subscriptions.splice(i, 1);
                i--;
            }
        }

        await DatabaseInterface.accountRepository.save(account);
    }

    public async addSubscriptions(subscriptions: string[]): Promise<void> {
        if (subscriptions.length === 0) {
            return;
        }
        
        let account = await DatabaseInterface.accountRepository.findOne({
            where: {
                habitat: this.habitat,
                userId: this.userId
            },
            relations: ['subscriptions']
        });

        let subscriptionNamesToAdd: string[] = [];
        for (let i = 0; i < subscriptions.length; i++) {
            if (!account.subscriptions.some((value) => value.name === subscriptions[i])) {
                subscriptionNamesToAdd.push(subscriptions[i]);
            }
        }

        let subscriptionsToAdd = await DatabaseInterface.subscriptionRepository.find({
            where: {
                name: In(subscriptionNamesToAdd)
            }
        });

        subscriptionsToAdd.forEach((value) => {
            account.subscriptions.push(value);
        });

        await DatabaseInterface.accountRepository.save(account);
    }



    /**
     * Установить ник пригласившего игрока
     * @param by никнейм игрока, который пригласил
     */
    public async invitedBy(byNickname: string): Promise<void> {
        if (!(await UserCreator.nicknameTaken(byNickname))) {
            let me = await this.getEntity();
            me.invitedByNickname = byNickname;
            DatabaseInterface.accountRepository.save(me);
            return;
        }
        let byAccount = await UserCreator.getByNickname(byNickname);

        let me = await this.getEntity();

        me.invitedBy = await byAccount.getEntity();

        await DatabaseInterface.accountRepository.save(me);
    }

    public async getEntity(relations: string[] = []): Promise<Account> {
        return await DatabaseInterface.accountRepository.findOne({
            where: {
                userId: this.userId,
                habitat: this.habitat
            },
            relations
        });
    }

    /**
     * Получить помощь из /commands.json
     * @returns строка с помощью
     */
    public async generateHelp(): Promise<string> {
        let help: string = "";
        let rights = await this.getRights();
        commands.commands.forEach(function (value: any) {
            if (rights.includes(value.permission) || value.permission === '') {
                help += value.name + ' — ' + value.description + '\n';
            }
        });
        return help;
    }

    /**
     * Отправить сообщение пользователю
     * @param message текст сообщения
     * @param options параметры отправки
     */
    public message(message: string, options: messageOptions = {}): void {
        if (message === '' && Object.keys(options).length === 0) {
            return;
        }
        this.sendMessage(message, options);
    }

    /**
     * Отправить локализованное под пользователя сообщение
     * @param message объект LocaleString, предоставляющий текст сообщения
     * @param options параметры отправки
     */
    public messageLocale(message: LocaleString, options: messageOptions = {}): void {
        let text = message.getLocalized();
        if (text === '' && Object.keys(options).length === 0) {
            return;
        }
        this.sendMessage(message.getLocalized(), options);
    }

    protected abstract sendMessage(message: string, options: messageOptions): void;

    /**
     * Сравнить пользователей
     * @param user другой пользователь
     */
    public abstract equals(user: AbstractUser): boolean;

}

export class TelegramUser extends AbstractUser {

    public readonly habitat: SocialNetwork = 'Telegram';
    public readonly userId: number;

    public constructor(userId: number) {
        super(userId);
    }

    protected override sendMessage(message: string, options: messageOptions): void {
        TelegramInterface.message(this.userId, message, options);
    }

    public equals(user: AbstractUser): boolean {
        return user.habitat === this.habitat ? user.userId === this.userId : false;
    }

}

export class VKUser extends AbstractUser {

    public readonly habitat: SocialNetwork = 'VK';
    public readonly userId: number;

    public constructor(userId: number) {
        super(userId);
    }

    protected override sendMessage(message: string, options: messageOptions = {}): void {
        VKInterface.message(this.userId, message, options);
    }

    public equals(user: AbstractUser): boolean {
        return user.habitat === this.habitat ? user.userId === this.userId : false;
    }

}

export class UserCreator {

    public static create(habitat: string | SocialNetwork, userId: number): AbstractUser {
        if (habitat == 'VK') {
            return new VKUser(userId);
        } else if (habitat == 'Telegram') {
            return new TelegramUser(userId);
        }
    }

    public static getByEntity(account: Account) {
        return this.create(account.habitat, account.userId);
    }

    public static async getByNickname(nickname: string): Promise<AbstractUser> {
        if (!Validator.isMinecraftNickname(nickname)) {
            throw new Error(strings.error.nickname_invalid);
        }

        let user = await DatabaseInterface.accountRepository.findOne({
            where: {
                nickname: nickname
            }
        });

        if (!user) {
            throw new UserNotFoundError(stringFormat(strings.error.user_with_given_nickname_not_found, nickname));
        }

        return UserCreator.create(user.habitat, user.userId);
    }

    public static async nicknameTaken(nickname: string) {
        let user = await DatabaseInterface.accountRepository.findOne({
            where: {
                nickname: nickname
            }
        });
        return typeof user !== 'undefined';
    }
}
