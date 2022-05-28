import IMessage from "../IMessage";

type botCommandHandler = (message: IMessage) => Promise<void>;

export default botCommandHandler;