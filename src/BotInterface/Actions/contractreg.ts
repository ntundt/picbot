import IMessage from '../IMessage';
import botCommandHandler from '../Types/botCommandHandler';
import * as strings from '../../../strings.json';
import Bot from '../Bot';
import Account from '../DatabaseEntities/Account';
import Validator from '../../utils/Validator';
import { s } from '../../utils/stringFormat';
import { UserCreator } from '../User';
import DatabaseInterface from '../DatabaseInterface';
import Contract from '../DatabaseEntities/Contract';
import { Keyboard } from '../Keyboard';
import { In } from 'typeorm';

let contractreg: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();

    user.messageLocale(s('contractreg.send_contract_text'));
    let text = (await Bot.input(user, async () => true)).getText();

    user.messageLocale(s('contractreg.send_nicknames'));
    let players: Account[] = [];
    let nickname = /\w+/g;
    await Bot.input(user, async (message) => {
        let matches = message.getText().matchAll(nickname);
        let matchesStringArray: string[] = [];
        // Проверить, все ли никнеймы валидные
        for (let match of matches) {
            if (!Validator.isMinecraftNickname(match[0])) {
                user.messageLocale(s('contractreg.invalid_nickname'));
                return false;
            } else {
                matchesStringArray.push(match[0]);
            }
        }
        players = await DatabaseInterface.accountRepository.find({
            where: {
                nickname: In(matchesStringArray)
            }
        });
        // Проверить, все ли игроки найдены в БД
        for (let match of matchesStringArray) {
            if (!players.some(player => match === player.nickname)) {
                user.messageLocale(s('contractreg.player_not_found', match));
                return false;
            }
        }
        if (players.length == 0 || (players.length == 1 && UserCreator.getByEntity(players[0]).equals(user))) {
            user.messageLocale(s('contractreg.more_than_one_player_needed'));
            return false;
        }
        // Если отправивший договор не указал себя среди участников, добавить его
        if (!players.some(player => UserCreator.getByEntity(player).equals(user))) {
            players.push(await user.getEntity());
        }
        return true;
    });

    let contract = new Contract;

    contract.date = Math.floor(Date.now() / 1000);
    contract.participants = players;
    contract.text = text;
    contract = await DatabaseInterface.contractRepository.save(contract);

    let keyboard = new Keyboard();
    keyboard.addButton(s('contractreg.sign'), `{"type":"contract_sign","id":${contract.id}}`);
    players.forEach(player => {
        UserCreator.getByEntity(player).messageLocale(
            s('contractreg.contract_get', contract.id, text, players.map(player => player.nickname).join(', ')),
            { keyboard }
        );
    });

    //user.messageLocale(s('contractreg.waiting_for_confirmation', cont));
}

export default contractreg;