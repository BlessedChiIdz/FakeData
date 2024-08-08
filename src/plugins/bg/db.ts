import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fpProd from 'fastify-plugin';
import pgPromise from 'pg-promise';
import { configLocal, configProd, configuration } from './configuration.bg';

const pgp = pgPromise();
const dbProd = pgp(configProd);
const dbLocal = pgp(configLocal)
declare module 'fastify' {
  interface FastifyInstance {
    db: pgPromise.IDatabase<any>;
  }
}

export const fastifyPlaginProd = fpProd(async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.decorate('db', dbProd);
});

export const fastifyPlaginLocal = fpProd(async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.decorate('db', dbLocal);
});