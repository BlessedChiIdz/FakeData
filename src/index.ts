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
import { Faker } from "@faker-js/faker";
import { IAddress } from "./interfaces/IAddress1";
const format = require("pg-format");
const fs = require("fs");
import { v4 as uuidv4 } from "uuid";
import { Column } from "pg-promise";

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

fastify.get("/test", async (req, reply: FastifyReply) => {
  try {
  } catch (err) {
    process.exit(1);
  }
});

fastify.get("/user", async (req: IAnyObject, reply: FastifyReply) => {
  try {
    const portionLenght = 10;
    const rows = await fastify.db.oneOrNone(
      'SELECT count(*) AS exact_count FROM public."Emergency_Declarers";'
    );
    const countOfRequests = rows.exact_count / 100;
    for (let i = 0; i < countOfRequests; i++) {
      const request = await fastify.db.manyOrNone(
        `SELECT "fio", "phone", "contactPhone", "address" 
      FROM public."Emergency_Declarers" LIMIT $1 OFFSET $2`,
        [portionLenght, i * portionLenght] //можно количество в env указать
      );
      const generatedNames: string[] = await namesGenerator(portionLenght);
      request.map((item, index) => {
        item.fio = generatedNames[index]; //Доделать логику с пропуском чела, если следующий в базе он же
      });
      console.log(request);
    }
    if (rows) {
      reply.send(1);
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
});

fastify.get("/stand", async (req: IAnyObject, reply: FastifyReply) => {
  try {
    const user = await fastify.db.manyOrNone(
      `SELECT "fio", "phone", "contactPhone", "address" 
      FROM public."Emergency_Declarers" LIMIT 10`
    );
    if (user) {
      reply.send(user);
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
});

// Запуск сервера

fastify.get("/testMethod", async (req: IAnyObject, reply: FastifyReply) => {
  try {
    const user = await fastify.db.manyOrNone(
      `SELECT "fio", "phone", "contactPhone", "address" 
      FROM public."Emergency_Declarers" LIMIT 10`
    );
    console.log(config);
    const props: IMainGeneratorProps = {
      name: true,
      params: {
        itemsCount: 100,
      },
    };
    const addresses = randAddress({ length: 1, locale: "ru" });
    if (user) {
      reply.send(addresses);
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
});

fastify.get("/prototype", async (req: IAnyObject, reply: FastifyReply) => {
  for (const table of config.tables) {
    let dataArr = [];
    const tableColumnNames: string[] = [];
    table.tableColumns.map((column: any) => {
      tableColumnNames.push(column.columnName);
    });
    const whatToSelect = tableColumnNames.join(", ");
    for (const column of table.tableColumns) {
      type CustomFakerMethods = keyof typeof customFaker;
      const source: CustomFakerMethods = column.source as CustomFakerMethods;
      const sourceMethod: string = column.sourceMethod;
      const sourceProps: string = column.columnProps;
      let params;
      //console.log(column);
      if (column.multipleProps === "Yes") {
        params = sourceProps.split(", ").reduce((acc, param) => {
          const [key, value] = param.split(":");
          acc[key.trim()] = parseInt(value.trim(), 10);
          return acc;
        }, {} as Record<string, number>);
        console.log(params);
      }
      if (column.multipleProps === "No") {
        try {
          const [key, value] = sourceProps.split(": ");
          params = { [key.trim()]: value.trim() };
        } catch (err) {
          console.log(err);
        }
      }

      for (let i = 0; i < 500; i++) {
        const data = await (customFaker as any)[source][sourceMethod](params);
        dataArr.push(data);
      }

      // const get = await fastify.db.query(
      //   `
      //     DO $$
      //     DECLARE
      //         iteration INT := 0;
      //     BEGIN
      //         WHILE iteration < 10 LOOP
      //             SELECT ${whatToSelect}
      //             FROM public."${table.tableName}";
      //             iteration := iteration + 1;
      //         END LOOP;
      //     END $$;
      //   `
      // );
      //console.log("qweqeqweqewweqweq" + get);

      // const update = await fastify.db.manyOrNone(
      //   `
      //     SELECT '${whatToSelect}' from public."${table.tableName} LIMIT 100";
      //   `
      // );
      console.log(`SELECT '${whatToSelect}' from public."${table.tableName} LIMIT 100;`)
    }
    console.log(dataArr[501]);
  }
});

async function generateAddress() {
  const address: IAddress = {
    uuid: uuidv4(),
    oktmo: faker.location.zipCode(),
    region: faker.location.state(),
  };
}

startProdConnection();
