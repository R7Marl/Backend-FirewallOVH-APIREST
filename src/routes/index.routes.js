import authRouter from "./auth/auth.routes.js";
import router from "./servers/firewall.routes.js"
export default (app) => {
  app.use('/v1/servers', router);
  app.use('/v1/auth', authRouter);
}