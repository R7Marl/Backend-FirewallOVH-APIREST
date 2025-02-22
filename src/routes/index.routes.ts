import AIRouter from "./ai/ai.routes";
import authRouter from "./auth/auth.routes";
import router from "./servers/firewall.routes";

export default (app: any) => {
  app.use('/v1/servers', router);
  app.use('/v1/auth', authRouter);
  app.use('/v1/ai', AIRouter);
};
