import IMessage from '../IMessage';
import { AbstractUser, UserCreator } from '../User';
import botCommandHandler from '../Types/botCommandHandler';
import * as questions from '../../../interview-questions.json';
import * as strings from '../../../strings.json';
import BotCommandDispatcher from '../Bot';
import Validator from '../../utils/Validator';
import stringFormat, { s } from '../../utils/stringFormat';
import Server from '../Server';
import Notifier from '../Notifier';

let start: botCommandHandler = async (message: IMessage) => {
    let user = message.getSender();
    let bannedUntil = 0;
    
    if (await user.signedUp()) {
        return;
    }

    user.message(strings.send_me_your_nickname);
    
    let nickname = (await BotCommandDispatcher.input(user, async (message) => {
        if (!Validator.isMinecraftNickname(message.getText())) {
            message.getSender().message(strings.error.nickname_invalid);
            return false;
        }
        if (await UserCreator.nicknameTaken(message.getText())) {
            message.getSender().message(stringFormat(strings.error.nickname_already_used, message.getText()));
            return false;
        }
        return true;
    })).getText();
    user.message(strings.nickname_saved_signup);
    
    waitingForConfirmation:
    while (true) {
        await BotCommandDispatcher.input(user, async (message) => {
            return message.getText().toLowerCase() == strings.ready;
        });
        if (bannedUntil >= Date.now() / 1000) {
            user.message(strings.error.five_mins_have_not_passed);
            continue waitingForConfirmation;
        }
        user.messageLocale(s('answer_to_questions_by_digit'));

        for (let i = 0; i < questions.questions.length; i++) {
            let min = 1;
            let max = questions.questions[i].answers.length;

            user.message((()=>{
                let result = (i !== 0 ? strings.correct_next_question + '\n\n' : '') + questions.questions[i].text + '\n';
                for (let j = 0; j < questions.questions[i].answers.length; j++) {
                    result += '\n' + (j + 1) + '. ' + questions.questions[i].answers[j];
                }
                return result;
            })());

            let choise = (await BotCommandDispatcher.input(user, async (message) => {
                if (!/[0-9]+/g.test(message.getText())) {
                    return false;
                }
                let ok = true;
                let matches = message.getText().matchAll(/[0-9]+/g);
                for (let match of matches) {
                    if (!(parseInt(match[0]) >= min && parseInt(match[0]) <= max)) {
                        ok = false;
                        break;
                    }
                }
                return ok;
            })).getText();

            let matches = choise.matchAll(/[0-9]+/g);
            let choises: number[] = [];
            for (let match of matches) {
                choises.push(parseInt(match[0]));
            }

            if (!questions.questions[i].correctAnswers.every(val => choises.includes(val))
            || !choises.every(val => questions.questions[i].correctAnswers.includes(val))) {
                user.message(strings.answer_incorrect);
                bannedUntil = Date.now() / 1000 + 300;
                continue waitingForConfirmation;
            }
        }
        break;
    }

    user.message(strings.correct_last_question);
    let choise = parseInt((await BotCommandDispatcher.input(user, async (message) => {
        if (!message.getText().match(/[0-9]+/g)) {
            return false;
        }
        let c = parseInt(message.getText());
        return c >= 1 && c <= 2;
    })).getText());

    if (choise == 1) {
        user.messageLocale(s('correct_interview_passed', nickname))
        await user.signUp(nickname);
        await Server.command(`whitelist add ${nickname}`);
        Notifier.notify('newPlayers', s('notifications.new_player', nickname));
        return;
    }
    
    user.message(strings.tell_me_please_nickname);
    let invitedBy = (await BotCommandDispatcher.input(user, async (message) =>{
        if (message.getText() === '/skip') {
            return true;
        }
        if (!Validator.isMinecraftNickname(message.getText())) {
            message.getSender().message(strings.error.nickname_invalid);
            return false;
        }
        return true;
    })).getText();

    if (invitedBy === '/skip') {
        await user.signUp(nickname);
        user.messageLocale(s('correct_interview_passed', nickname))
        await Server.command(`whitelist add ${nickname}`);
        Notifier.notify('newPlayers', s('notifications.new_player', nickname));
        return;
    }

    
    await user.signUp(nickname);
    await user.invitedBy(invitedBy);
    user.messageLocale(s('correct_interview_passed', nickname));
    await Server.command(`whitelist add ${nickname}`);
    Notifier.notify('newPlayers', s('notifications.new_player', nickname));
}

export default start;