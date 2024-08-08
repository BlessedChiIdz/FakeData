import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { fastifyPlaginLocal } from "./plugins/bg/db";

const fastify: FastifyInstance = Fastify({ logger: true });


fastify.register(fastifyPlaginLocal);


fastify.get("/generateRandomNames", async (req, reply: FastifyReply) => {

  try {
    const user = await fastify.db.manyOrNone(
      `SELECT * FROM public."user"
      ORDER BY id ASC `
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



export const sequalize = async () => {
    try {
      await fastify.listen(4000);
      fastify.log.info(`Server listening on ${fastify.server.address()}`);
    } catch (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  };


 sequalize()