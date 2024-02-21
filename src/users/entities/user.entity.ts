import { argon2d } from 'argon2';
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

  @Column({ nullable: true})
  password?: string;

  @Column({ nullable: true })
  passwordResetToken?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
    } else {
      this.password = await this.generateRandomString()
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return argon2.verify(this.password, password);
  }

  @Column({
    nullable: true,
    type: 'varchar',
    name: 'refresh_token',
  })
  refreshToken: string;

  @BeforeInsert()
  @BeforeUpdate()
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

  @CreateDateColumn({ name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: false })
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
}
