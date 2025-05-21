export interface Project{

    
    projectID:number;
    projectName:string;
   description:string
   startDate:string | Date;
   endDate:string | Date;
    status:string
    projectLeaderID?:number

    projectLeaderFirstName:string
    projectLeaderLastName:string
    projectLeaderURL:string
    employeeIdsToAdd?: number[];
    employeeIdsToRemove?: number[];

}