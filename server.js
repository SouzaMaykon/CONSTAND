const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');

// Configuração do Octokit (API do GitHub)
const octokit = new Octokit({ auth: 'SEU_TOKEN_GITHUB_AQUI' });

// Informações do repositório
const REPO_OWNER = 'souzamaykon';
const REPO_NAME = 'souzamaykon.github.io';
const FILE_PATH = 'index.html'; // Caminho do arquivo a ser atualizado

const app = express();
app.use(bodyParser.json());

// Endpoint para receber os cadastros
app.post('/add-user', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).send('Nome e email são obrigatórios.');
  }

  try {
    // Obter o conteúdo atual do arquivo
    const { data: fileData } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
    });

    const content = Buffer.from(fileData.content, 'base64').toString();

    // Adicionar o novo cadastro no HTML
    const novoConteudo = content.replace(
      '<!-- PLACEHOLDER_USUARIOS -->',
      <li>Nome: ${nome}, Email: ${email}</li>\n<!-- PLACEHOLDER_USUARIOS -->
    );

    // Atualizar o arquivo no repositório
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: Adicionado usuário: ${nome},
      content: Buffer.from(novoConteudo).toString('base64'),
      sha: fileData.sha, // SHA do arquivo atual
    });

    res.send('Usuário adicionado com sucesso!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao adicionar usuário.');
  }
});

// Iniciar o servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(Servidor rodando em http://localhost:${PORT});
});
