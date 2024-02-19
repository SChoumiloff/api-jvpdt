import {
  Entity,
  ObjectIdColumn,
  PrimaryGeneratedColumn,
  Column,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['jti'])
export class RevokedToken {
  @ObjectIdColumn()
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  jti: string;
}
