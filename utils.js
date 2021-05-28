const fs = require('fs');
const rimraf = require('rimraf');

module.exports = {
  verificarPasta(pasta) {
    if (fs.existsSync(pasta) === true) {
      return;
    }

    fs.mkdirSync(pasta);
  },

  apagarPasta(pasta) {
    if (fs.existsSync(pasta)) {
      rimraf(pasta, () => {});
    }
  },

  apagarTodosArquivosPasta(pasta) {
    const files = fs.readdirSync(pasta);
    files.forEach((file) => fs.unlinkSync(`${pasta}/${file}`));
  },

  apagarArquivosAntigos(pasta, data) {
    const files = fs.readdirSync(pasta);
    files.forEach((file) => {
      const pathFile = `${pasta}/${file}`;
      const Stat = fs.statSync(pathFile);
      if (Stat.mtime < data.toDate()) {
        fs.unlinkSync(pathFile);
      }
    });
  },

  carregarArquivoControle(file) {
    const dados = fs.readFileSync(file);
    return JSON.parse(dados);
  },

  criarArquivoControle(file, dados) {
    fs.writeFileSync(file, JSON.stringify(dados));
  },
};
