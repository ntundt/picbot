import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinTable, ManyToOne, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import Association from './Association';
import Permission from './Permission';
import Subscription from './Subscription';

@Entity()
export default class Account {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 32,
        unique: true
    })
    nickname: string;

    @Column({
        default: 0
    })
    nicknameChangedTimestamp: number;

    @Column({
        length: 16
    })
    habitat: string;

    @Column()
    userId: number;

    @ManyToOne(type => Account, { nullable: true })
    @JoinColumn()
    invitedBy?: Account;

    @Column({ length: 32, nullable: true})
    invitedByNickname?: string;

    @ManyToMany(type => Permission, permission => permission.accounts)
    @JoinTable()
    permissions: Permission[];

    @ManyToMany(type => Subscription, subscription => subscription.accounts)
    @JoinTable()
    subscriptions: Subscription[];

    @ManyToOne(() => Association, association => association.members)
    @JoinTable({})
    association: Association;

}
