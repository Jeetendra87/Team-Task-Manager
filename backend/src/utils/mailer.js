const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!env.smtp.host) return null;
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth:
      env.smtp.user && env.smtp.pass
        ? { user: env.smtp.user, pass: env.smtp.pass }
        : undefined,
  });
  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const tx = getTransporter();
  if (!tx) {
    // No SMTP configured — log so dev/Railway operators can grab links from logs.
    // eslint-disable-next-line no-console
    console.log(`[mailer:dev] to=${to} subject="${subject}"\n${text || html}`);
    return { delivered: false, dev: true };
  }
  const from = env.smtp.from || "no-reply@localhost";
  await tx.sendMail({ from, to, subject, html, text });
  return { delivered: true };
}

module.exports = { sendMail };
