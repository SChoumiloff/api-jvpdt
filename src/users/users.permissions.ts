import { Actions, InferSubjects, Permissions } from "nest-casl";
import { Role, User } from "./entities/user.entity";

export type Subjects = InferSubjects<typeof User>;
export const permissions: Permissions<Role, Subjects, Actions> = {
    everyone({
        can
    }),
    ADMIN({
        can()
    })
}