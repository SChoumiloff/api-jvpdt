import { Exclude } from "class-transformer";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

    @Exclude()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @Exclude()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}