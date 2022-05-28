import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AssociationType } from '../Types/AssociationType';
import Account from './Account';

@Entity()
export default class Association {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 64
    })
    name: string;

    @Column('enum', {
        enum: AssociationType
    })
    type: AssociationType;

    @Column({
        length: 4096
    })
    description: string;

    @OneToOne(() => Account)
    @JoinColumn()
    head: Account;

    @OneToMany(() => Account, account => account.association)
    members: Account[];

} 