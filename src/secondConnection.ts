import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { fastifyPlaginLocal } from "./plugins/bg/db";

const fastifyLocal: FastifyInstance = Fastify({ logger: true });


fastifyLocal.register(fastifyPlaginLocal);


fastifyLocal.get("/generateRandomNames", async (req, reply: FastifyReply) => {

  try {
    const user = await fastifyLocal.db.manyOrNone(
      `SELECT * FROM public."user"
      ORDER BY id ASC`
    );
    if (user) {
      reply.send(user);
      return(user)
    } else {
      reply.status(404).send({ message: "User not found" });
    }
    } catch (err) {
      reply.status(500).send(err);
    }
});



export const startLocal = async () => {
    try {
      await fastifyLocal.listen(4000);
      fastifyLocal.log.info(`Server listening on ${fastifyLocal.server.address()}`);
    } catch (err) {
      fastifyLocal.log.error(err);
      process.exit(1);
    }
  };


  startLocal()