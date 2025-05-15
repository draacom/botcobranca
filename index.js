const venom = require('venom-bot');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Pasta para salvar o QR code
const qrDir = path.join(__dirname, 'public', 'qrcode');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

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

      // Salvar QR code como PNG
      // Remover o prefixo base64 da imagem
      const base64Data = base64Qrimg.replace(/^data:image\/png;base64,/, '');
      const qrFilePath = path.join(qrDir, 'whatsapp-qr.png');
      fs.writeFileSync(qrFilePath, base64Data, 'base64');
      console.log('QR Code salvo em:', qrFilePath);
      console.log(`Acesse o QR code em: http://localhost:${port}/qrcode`);
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

// Rota para exibir o QR code
app.get('/qrcode', (req, res) => {
  const qrFilePath = path.join(qrDir, 'whatsapp-qr.png');
  if (fs.existsSync(qrFilePath)) {
    res.send(`
      <h1>QR Code WhatsApp</h1>
      <img src="/qrcode/whatsapp-qr.png" alt="QR Code WhatsApp" />
    `);
  } else {
    res.send('<p>QR Code ainda não gerado.</p>');
  }
});

// Rota para servir o arquivo do QR code
app.use('/qrcode', express.static(qrDir));

// Endpoint que recebe os dados via POST para enviar mensagem
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
