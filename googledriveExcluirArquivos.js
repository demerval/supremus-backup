const { google } = require('googleapis');
const FolderDriveConfig = require('./config/folder_drive');
const logger = require('./logger');
const GoogleDriveAuth = require('./googledriveAuth');

class GoogleDriveExcluirArquivo {
  async execute(data) {
    try {
      const auth = await new GoogleDriveAuth().execute();
      const drive = google.drive({ version: 'v3', auth });
      const files = await this.listarArquivos(drive, data);

      logger.info(`Arquivos para exclusão no drive: ${files.length}`);
      if (files.length > 0) {
        for (let file of files) {
          logger.info(`Excluindo arquivo: Nome: ${file.name}`);
          await this.excluirArquivo(drive, file.id);
        }
      }

      return { ok: true };
    } catch (error) {
      throw error;
    }
  }

  listarArquivos(drive, data) {
    return new Promise((resolve, reject) => {
      drive.files.list(
        {
          q: `'${FolderDriveConfig.folderId}' in parents and mimeType='backup/7z' and createdTime < '${data}'`,
          fields: 'nextPageToken, files(id, name, createdTime)',
          spaces: 'drive',
          pageToken: this.pageToken,
        },
        function (err, res) {
          if (err) {
            logger.error(err);
            reject(err);
          } else {
            resolve(res.data.files);
          }
        },
      );
    });
  }

  excluirArquivo(drive, id) {
    return new Promise((resolve, reject) => {
      drive.files
        .delete({ fileId: id })
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }
}

module.exports = GoogleDriveExcluirArquivo;
