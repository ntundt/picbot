import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { appealStatus } from '../Types/appealStatus';
import Account from './Account';

@Entity()
export default class Appeal {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        default: 0
    })
    date: number;

    @ManyToOne(type => Account)
    @JoinColumn()
    author: Account;

    @ManyToOne(type => Account)
    @JoinColumn()
    admin: Account;

    @Column('enum', {
        enum: appealStatus
    })
    status: appealStatus;

}