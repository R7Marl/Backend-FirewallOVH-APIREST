import router from "./servers/firewall.routes"
export default (app) => {
  app.use('v1/servers/', router);
}