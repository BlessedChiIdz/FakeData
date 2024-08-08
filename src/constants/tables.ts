import { ITablesAndColumns } from "../interfaces/ITablesAndColumns";

export const tablesToModify:ITablesAndColumns[] = [
    {
        tableName:"Emergency_Declarers",
        tableColumns:["fio","phone","contactPhone","address"],
        tableColumnsType:["fio1","phone1"]
    },
    {
        tableName:"Emergency_Humans",
        tableColumns:["fio","birthYear"]

    }
]
   
