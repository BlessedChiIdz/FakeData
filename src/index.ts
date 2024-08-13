import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { IAnyObject } from "./interfaces/IAnyObject";
import { randAddress, randFullName } from "@ngneat/falso";
import { IMainGeneratorProps } from "./interfaces/IMainGeneratorProps";
import { mainGenerator } from "./logicComponents/generatorOld/mainGenerator";
import { namesGenerator } from "./logicComponents/generatorOld/namesGenerator";
import { addressGenerator } from "./logicComponents/generatorOld/addressGenerator";
import { fastifyPlaginProd } from "./plugins/bg/db";
import { startLocal } from "./secondConnection";
import { userInfo } from "os";
import { tablesToModify } from "./constants/tables";
import { error } from "console";
import { Limit } from "./constants/generateConstants";
import { mapTranslateFunctionName } from "./logicComponents/translate/EngToRuGoogle";
import i18next from "i18next";
import { customFaker } from "./logicComponents/Faker/faker";
import { fa, Faker } from "@faker-js/faker";
import { IAddress } from "./interfaces/IAddress1";
const format = require("pg-format");
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";
import { Column } from "pg-promise";
import { stringify } from "querystring";
import { glob } from "fs";

let globalMap = new Map();

let config: any;
fs.readFile("./tables.json", "utf8", function (err: any, data: any) {
  if (err) throw err;
  config = JSON.parse(data);
});

const fastify: FastifyInstance = Fastify({ logger: true });
const faker = customFaker;

// Регистрация плагина для подключения к базе данных
fastify.register(fastifyPlaginProd);

const startProdConnection = async () => {
  try {
    await fastify.listen(3002);
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
      const source: string = column.source;
      const sourceMethod: string = column.sourceMethod;
      let params = await getParams(column.multipleProps, column.columnProps);
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
  tableName: string,
  columnNames: any,
  columnsInTable: any,
  lenght: number
) {
  const columnNamesConcat = columnNames.replaceAll(",", ",'newWord',");
  let params: number[] = await [];
  for (let i = 0; i < lenght; i++) {
    params[i] = i + 2;
  }
  let paramsS = params.join(", $");
  let k = ["00000000-0000-0000-0000-000000000000"];
  try {
    let rowBeforeUpdate = await fastify.db.query(`
      SELECT "${columnNames}"
      FROM public."${tableName}"
      ORDER BY (id)
      LIMIT 1
      `);
    await fastify.db.query(`
      PREPARE _q AS WITH kv AS (
          SELECT id,"${columnNames}"
          FROM public."${tableName}"
          WHERE id > ($1) AND x IS NULL
          ORDER BY (id)
          LIMIT 1
        ), upd AS (
          UPDATE public."${tableName}" T
          SET ("${columnNames}") = ($${paramsS}), x = 1
          WHERE id = (SELECT id FROM kv) AND T.x IS NULL 
          RETURNING id, (Select CONCAT("${columnNamesConcat}") from kv) as old
       ) TABLE upd LIMIT 1;
      `);
    while (true) {
      let dataToPush: string[] = [];
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
        dataToPush.push(data);
      }
      if (await checkMap(rowBeforeUpdate,dataToPush)) {
        
      } else {
        addHashToMap(rowBeforeUpdate[0], dataToPush);
      }

      let arrToResult = await k.concat(dataToPush);
      const result = await fastify.db.manyOrNone(
        `EXECUTE _q($1,$${paramsS})`,
        arrToResult
      );
      if (result.length === 0 || result[0].id === undefined) {
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

async function addHashToMap(keys: any[], datas: any[]): Promise<void> {
  //console.log("ADDTOHASH");
  // console.log(keys)
  //  console.log(datas)
  let i = 0;
  for (const key in keys) {
    globalMap.set(key, datas[i]);
    i++;
  }
  // console.log("ENDTOHASH");
}


async function checkMap(keys: any[],datas:any[]): Promise<boolean> {
  console.log(keys);
  console.log(datas)
  const arrReturn = [];
  let whatInCash = []
  let i = 0;
  for (const key in keys[0]) {
    if (globalMap.has(key)) {
      console.log("TRUE");
      arrReturn.push(globalMap.get(key))
    } else {
      console.log("FALSE");
      console.log(key)
      console.log(datas[i])
      globalMap.set(key,datas[i])
    }
    i++;
  }
  return false
}

async function mutateMap(row: any[], datas: any[]): Promise<string[]> {
  console.log(row);
  console.log(datas);
  for (let i = 0; i < datas.length; i++) {
    if (globalMap.has(datas[i])) {
    }
  }
  return ["1"];
}

async function columnToQuery(columnNames: any) {
  columnNames;
}

async function Update2() {
  let k = "";
  let v = 0;

  try {
    await fastify.db.query(`PREPARE _q AS WITH kv AS (
      SELECT k, v
      FROM tbl
      WHERE (k, v) > ($1, $2) AND k BETWEEN 'q' AND 'z' AND x IS NULL
      ORDER BY k, v
      LIMIT 1
    ), upd AS (
      UPDATE tbl T
      SET x = T.v + 1
      WHERE (T.k, T.v) = (TABLE kv) AND T.x IS NULL 
      RETURNING k, v
    ) TABLE upd LIMIT 1;`);

    while (true) {
      const result = await fastify.db.query(`EXECUTE _q($1, $2)`, [k, v]);
      console.log(result[0]);
      const row = result[0];
      if (!row) break;
      k = row.k;
      v = row.v;
      console.log(`(k, v) = ('${k}', ${v})`);
    }
    await fastify.db.query(`DEALLOCATE PREPARE _q;`);
  } catch (err) {
    console.error(err);
  }
}

async function arrayToQuery() {
  89137190734;
  let paramsArr = [];
  let sourceMethodArr = [];
  let sourceArr = [];
  for (const table of config.tables) {
    let dataArr = [];
    const tableColumnNames: string[] = [];
    table.tableColumns.map((column: any) => {
      tableColumnNames.push(column.columnName);
    });
    const whatToSelect = tableColumnNames.join(", ");
    for (const column of table.tableColumns) {
      const source: string = column.source;
      const sourceMethod: string = column.sourceMethod;
      const sourceProps: string = column.columnProps;
      let params = await getParams(column.multipleProps, sourceProps);
      paramsArr.push(params);
      sourceMethodArr.push(sourceMethod);
      sourceArr.push(source);
      console.log(
        `SELECT '${whatToSelect}' from public."${table.tableName} LIMIT 100;`
      );
    }
  }
  return { paramsArr, sourceMethodArr, sourceArr };
}

async function generateAddress() {
  const address: IAddress = {
    uuid: uuidv4(),
    oktmo: faker.location.zipCode(),
    region: faker.location.state(),
  };
}

startProdConnection();
