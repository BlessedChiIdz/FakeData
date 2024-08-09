import { ITablesAndColumns } from "../interfaces/ITablesAndColumns";

export const tablesToModify: ITablesAndColumns[] = [
  {
    tableName: "Emergency_Declarers",
    tableColumns: [
      {
        data: "fio",
        type: "fio1",
      },
      // {
      //   data: "phone",
      //   type: "phone1",
      // },
      // {
      //   data: "contactPhone",
      //   type: "phone1",
      // },
      // {
      //   data: "address",
      //   type: "address",
      // },
    ],
  },
  // {
  //   tableName: "Emergency_Humans",
  //   tableColumns:[{
  //       data:"fio",
  //       type:"fio1"
  //   },
  //   {
  //       data:"birthYear",
  //       type:"year1"
  //   }]
  // },
];
