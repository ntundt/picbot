import { readFileSync } from 'fs';
import Server from '../Server';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import stringFormat from '../../utils/stringFormat';
import strings from '../../../strings.json';

let rcon: botCommandHandler = async (message: IMessage): Promise<void> => {
    let user = message.getSender();
    let argv = message.getText().split(/\s+/g, );

    let config = JSON.parse(readFileSync('config.json', 'utf8'));

    if (argv.length != 2) {
        user.message(strings.rcon.rcon_usage);
        return;
    }

    if (typeof argv[1] !== 'undefined') {
        switch (argv[1]) {
            case 'host':
                
                break;
            case 'port':
            
                break;
            case 'password':

                break;
            case 'reconnect':
                user.message(strings.rcon.trynna_connect_to_the_server);
                Server.host = config.host;
                Server.port = config.port;
                Server.password = config.password;
                Server.connect();
                break;
            default:
                user.message(strings.rcon.rcon_usage);
                break;
        }
    }
}

export default rcon;