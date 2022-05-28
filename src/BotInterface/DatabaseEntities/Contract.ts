import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Account from './Account';

@Entity()
export default class Contract {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    date: number;

    @Column({
        length: 4096
    })
    text: string;

    @ManyToMany(type => Account)
    @JoinTable()
    participants: Account[];

    @ManyToMany(type => Account)
    @JoinTable()
    participantsConfirmed: Account[];

}