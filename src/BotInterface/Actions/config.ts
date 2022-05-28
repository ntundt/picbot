import { readFileSync, writeFileSync } from 'fs';
import { s } from '../../utils/stringFormat';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';

class FieldNotFoundError extends Error { };

export let changeConfig = (field: string, newValue: any): any => {
    let currentConfig = JSON.parse(readFileSync('config.json', 'utf8'));
    let temp = currentConfig;
    let fieldSplit = field.split('.'); 
    for (let i = 0; i < fieldSplit.length - 1; i++) {
        if (typeof temp[fieldSplit[i]] !== 'undefined') {
            temp = temp[fieldSplit[i]];
        } else {
            throw new FieldNotFoundError();
        }
    }
    if (typeof temp[fieldSplit[fieldSplit.length - 1]] !== 'undefined') {
        temp[fieldSplit[fieldSplit.length - 1]] = newValue;
        writeFileSync('config.json', JSON.stringify(currentConfig, null, 4));
        return currentConfig;
    }
    throw new FieldNotFoundError();
}

export let config: botCommandHandler = async (message: IMessage): Promise<void> => {
    let user = message.getSender();

    let argv: string[] = []; 
    let m = message.getText().matchAll(/\"(?:[^"\\]|\\[\s\S])*\"|\S+/gms);
    for (let match of m) {
        argv.push(match[0]);
    }

    if (argv.length !== 3) {
        user.messageLocale(s('config.incorrect_format'))
        return;
    }

    try {
        let newConfig = changeConfig(argv[1], argv[2]);
        user.messageLocale(s('config.change_successful', JSON.stringify(newConfig, null, 2)))
    } catch (e) {
        if (e instanceof FieldNotFoundError) {
            user.messageLocale(s('config.field_not_found'));
        } else {
            throw e;
        }
    }

}
