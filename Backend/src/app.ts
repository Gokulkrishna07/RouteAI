import Fastify from "fastify";
import fastifyJwt from "@fastify/jwt";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import healthRoute from "./routes/health.route";
import authRoute from "./modules/auth/auth.route";
import chatRoute from "./routes/chat.route";
import usageRoute from "./routes/usage.route";
import sessionsRoute from "./modules/sessions/sessions.route";
import corsPlugin from "./plugins/cors";
import rateLimitPlugin from "./plugins/rateLimit";
import { registerErrorHandler } from "./errors/errorHandler";

const app = Fastify({
  logger: true,
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(corsPlugin);

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "supersecret",
});

app.register(rateLimitPlugin);



app.register(healthRoute, { prefix: "/api/v1" });
app.register(authRoute, { prefix: "/api/v1" });
app.register(chatRoute, { prefix: "/api/v1" });
app.register(usageRoute, { prefix: "/api/v1" });
app.register(sessionsRoute, { prefix: "/api/v1" });
registerErrorHandler(app);

export default app;
