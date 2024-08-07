import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import dbPlugin from "./plugins/bg/db";
import { IAnyObject } from "./interfaces/IAnyObject";
import { randFullName } from "@ngneat/falso";
import mapTranslateFunctionName from "./logicComponents/translate/EngToRu";
import { IMainGeneratorProps } from "./interfaces/IMainGeneratorProps";
import { mainGenerator } from "./logicComponents/generator/mainGenerator";
import { generateNames } from "./logicComponents/generator/namesGenerator";
import { addressGenerator } from "./logicComponents/generator/streetGenerator";

const fastify: FastifyInstance = Fastify({ logger: true });

// Регистрация плагина для подключения к базе данных
fastify.register(dbPlugin);

fastify.get("/generateRandomNames", async (req, reply: FastifyReply) => {
  try {
    const names = await generateNames(100);
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
        [portionLenght, i * portionLenght]     //можно количество в env указать
      );
      const generatedNames: string[] = await generateNames(portionLenght);
      request.map((item, index) => {
        item.fio = generatedNames[index];     //Доделать логику с пропуском чела, если следующий в базе он же
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
const start = async () => {
  try {
    await fastify.listen(3000);
    fastify.log.info(`Server listening on ${fastify.server.address()}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};


fastify.get("/testMethod", async(req: IAnyObject, reply: FastifyReply)=>{
  try {
    const user = await fastify.db.manyOrNone(
      `SELECT "fio", "phone", "contactPhone", "address" 
      FROM public."Emergency_Declarers" LIMIT 10`
    );
    const props:IMainGeneratorProps = {
      name:true,
      params:{
        itemsCount:100
      }
    }
    const qwe = mainGenerator(props) 
    if (user) {
      reply.send(user);
    } else {
      reply.status(404).send({ message: "User not found" });
    }
  } catch (err) {
    reply.status(500).send(err);
  }
})



fastify.get("/testMethod2", async(req: IAnyObject, reply: FastifyReply)=>{
  try {
    const address = addressGenerator(100)
    console.log(address)
  } catch (err) {
    reply.status(500).send(err);
  }
})


start();
