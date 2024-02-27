import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../../libs/common/src/dto/user/create-user.dto';
import { UpdateUserDto } from '../../libs/common/src/dto/user/update-user.dto';
import { AccessTokenGuard } from 'libs/common/src/guards';
import { Role, User } from './entities/user.entity';
import { GetCurrentUser} from 'libs/common/src/decorators';
import { Actions } from 'libs/common/src/enums/actions.enum';
import { CreatePasswordDto } from 'libs/common/src/dto/user/create-password.dto';
import { Action } from 'rxjs/internal/scheduler/Action';


@Controller('users')

export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @GetCurrentUser() currentUser: User) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@GetCurrentUser() currentUser: User) {
    return await this.usersService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string, @GetCurrentUser() currentUser: User) {
    const userResearch: User = await this.usersService.findOne(+id);
    if (!userResearch) {
      throw new NotFoundException(`
        Cet utilisateur n'existe pas. 
      `)
    }
    return userResearch;
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, 
         @Body() updateUserDto: UpdateUserDto, 
         @GetCurrentUser() currentUser: User) {
    const userResearch: User = await this.usersService.findOne(+id)  
      return await this.usersService.update(+id, updateUserDto);
  }

  @Patch('/password/:id')
  @HttpCode(HttpStatus.OK)
  async updatePassword(@Param('id') id: string, 
                       @Body() createPasswordDto: CreatePasswordDto,
                       @GetCurrentUser() currentUser: User) : Promise<User> {
    return await this.usersService.updatePassword(createPasswordDto.password, +id)
  }

  @Post('/password/:token')
  @HttpCode(HttpStatus.CREATED)
  async createPassword(@Param('token') token: string, 
                       @Body() createPasswordDto: CreatePasswordDto) : Promise<User> {
    const userResearch: User = await this.usersService.findUserByCreatePasswordToken(token);
    if (!userResearch) {
      throw new NotFoundException(`
        L'utilisateur n'existe pas
      `)
    }
    return await this.usersService.createPassword(createPasswordDto.password, userResearch);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string, @GetCurrentUser() currentUser: User) {
    const userResarch: User = await this.usersService.findOne(+id);
    if (!userResarch) {
      throw new NotFoundException(`
        Cet utilisateur d'existe pas
      `)
    }
    return this.usersService.remove(+id);
  }
}
