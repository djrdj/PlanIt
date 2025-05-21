export interface Task{
    
        assignmentID: number,
        assignmentName: string,
        description: string,
        status: string,
        priority: string,
        creationDate?: string | Date,
        deadline?: string | Date,
        assignmentListID: number,
        assignmentListName: string,
        parentAssignmentID : number,
        parentAssignmentName?: string;
        assignmentLeadID?: number,
        assignmentLeadURL: string,
        assignmentLeadFirstName: string,
        assignmentLeadLastName: string,
        projectID? :number,
        progress?: number,
        //for task with comments
        assignmentLeaderPictureURL?: string,
        assignedUsers: {
                userID: number, 
                username: string,
                pictureURL: string,
                firstName?: string,
                lastName?: string
        }[],
        comments?: {
                commentID: number,
                username: string,
                userPictureURL: string,
                commentText: string,
                showText?: boolean ;
                userID: number;
                EditingComment?: boolean;
                creationDate?: string | Date;
        }[],
        projectName?: string,
        assignmentPriority?: string,
        assignmentCreationDate?: string | Date,
        assignmentDeadLine?: string | Date,
        assignmentDescription?: any,
        assignmentLeaderUsername?: string,
        employeeIdsToAdd?: number[],
        employeeIdsToRemove?: number[]
}