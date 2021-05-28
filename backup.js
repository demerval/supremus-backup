const Firebird = require('node-firebird');
const AppConfig = require('./config/app');
const Utils = require('./utils');
const logger = require('./logger');

const options = {
  host: 'localhost',
  port: 3050,
  database: 'firma_sgi_23',
  user: 'SYSDBA',
  password: 'masterkey',
  lowercase_keys: false,
  role: null,
  pageSize: 4096,
  manager: true,
};

class Backup {
  async execute(nomePasta) {
    try {
      logger.info('Iniciando backup...');

      const pastaTemp = `${AppConfig.pastas.temp}/${nomePasta}`;
      Utils.verificarPasta(pastaTemp);

      const backups = [];
      const bkpSgi = await this.executaBackup(AppConfig.bancos.sgi, pastaTemp);
      const bkpNfeRepositorio = await this.executaBackup(AppConfig.bancos.nfeRepositorio, pastaTemp);

      backups.push(bkpSgi, bkpNfeRepositorio);

      return { pasta: pastaTemp, backups };
    } catch (error) {
      throw error;
    }
  }

  executaBackup(alias, nomePasta) {
    const fbk = `${nomePasta}/${alias}.fbk`;

    return new Promise((resolve, reject) => {
      Firebird.attach(options, function (err, svc) {
        if (err) return reject(err);

        svc.backup(
          {
            database: alias,
            files: [
              {
                filename: fbk,
                sizefile: '0',
              },
            ],
          },
          function (err, data) {
            logger.info(`Executando backup (${alias})...`);

            if (err) return reject(err);

            data.on('data', (line) => logger.info(line));
            data.on('error', (err) => {
              svc.detach();
              reject(err);
            });
            data.on('end', () => {
              svc.detach();
              logger.info('Backup finalizado.');
              resolve(fbk);
            });
          },
        );
      });
    });
  }
}

module.exports = Backup;
