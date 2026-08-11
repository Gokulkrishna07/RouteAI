import type { FastifyJWT as FastifyJwtPlugin } from "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    jwt: FastifyJwtPlugin;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { sub: string; email: string; name: string };
  }
}
