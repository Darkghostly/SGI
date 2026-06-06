const prisma = require('../services/prisma');
const { sendEmail } = require('../services/emailService');

const sendBulkEmail = async (req, res) => {
  try {
    const { subject, message } = req.body;
    
    if (!subject || !message) {
      return res.status(400).json({ error: 'Assunto e mensagem são obrigatórios.' });
    }

    const users = await prisma.usuario.findMany({
      select: { email: true }
    });

    const emails = users.map(u => u.email);

    if (emails.length === 0) {
       return res.status(400).json({ error: 'Nenhum usuário cadastrado para enviar.' });
    }

    const htmlMessage = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>${subject}</h2>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;" />
        <p style="font-size: 12px; color: #999;">Esta é uma mensagem automática do sistema StockOS.</p>
      </div>
    `;

    const previewUrl = await sendEmail(emails, subject, message, htmlMessage);
    
    res.status(200).json({ message: 'E-mails enviados com sucesso!', previewUrl });
  } catch (error) {
    console.error('Erro ao enviar emails:', error);
    res.status(500).json({ error: 'Erro ao enviar emails.' });
  }
};

module.exports = { sendBulkEmail };
