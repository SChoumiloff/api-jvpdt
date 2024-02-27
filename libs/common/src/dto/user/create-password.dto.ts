import { IsNotEmpty, Matches } from "class-validator";
import { isMatchPassword } from "src/users/decorators/IsPasswordsMatch.decorator";

export class CreatePasswordDto {
    @IsNotEmpty()
    @Matches(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})/, {
      message:
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et être entre 8 et 30 caractères.',
    })
    password: string;
  
    @IsNotEmpty()
    @isMatchPassword('password', {
      message:
        'Le mot de passe et la confirmation du mot de passe ne correspondent pas.',
    })
    confirmPassword: string;
}