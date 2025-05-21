export interface Comment{
    commentID?: number,
    username?: string,
    userPictureURL?: string,
    commentText: string,
    showText?: boolean ,
    userID: number,
    creationDate?: string | Date,
    assignmentID?: number
    EditingComment?: boolean;
   
}