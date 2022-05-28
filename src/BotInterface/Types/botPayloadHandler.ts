import { AbstractUser } from '../User';

export type botPayloadHandler = (user: AbstractUser, payload: any) => Promise<void>;