import BotCommandDispatcher from "../Bot";
import IMessage from "../IMessage";
import { AbstractUser } from "../User";
import botCommandHandler from "../Types/botCommandHandler";


let help: botCommandHandler = async (message: IMessage) => {
    message.getSender().message(await message.getSender().generateHelp());
}

export default help;