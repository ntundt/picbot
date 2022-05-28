import { Entity, PrimaryGeneratedColumn, ManyToMany, Column } from 'typeorm';
import Account from './Account';

@Entity()
export default class Subscription {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 32,
        unique: true
    })
    name: string;

    @ManyToMany(type => Account, account => account.subscriptions)
    accounts: Account[];

}