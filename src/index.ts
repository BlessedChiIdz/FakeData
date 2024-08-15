import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { IAnyObject } from "./interfaces/IAnyObject";
import { fastifyPlaginProd } from "./plugins/bg/db";
import { customFaker } from "./logicComponents/Faker/faker";
const fs = require("fs");

let globalMap = new Map();
let config: any;
fs.readFile("./tables.json", "utf8", function (err: any, data: any) {
  if (err) throw err;
  config = JSON.parse(data);
});

const fastify: FastifyInstance = Fastify({ logger: true });

// Регистрация плагина для подключения к базе данных
fastify.register(fastifyPlaginProd); 

const startProdConnection = async () => {
  try {
    await fastify.listen(3004);
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.get("/prototype", async (req: IAnyObject, reply: FastifyReply) => {
  for (const table of config.tables) {
    let columnsInTable = [];
    const tableColumnNames: string[] = [];
    table.tableColumns.map((column: any) => {
      tableColumnNames.push(column.columnName);
    });
    const lenght = tableColumnNames.length;
    const whatToSelect = tableColumnNames.join(`", "`);
    for (const column of table.tableColumns) {
      await addIndex(table.tableName, whatToSelect);
      columnsInTable.push(column);
    }
    await Update(table.tableName, whatToSelect, columnsInTable, lenght);
  }
  for (const table of config.tables) {
  }
});

async function getParams(columnMultipleProps: string, sourceProps: string) {
  let params;
  if (columnMultipleProps === "Yes") {
    params = sourceProps.split(", ").reduce((acc, param) => {
      const [key, value] = param.split(":");
      acc[key.trim()] = parseInt(value.trim(), 10);
      return acc;
    }, {} as Record<string, number>);
  }
  if (columnMultipleProps === "No") {
    try {
      const [key, value] = sourceProps.split(": ");
      params = { [key.trim()]: value.trim() };
    } catch (err) {
      console.log(err);
    }
  }
  return params;
}

async function addIndex(tableName: string, columnNames: any) {
  await fastify.db.query(
    `
    DO $$ 
    BEGIN
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name='${tableName}'
            AND column_name='x'
        ) THEN
            ALTER TABLE public."${tableName}"
            ADD COLUMN x integer;
        END IF;
    END $$;
    `
  );

  await fastify.db.query(
    `
      CREATE INDEX CONCURRENTLY ON public."${tableName}" ("${columnNames}") WHERE x IS NULL;
      `
  );
}

async function Update(
  tableName: string, // название таблицы для обновления
  columnNames: any, // названия колонок сджоеные в строку например  " fio", "phone", "contactPhone " 
  columnsInTable: any,
  lenght: number
) {
  const columnNamesConcat = columnNames.replaceAll(",", ",'newWord',");
  let params: number[] = await [];
  for (let i = 0; i < lenght; i++) {
    params[i] = i + 2;
  }
  let paramsS = params.join(", $"); //формирует количество параметров,выдает например 1, $2, $3
  
  try {
    let request = await fastify.db.query(`
      SELECT "${columnNames}"
      FROM public."${tableName}"
      ORDER BY (id)
      LIMIT 1
      `);
    let rowBeforeUpdate: string[] = Object.values(request[0]);
    let k = ["00000000-0000-0000-0000-000000000000"];
    await fastify.db.query(`
      PREPARE _q AS WITH kv AS (
          SELECT id,"${columnNames}"
          FROM public."${tableName}"
          WHERE id > ($1) AND x IS NULL
          ORDER BY (id) 
          LIMIT 1
        ),
        sel AS (
          SELECT "${columnNames}"
          FROM public."${tableName}"
          WHERE id > ($1) AND x IS NULL
          ORDER BY (id)
          OFFSET 1
          LIMIT 1
        )
        , upd AS (
          UPDATE public."${tableName}" T
          SET ("${columnNames}") = ($${paramsS}), x = 1
          WHERE id = (SELECT id FROM kv) AND T.x IS NULL 
          RETURNING id, (Select CONCAT("${columnNamesConcat}") from sel) as old
       ) TABLE upd LIMIT 1;
      `); 
    while (true) {
      let rowBeforeString:string =  rowBeforeUpdate.join(","); 
      let dataToPush: string[] = []; //массив с данными для одной строки
      for (const column of columnsInTable) {
        const source: string = column.source;
        const sourceMethod: string = column.sourceMethod;
        let params = await getParams(column.multipleProps, column.columnProps);
        const mutateData = column.mutateGeneration;
        const data = await generateData(
          source,
          sourceMethod, 
          params,
          mutateData
        );
        dataToPush.push(data); //заполнение массива с данными для одной строки
      }
      rowBeforeUpdate = rowBeforeString.split(',') 
      
      await checkMap(rowBeforeUpdate, dataToPush);
      console.log("NEXTCHECK")
      let arrToResult = k.concat(dataToPush);
      const result = await fastify.db.manyOrNone(
        `EXECUTE _q($1,$${paramsS})`,
        arrToResult
      );
      if (result.length === 0 || result[0].id === undefined || result[0].old === null) { 
        break;
      }
      
      rowBeforeUpdate = result[0].old.split("newWord");
      const row = result[0].id;
      k[0] = row;
    }
    await fastify.db.query(`DEALLOCATE PREPARE _q;`); 
  } catch (err) {
    console.error(err);
  }
}

async function generateData( 
  sourceArr: any,
  sourceMethodArr: any,
  paramsArr: any,
  mutateData: string
) {
  //if(checkMap())
  let data = await (customFaker as any)[sourceArr][sourceMethodArr](paramsArr);
  switch (mutateData) {
    case "phoneSeven":
      data = data.toString();
      data = data.replace("8", "+7"); 
      break;
  }
  return data;
}

async function checkMap(keys: any[], datas: any[]): Promise<boolean> {
  console.log(keys)
  console.log(datas)
  for (let i = 0;i<keys.length;i++) {
    if(keys[i]=== ''){
      datas[i] = ''
      continue
    }
    if (globalMap.has(keys[i])) {
      console.log("YES")
      datas[i] = globalMap.get(keys[i]);
    } else {
      globalMap.set(keys[i], datas[i]);
    }
  }
  return false;
}


startProdConnection();
