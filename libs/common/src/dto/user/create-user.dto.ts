import {
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';
import { Role } from 'src/users/entities/user.entity';
import { IsEnumArray } from '../../decorators/is-enum-array.decorator';

export class CreateUserDto {
  @IsNotEmpty()
  firstname: string;

  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  @IsEnumArray({ message: 'Chaque élément doit être une valeur valide de l\'enum Role' }, Role)
  role?: Role[]
}
