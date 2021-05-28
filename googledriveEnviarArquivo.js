const fs = require('fs');
const { google } = require('googleapis');
const FolderDriveConfig = require('./config/folder_drive');
const logger = require('./logger');
const GoogleDriveAuth = require('./googledriveAuth');

class GoogleDriveEnviarArquivo {
  async execute(nomeArquivo, file) {
    try {
      const auth = await new GoogleDriveAuth().execute();
      const result = await this.enviarArquivo(auth, nomeArquivo, file);

      return result;
    } catch (error) {
      throw error;
    }
  }

  enviarArquivo(auth, nomeArquivo, file) {
    logger.info('Enviando arquivo para o google drive...');
    const fileMetadata = {
      name: `${nomeArquivo}.7z`,
      parents: [FolderDriveConfig.folderId],
    };
    const media = {
      mimeType: 'backup/7z',
      body: fs.createReadStream(file),
    };

    return new Promise((resolve, reject) => {
      const drive = google.drive({ version: 'v3', auth });
      drive.files.create(
        {
          resource: fileMetadata,
          media: media,
          fields: 'id',
        },
        function (err, file) {
          if (err) return reject(err);

          return resolve('Arquivo enviado.');
        },
      );
    });
  }
}

module.exports = GoogleDriveEnviarArquivo;
