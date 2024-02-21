import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../../libs/common/src/dto/user/create-user.dto';
import { UpdateUserDto } from '../../libs/common/src/dto/user/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'libs/common/src/dto/auth';
import { register } from 'module';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExist: User = await this.findOneByEmail(createUserDto.email);
    if (userExist) {
      throw new ConflictException(
        `Un compte existe déjà avec cet email (${createUserDto.email})`,
      );
    }
    const user: User = await this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  async createFromRegister(dto: RegisterDto) : Promise<User> {
    const userExist: User = await this.findOneByEmail(dto.email);
    if (userExist) {
      throw new ConflictException(
        `Un compte existe déjà avec cet email (${dto.email})`,
      );
    }
    const user: User = await this.userRepository.create(dto);
    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findOne(id: number): Promise<User> {
    return await this.userRepository.findOneBy({ id: id });
  }

  async findOneByEmail(email: string): Promise<User> {
    const user: User = await this.userRepository.findOneBy({
      email: email,
    });
    if (!user) {
      return null;
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user: User = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur n'a été trouvé pour l'id: ${id}`,
      );
    }
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return user;
  }

  async remove(id: number): Promise<void> {
    const user: User = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(
        `Aucun utilisateur n'a été trouvé pour l'id: ${id}`,
      );
    }
    await this.userRepository.remove(user);
  }
}
