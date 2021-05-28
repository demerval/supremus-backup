require('dotenv/config');

const moment = require('moment');
const Backup = require('./backup');
const Compactar = require('./compactar');
const GoogleDriveEnviarArquivo = require('./googledriveEnviarArquivo');
const AppConfig = require('./config/app');
const Utils = require('./utils');
const fs = require('fs');
const logger = require('./logger');
const GoogleDriveExcluirArquivo = require('./googledriveExcluirArquivos');

const pastaControle = process.env.PASTA_CONTROLE;
const pastaLog = process.env.PASTA_LOGS;
const arquivoControle = `${pastaControle}/${moment().format('YYYY_MM_DD')}.json`;

let executando = false;
let backups = [];
let backupAtivo;

async function executarBackup() {
  const nomeArquivo = moment().format('YYYY_MM_DD_HHmmss');
  const backup = new Backup();
  const dadosBackup = await backup.execute(nomeArquivo);

  const compactar = new Compactar();
  const file7z = await compactar.execute(nomeArquivo, dadosBackup);

  logger.info('Apagando backup temporario...');
  Utils.apagarPasta(dadosBackup.pasta);

  const gd = new GoogleDriveEnviarArquivo();
  const result = await gd.execute(nomeArquivo, file7z);
  logger.info(result);

  backupAtivo.executando = true;
  Utils.criarArquivoControle(arquivoControle, backups);

  executando = false;

  return { ok: true };
}

async function excluirBackupAntigoNoGoogleDrive() {
  const seteDiasAtras = moment().subtract(7, 'days').set('hour', 0).set('minute', 0).set('second', 0).format();
  return await new GoogleDriveExcluirArquivo().execute(seteDiasAtras);
}

async function configBackup() {
  Utils.verificarPasta(AppConfig.pastas.temp);
  Utils.verificarPasta(AppConfig.pastas.backup);
  Utils.verificarPasta(pastaControle);
  Utils.verificarPasta(pastaLog);

  const seteDiasAtras = moment().subtract(7, 'days');
  Utils.apagarArquivosAntigos(pastaLog, seteDiasAtras);
  Utils.apagarArquivosAntigos(AppConfig.pastas.backup, seteDiasAtras);

  await excluirBackupAntigoNoGoogleDrive();

  if (fs.existsSync(arquivoControle)) {
    backups = Utils.carregarArquivoControle(arquivoControle);
  } else {
    Utils.apagarTodosArquivosPasta(pastaControle);

    AppConfig.horaBackup.forEach((h) => {
      backups.push({ hora: h, executando: false });
    });

    Utils.criarArquivoControle(arquivoControle, backups);
  }

  return { ok: true };
}

async function verificarBackup() {
  if (executando === true) {
    return;
  }

  const hora = moment().hour();
  backupAtivo = backups.find((b) => b.hora <= hora && b.executando === false);

  if (backupAtivo === undefined) {
    return;
  }

  try {
    logger.info(`Executar backup ${backupAtivo.hora}...`);
    executando = true;
    const result = await executarBackup();
    if (result.ok) {
      logger.info(`Backup ${backupAtivo.hora} finalizado.`);
    }
  } catch (error) {
    logger.error(error);
  }
}

async function init() {
  try {
    logger.info('Serviço inicializando....');
    await configBackup();
    logger.info('Serviço ativo.');

    setInterval(verificarBackup, 60000);
  } catch (error) {
    logger.errorerror;
  }
}

init();
