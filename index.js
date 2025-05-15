const express = require('express');
const { create } = require('venom-bot');
const ngrok = require('ngrok');

const app = express();
app.use(express.json());

let clientInstance;

function obterCumprimento() {
  const horaAtual = new Date().getHours();
  if (horaAtual >= 6 && horaAtual < 12) return "Bom dia";
  if (horaAtual >= 12 && horaAtual < 18) return "Boa tarde";
  return "Boa noite";
}

(async () => {
  try {
    clientInstance = await create({
  session: 'bot-cobranca',
  headless: 'new',   // nova flag para headless atual
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
  ],
});

    console.log('🤖 Bot WhatsApp iniciado com sucesso!');

    const url = await ngrok.connect(3000);
    console.log(`🚀 ngrok rodando em: ${url}`);

    app.listen(3000, () => {
      console.log('📡 Servidor rodando na porta 3000');
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
  }
})();

app.get('/', (req, res) => res.send('✅ Bot rodando!'));

app.post('/enviar-mensagem', async (req, res) => {
  const { nome, descricao, link, valor, vencimento, telefone } = req.body;

  if (!clientInstance) return res.status(500).send('❌ Bot não iniciado.');
  if (!nome || !descricao || !link || !valor || !vencimento || !telefone) {
    return res.status(400).send('❌ Dados incompletos.');
  }

  const cumprimento = obterCumprimento();
  const mensagem = `
👋 ${cumprimento} *${nome}*,

Segue abaixo o link para pagamento referente a *${descricao}*:

🔗 *[Acesse aqui](${link})*

💰 *Valor:* R$ ${valor}
📆 *Vencimento:* ${vencimento}

Qualquer dúvida, estamos à disposição.
Setor Financeira
IBRA Informática / IBRA Soft
  `;

  try {
    await clientInstance.sendText(`${telefone}@c.us`, mensagem);
    res.status(200).send('✅ Mensagem enviada!');
  } catch (err) {
    console.error('❌ Erro ao enviar:', err);
    res.status(500).send('Erro ao enviar.');
  }
});
