import Fastify, { FastifyInstance, FastifyReply } from "fastify";
import { fastifyPlaginLocal } from "./plugins/bg/db";

const fastify: FastifyInstance = Fastify({ logger: true });


fastify.register(fastifyPlaginLocal);


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