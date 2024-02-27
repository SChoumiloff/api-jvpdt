import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from '../../libs/common/src/dto/user/create-user.dto';
import { UpdateUserDto } from '../../libs/common/src/dto/user/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto } from 'libs/common/src/dto/auth';

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
    await user.setCreatePasswordInfo();
    //TODO -> envoyer un mail thx to mailService 
    //(Un compte vous a été assigné, suivez ce lien pour créer votre mot de passe)
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

  async updatePassword(password: string, id: number) : Promise<User> {
    const user: User = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(
        `Cet utilisateur n'existe pas`
      )
    }
    return await this.userRepository.save(await user.updatePassword(password));
  }

  async findUserByCreatePasswordToken(token: string) : Promise<User> {
    return await this.userRepository.findOneBy({
      passwordCreateToken: token
    })
  }

  async createPassword(password: string, user: User) : Promise<User> {
    if (!user.passwordCreateExpires || user.passwordCreateExpires > new Date()) {
      throw new ForbiddenException(`
        L'accès est expiré ou interdit
      `)
    }
    return this.userRepository.save(await user.createPassword(password));
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
    if ('email' in updateUserDto) {
      const possibleUser: User = await this.findOneByEmail(updateUserDto.email)
      if (possibleUser && possibleUser.id !== user.id) {
        throw new ConflictException(`
          Un compte est déjà associé à cet email
        `)
      }
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
