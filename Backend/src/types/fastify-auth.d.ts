import type { preHandlerHookHandler } from "fastify";
import type {
  ApiKeyScope,
  AuthContext,
} from "../modules/apiKeys/apiKeys.types";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: preHandlerHookHandler;
    requireJwt: preHandlerHookHandler;
    requireScope: (scope: ApiKeyScope) => preHandlerHookHandler;
  }

  interface FastifyRequest {
    authContext: AuthContext | null;
  }
}
