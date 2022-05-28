import Server from '../Server';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import { s } from '../../utils/stringFormat';
import Bot from '../Bot';

let cmd: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();

    let argv: string[] = []; 
    let m = message.getText().matchAll(/\"(?:[^"\\]|\\[\s\S])*\"|\S+/gms);
    for (let match of m) {
        argv.push(match[0]);
    }
    
    if (argv.length === 1) {
        if (!Server.working) {
            user.messageLocale(s('no_connection_to_server_console_mode_unavailable'));
            return;
        }
        user.messageLocale(s('cmd.console_mode'));
        let message: IMessage;
        while ((message = await Bot.input(user)).getText() !== '/exit') {
            let response = await Server.command(message.getText());
            user.message(response.replace(/§./g, ''));
        }
    } else {
        let command = message.getText().slice(5);
        if (!Server.working) {
            user.messageLocale(s('cmd.no_connection_to_server_command_saved'));
        }
        let response = await Server.command(command);
        user.message(response.replace(/§./g, ''));
    }
}

export default cmd;