import { statSync } from "fs";

const fs = require("fs");

  let configCon: any;
   const data = fs.readFileSync("./tables.json", "utf8", function (err: any, data: any) {
    if (err) throw err;
    return data
  });
  configCon = JSON.parse(data);
  export const configProd = {
    host: configCon.connection.host,          
    port: configCon.connection.port,                 
    database: configCon.connection.database,  
    user: configCon.connection.user,  
    password: configCon.connection.password
  }
  


  //databaseUri: 'postgres://yourUsername:yourPassword@localhost/yourDatabase' 
