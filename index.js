const venom = require('venom-bot');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

let client;

venom
  .create({
    session: 'bot-cobranca',
    headless: 'new', // ou false para ver o navegador
    catchQR: (base64Qrimg, asciiQR, attempts, urlCode) => {
      console.log('\nQR Code ASCII:\n');
      console.log(asciiQR); // QR em arte ASCII
      console.log('\nQR Code Base64:\n');
      console.log(base64Qrimg); // QR como string base64 (imagem PNG)

      // Opcional: salvar em arquivo ou gerar imagem em frontend
      // Você também pode salvar a base64 em um arquivo .txt para abrir depois
    }
  })
  .then((clientInstance) => {
    client = clientInstance;
    console.log('Bot iniciado e pronto.');

    app.listen(port, () => {
      console.log(`Servidor API rodando na porta ${port}`);
    });
  })
  .catch((erro) => {
    console.error('Erro ao iniciar venom-bot:', erro);
  });

// Endpoint que recebe os dados via POST
app.post('/enviar-mensagem', async (req, res) => {
  try {
    const { telefone, nome, descricao, link, valor, vencimento } = req.body;

    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório.' });
    }

    const number = telefone;
    const mensagem = `Olá ${nome}, 
    
    Segue o link da cobrança referente a "${descricao}" 
    
    Acesse o link:
    \n\n${link}
    
    💰*Valor:* R$ ${valor} 
    📅*Vencimento:* ${vencimento}
    
    Qualquer dúvida, estamos à disposição.
    Setor Financeiro
    IBRA Informática / IBRA Soft`;

    await client.sendText(`${number}@c.us`, mensagem);

    console.log(`Mensagem enviada para ${nome} (${number})`);
    res.json({ status: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});
