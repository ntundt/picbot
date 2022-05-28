import * as config from '../../config.json';
//import { VKApi } from 'node-vk-sdk';
import { messageOptions } from './Types/messageOptions';

const vk = require('easyvk');
import IAttachment from './IAttachment';

export default class VKInterface {
    
    public static access_token: string = config.vk.accessToken;
    //public static api: VKApi;
    public static vk: any;

    public static messageQuery: Array<{ peer_id: number, text: string, keyboard?: string, attachments?: string[] }> = [];
    
    private static messagesTimer = setInterval(VKInterface.perform, 100);

    private static perform() {
        if (typeof VKInterface.messageQuery !== 'undefined' && VKInterface.messageQuery.length > 0) {
            console.log(VKInterface.messageQuery);
            let rq = VKInterface.messageQuery.shift();
            let recipients: number[] = [rq.peer_id];
            if (VKInterface.messageQuery.some(value => value.text === rq.text)) {
                for (let i = 0; i < VKInterface.messageQuery.length; i++) {
                    if (VKInterface.messageQuery[i].text === rq.text) {
                        recipients.push(VKInterface.messageQuery[i].peer_id);
                        VKInterface.messageQuery.splice(i, 1);
                        i--;
                    }
                }
            }
            let pars: {
                peer_ids: string,
                message: string,
                keyboard?: string,
                attachment?: string
            } = { 
                peer_ids: recipients.join(','), 
                message: rq.text 
            };
            if (rq.keyboard) {
                pars.keyboard = rq.keyboard;
            }
            if (rq.attachments) {
                pars.attachment = rq.attachments.join(',')
            }
            VKInterface.vkApiRequest('messages.send', pars);
        }
    }

    /**
     * Проинициализировать объект
     */
    public static async init(): Promise<void> {
        this.vk = await vk({
            token: this.access_token
        });
        
        // this.api = new VKApi({
        //     token: this.access_token
        // });
    }

    /**
     * Послать сообщение text пользователю с id==peer_id
     * (Записать его в очередь на отправку)
     * @param peer_id 
     * @param text 
     */
    public static message(peer_id: number, text: string, options: messageOptions = {}): void {
        let elem: { peer_id: number, text: string, keyboard?: string, attachments?: IAttachment[] } = {
            peer_id,
            text
        };

        if (options.keyboard) {
            elem.keyboard = options.keyboard.getVKMarkup();
        }

        if (options.attachments) {
            let promises: Promise<string>[] = [];
            for (let attachment of options.attachments) {
                promises.push(attachment.uploadToVK());
            }
            Promise.all(promises).then(values => this.messageQuery.push({...elem, attachments: values}));
            return;
        }
        
        this.messageQuery.push({peer_id: elem.peer_id, text: elem.text, keyboard: elem.keyboard});
    }

    /**
     * Выполнить запрос к API VK
     * @param method 
     * @param parameters 
     * @returns промис с ответом
     */
    public static async vkApiRequest(method: string, parameters: any): Promise<any> {
        if (typeof parameters.v === 'undefined') {
            parameters.v = '5.131';
        }
        if (typeof parameters.random_id === 'undefined' && method.startsWith('messages.')) {
            parameters.random_id = `${Math.random()}`;
        }
        return this.vk.call(method, parameters);
        //return this.api.call(method, parameters);
    }

}
