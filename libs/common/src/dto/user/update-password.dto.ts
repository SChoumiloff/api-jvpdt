import { IsNotEmpty, Matches } from "class-validator";

export class UpdatePasswordDto {
    @IsNotEmpty()
    @Matches(/((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,30})/, {
      message:
        'Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule, un chiffre et être entre 8 et 30 caractères.',
    })
    password: string;
}