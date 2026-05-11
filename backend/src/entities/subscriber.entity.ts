import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('subscriber')
export class SubscriberEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ default: false })
    isVerified!: boolean;

    @Column({ default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', nullable: true })
    verifyToken!: string | null;

    @CreateDateColumn()
    subscribedAt!: Date;
}