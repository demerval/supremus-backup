const sevenBin = require('7zip-bin');
const { add } = require('node-7z');
const AppConfig = require('./config/app');
const logger = require('./logger');

class Compactar {
  execute(nomeArquivo, dadosBackup) {
    return new Promise((resolve, reject) => {
      logger.info('Iniciando compactação...');

      const fileCompactado = `${AppConfig.pastas.backup}/${nomeArquivo}.7z`;

      const pathTo7zip = sevenBin.path7za;
      const compress = add(fileCompactado, dadosBackup.backups, {
        $bin: pathTo7zip,
        method: ['0=BCJ', '1=LZMA:d=21'],
      });
      compress.on('error', (err) => reject(err));
      compress.on('end', () => {
        logger.info('Fim da compactação.');
        resolve(fileCompactado);
      });
    });
  }
}

module.exports = Compactar;
