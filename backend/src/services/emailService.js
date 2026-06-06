const nodemailer = require('nodemailer');

let transporter;

async function initTransporter() {
  if (!transporter) {
    let testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }
  return transporter;
}

const sendEmail = async (to, subject, text, html) => {
  try {
    const tp = await initTransporter();
    let info = await tp.sendMail({
      from: '"StockOS" <noreply@stockos.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      text: text,
      html: html,
    });
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendEmail };
