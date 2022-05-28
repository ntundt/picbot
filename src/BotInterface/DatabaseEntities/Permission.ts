import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import Account from './Account';

@Entity()
export default class Permission {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 32
    })
    name: string;

    @Column({
        length: 32
    })
    displayName: string;

    @ManyToMany(type => Account, account => account.permissions)
    accounts: Account[];

}