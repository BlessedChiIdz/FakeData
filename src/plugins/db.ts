import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fpProd from 'fastify-plugin';
import pgPromise from 'pg-promise';
import { configProd } from '../configuration.bg';

const pgp = pgPromise();
const dbProd = pgp(configProd);
declare module 'fastify' {
  interface FastifyInstance {
    db: pgPromise.IDatabase<any>;
  }
}

export const fastifyPlaginProd = fpProd(async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.decorate('db', dbProd);
});
