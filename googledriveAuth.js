const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const logger = require('./logger');

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const TOKEN_PATH = 'token.json';

class GoogleDriveAuth {
  execute() {
    return new Promise((resolve, reject) => {
      fs.readFile('credentials.json', async (err, content) => {
        if (err) return reject('Error loading client secret file:', err);
        const auth = await this.authorize(JSON.parse(content));

        return resolve(auth);
      });
    });
  }

  authorize(credentials) {
    return new Promise((resolve, reject) => {
      const { client_secret, client_id, redirect_uris } = credentials.installed;
      const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

      // Check if we have previously stored a token.
      fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return this.getAccessToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
        resolve(oAuth2Client);
      });
    });
  }

  getAccessToken(oAuth2Client) {
    return new Promise((resolve, reject) => {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
      });

      console.log('Authorize this app by visiting this url:', authUrl);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return reject('Error retrieving access token', err);
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return reject(err);
            logger.info('Token stored to', TOKEN_PATH);
          });
          resolve(oAuth2Client);
        });
      });
    });
  }
}

module.exports = GoogleDriveAuth;
