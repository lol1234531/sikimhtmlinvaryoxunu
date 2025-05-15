const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: 'aa.env' }); // << Burada dəyişiklik edildi

const app = express();
const PORT = 5501;

app.use(cors());
app.use(bodyParser.json());

let verificationCodes = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post('/send-code', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "E-poçt ünvanı tələb olunur." });
  }

  const code = generateCode();
  verificationCodes[email] = code;

  const mailOptions = {
    from: `"Shop-ya" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Shop-ya doğrulama:',
    text: `Salam! Giriş üçün təsdiq kodunuz: ${code}`,
    html: `
      <h3>Salam!</h3>
      <p>Shop-ya saytına daxil olmaq üçün təsdiq kodunuz:</p>
      <h2 style="color: #2e6da4;">${code}</h2>
      <p>Bu kodu sayta daxil edərək girişinizi tamamlaya bilərsiniz.</p>
      <p style="font-size: 12px; color: gray;">Bu mesaj avtomatik göndərilib, əgər siz deyilsinizsə, lütfən bu mesajı nəzərə almayın.</p>
    `
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Mail göndərmə xətası:", error);
      return res.status(500).json({ success: false, message: "Kod göndərilə bilmədi." });
    }
    console.log("Kod göndərildi:", code);
    return res.json({ success: true, message: "Kod göndərildi." });
  });
});

app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ success: false, message: "E-poçt və kod tələb olunur." });
  }

  if (verificationCodes[email] === code) {
    delete verificationCodes[email];
    return res.json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: "Kod düzgün deyil." });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server ${PORT} portunda işləyir...`);
});
