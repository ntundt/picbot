import IMessage from '../IMessage';

export default abstract class CommandHandler {
    public abstract handle(message: IMessage): Promise<void>;
}