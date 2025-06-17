const {
  initConfig,
  initMysql,
  initAdminConfig,
  initNginx,
  initMiniappConfig,
  initCert,
} = require("./buildconfig");
const init = async () => {
  initConfig();
  await initMysql();
  initAdminConfig();
  initNginx();
  initMiniappConfig();
  initCert();
};
init();
