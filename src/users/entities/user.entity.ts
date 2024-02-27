import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import * as argon2 from 'argon2';
import { Document } from 'src/documents/entities/document.entity';
import { Exclude } from 'class-transformer';

export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Author = 'AUTHOR'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: false})
  firstname: string;

  @Column({nullable: false})
  lastname: string;

  @Column({ default: false, nullable: false})
  isActive: boolean;

  @Column({nullable: false, unique: true})
  email: string;

  @Column({ nullable: false})
  @Exclude()
  password: string;

  @Exclude()
  @Column({ nullable: true })
  passwordResetToken?: string | null;
  
  @Column({
    nullable: true,
    type: 'varchar',
    name: 'refresh_token',
  })
  @Exclude()
  refreshToken: string;
  
  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date | null;

  @Exclude()
  @Column({type: 'varchar', nullable: true })
  passwordCreateToken?: string;

  @Exclude()
  @Column({type: 'timestamp', nullable: true })
  passwordCreateExpires?: Date | null;

  @CreateDateColumn({ name: 'created_at', nullable: false })
  @Exclude()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
  @Exclude()
  updatedAt: Date;

  @Column({
    type: 'enum',
    nullable: false,
    enum: Role,
    default: [Role.User],
    array: true
  })
  role: Role[];

  @ManyToOne(() => Document, (Document) => Document.author )
  documents: Document[];

  @ManyToOne(() => Document, (Document) => Document.lastModifier)
  lastModifDocs: Document[]

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    } else {
      this.password = await argon2.hash(await this.generateRandomString())
    }
  }

  async createPassword(password: string): Promise<User> {
    this.password = await argon2.hash(password)
    return this;
  }

  async validatePassword(password: string): Promise<boolean> {
    return await argon2.verify(this.password, password);
  }

  async updatePassword(password: string) : Promise<User> {
    this.password = await argon2.hash(password);
    return this;
  }

  async setCreatePasswordInfo(): Promise<User> {
    this.passwordCreateToken = await this.generateRandomString(100)
    const date = new Date();
    this.passwordCreateExpires = new Date(date.setDate(date.getDate() + 5))
    return this
  }
 
  @BeforeInsert()
  async hashRefreshToken() {
    if (this.refreshToken) {
      this.refreshToken = await argon2.hash(this.refreshToken);
    }
  }

  private async generateRandomString(length: number=256): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&(!)-_/<>';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    return argon2.verify(this.refreshToken, refreshToken);
  }
}
