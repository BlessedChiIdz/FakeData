import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { IAnyObject } from "./interfaces/IAnyObject";
import { randAddress, randFullName } from "@ngneat/falso";
import mapTranslateFunctionName, {
  mapTranslateFunctionObject,
} from "./logicComponents/translate/EngToRu";
import { IMainGeneratorProps } from "./interfaces/IMainGeneratorProps";
import { mainGenerator } from "./logicComponents/generator/mainGenerator";
import { namesGenerator } from "./logicComponents/generator/namesGenerator";
import { addressGenerator } from "./logicComponents/generator/addressGenerator";
import { fastifyPlaginProd } from "./plugins/bg/db";
import { startLocal } from "./secondConnection";
import { userInfo } from "os";
import { tablesToModify } from "./constants/tables";
import { error } from "console";
import { Limit } from "./constants/generateConstants";
const format = require('pg-format');
const fastify: FastifyInstance = Fastify({ logger: true });

// Регистрация плагина для подключения к базе данных
fastify.register(fastifyPlaginProd);

const startProdConnection = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

fastify.get("/generateRandomNames", async (req, reply: FastifyReply) => {
  try {
    const names = await namesGenerator(100);
    let namesRu: string[] = [];
    const pushToNamesRu = await mapTranslateFunctionName(names, namesRu);
    reply.send(namesRu);
  } catch (err) {
    reply.status(500).send(err);
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
      reply.send(countOfRequests);
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
    const props: IMainGeneratorProps = {
      name: true,
      params: {
        itemsCount: 100,
      },
    };
    const addresses = randAddress({length:1, locale:'ru'})
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
  try {
    tablesToModify.map(async (table) => {
      // const formattedColumns = table.tableColumns.map(column => format('%I', column.data)).join(', ');
      // const tables = await fastify.db.manyOrNone(
      //   `SELECT ${formattedColumns} FROM public."${table.tableName}" LIMIT ${Limit}` //TODO доделать, исключая генерацию данных при одинаковых людях
      // );
      table.tableColumns.map(async(column) => {
        const funcToGenerate =  mainGenerator(column.type)
        let data;
        if(funcToGenerate !== undefined){
          data = await funcToGenerate(Limit)
        } else {
          reply.status(500).send("wrong column type" + table + column.type)
        }
        console.log(data)
        for(let i = 0;i<Limit;i++){
          const update  = await fastify.db.query(
            `
            WITH rows_to_update AS (
              SELECT id
              FROM public."${table.tableName}"
              ORDER BY id
              LIMIT 1
            )
            UPDATE public."${table.tableName}" SET "${column.data}" = '${data[i]}' 
            FROM rows_to_update
            WHERE public."${table.tableName}".id = rows_to_update.id;` 
          )
        }
      })
    });
    reply.send(1)
  } catch (err) {
    reply.status(500).send(err);
  }
});

startProdConnection();
startLocal();
