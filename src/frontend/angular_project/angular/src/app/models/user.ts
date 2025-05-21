export interface User{
    userID: number;
    username:string;
    password: string;
    firstName: string;
    phoneNumber: string;
    pictureUrl: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    timeRegionID: number;
    userRoleID: number;
    activated: number;
    darkTheme ?: number;
    token ?: string;
}