import { readFileSync } from 'fs';
import Server from '../Server';
import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';

let rcon: botCommandHandler = async (message: IMessage): Promise<void> => {
    let user = message.getSender();
    let argv = message.getText().split(/\s+/g, );

    let config = JSON.parse(readFileSync('config.json', 'utf8'));

    if (typeof argv[1] !== 'undefined') {
        switch (argv[1]) {
            case 'host':
                
                break;
            case 'port':
            
                break;
            case 'password':

                break;
            case 'reconnect':
                Server.connect();
                break;
            default:
                
                break;
        }
    }
}

export default rcon;