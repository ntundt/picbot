import * as config from '../../config.json';
import { Rcon } from 'rcon-client/lib';
import Notifier from './Notifier';
import * as strings from '../../strings.json';
import stringFormat from '../../src/utils/stringFormat';

export default class Server {

    public static host: string;
    public static port: number;
    public static password: string;
    public static client: Rcon;
    public static working: boolean = false;

    private static timer = setInterval(Server.send, 500);

    private static commandQuery: { command: string, callback: (response: string) => void }[] = [];

    /**
     * Проинициализировать объект
     */
    public static async init(): Promise<void> {
        try {
            this.host = config.server.host;
            this.port = config.server.port;
            this.password = config.server.password;
            await this.connect();
        } catch (e) {
            Notifier.notify('errors', stringFormat(strings.notification_server_cant_connect, JSON.stringify(e)));
        }
    }

    /**
     * Подключиться к серверу через RCON
     */
    public static async connect(): Promise<void> {
        Server.client = new Rcon({
            host: Server.host,
            port: Server.port,
            password: Server.password
        });

        Server.client.on('authenticated', function() {
            Server.working = true;
            Notifier.notify('botStartup', strings.notification_server_connected);
        });

        let fellOff = function() {
            Server.working = false;
            Notifier.notify('botStartup', strings.notification_server_fell_off_reconnecting);
            setTimeout(Server.connect, 180000);
        };
        Server.client.on('error', fellOff);
        Server.client.on('end', fellOff);

        await Server.client.connect();
    }

    private static async send(): Promise<void> {
        try {
            if (Server.working && Server.commandQuery.length > 0) {
                let cmd = Server.commandQuery.shift();
                console.log(`Sending "${cmd.command}" to server`);
                cmd.callback(await Server.client.send(cmd.command));
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Послать команду на сервер
     * (Записать в очередь на отправку)
     * @param command команда без '/'
     * @returns промис с ответом от сервера
     */
    public static command(command: string): Promise<string> {
        return new Promise(function(resolve, reject) {
            Server.commandQuery.push({ 
                command, 
                callback: function(response: string) {
                    resolve(response);
                }
            });
        });
    }

}
