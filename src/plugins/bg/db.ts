import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fp from 'fastify-plugin';
import pgPromise from 'pg-promise';
import { configProd, configuration } from './configuration.bg';

const pgp = pgPromise();
const db = pgp(configProd);

declare module 'fastify' {
  interface FastifyInstance {
    db: pgPromise.IDatabase<any>;
  }
}

export default fp(async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
  fastify.decorate('db', db);
});