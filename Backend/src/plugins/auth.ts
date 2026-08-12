import fp from "fastify-plugin";
import type {
  FastifyInstance,
  FastifyRequest,
  preHandlerHookHandler,
} from "fastify";
import { AppError } from "../errors/errorHandler";
import { API_KEY_SCOPES } from "../modules/apiKeys/apiKeys.constants";
import { extractApiKey } from "../modules/apiKeys/apiKeys.credential";
import { authenticateApiKey } from "../modules/apiKeys/apiKeys.service";
import type { ApiKeyScope, AuthContext } from "../modules/apiKeys/apiKeys.types";

async function authenticateJwt(request: FastifyRequest): Promise<AuthContext> {
  await request.jwtVerify();
  const sub = request.user?.sub;

  if (!sub) {
    throw new AppError("INVALID_TOKEN", 401, "Invalid token payload");
  }

  return {
    userId: sub,
    source: "jwt",
    scopes: [...API_KEY_SCOPES],
    apiKeyId: null,
  };
}

async function resolveAuthContext(request: FastifyRequest): Promise<AuthContext> {
  const apiKey = extractApiKey(request);
  if (apiKey) {
    return authenticateApiKey(apiKey);
  }
  return authenticateJwt(request);
}

export function getAuthContext(request: FastifyRequest): AuthContext {
  if (!request.authContext) {
    throw new AppError("UNAUTHORIZED", 401, "Authentication required");
  }
  return request.authContext;
}

export default fp(async function authPlugin(app: FastifyInstance) {
  app.decorateRequest("authContext", null);

  const authenticate: preHandlerHookHandler = async function (request) {
    request.authContext = await resolveAuthContext(request);
  };

  const requireJwt: preHandlerHookHandler = async function (request) {
    if (extractApiKey(request)) {
      throw new AppError(
        "API_KEY_NOT_ALLOWED",
        403,
        "This endpoint requires a user session and cannot be called with an API key",
      );
    }
    request.authContext = await authenticateJwt(request);
  };

  const requireScope = (scope: ApiKeyScope): preHandlerHookHandler =>
    async function (request) {
      const context = await resolveAuthContext(request);

      if (!context.scopes.includes(scope)) {
        throw new AppError(
          "INSUFFICIENT_SCOPE",
          403,
          `API key is missing the required scope: ${scope}`,
        );
      }

      request.authContext = context;
    };

  app.decorate("authenticate", authenticate);
  app.decorate("requireJwt", requireJwt);
  app.decorate("requireScope", requireScope);
});
