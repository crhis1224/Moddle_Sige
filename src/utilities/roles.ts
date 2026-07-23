export const Roles ={
    ADMIN : "admin",
    USER : "user",
    STUDENT:"student",
    NULO : "-"
}


export type RolesType = typeof Roles[keyof typeof Roles];