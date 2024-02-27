import { Exclude } from "class-transformer";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    documentName: string;

    @Column()
    documentDescription: string;

    @Exclude()
    @Column()
    documentPath: string;

    @Column("varchar", {array: true})
    keyWords: string[]

    @Column("boolean", {default: false, nullable: true})
    isActiveDoc: boolean

    @ManyToOne(() => User, (User) => User.lastModifDocs, {eager: true, nullable: true})
    lastModifier: User

    @ManyToOne(() => User, (User) => User.documents, {eager: true})
    author: User;


    @Exclude()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @Exclude()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}