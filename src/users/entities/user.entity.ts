import { argon2d } from 'argon2';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as argon2 from 'argon2';

export enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Author = 'AUTHOR'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  passwordResetToken: string | null;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await argon2.hash(this.password);
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

  async validateRefreshToken(refreshToken: string): Promise<boolean> {
    return argon2.verify(this.refreshToken, refreshToken);
  }

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.User,
  })
  role: Role;
}
