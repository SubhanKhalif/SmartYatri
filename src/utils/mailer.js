// /utils/mailer.js
import nodemailer from 'nodemailer';

const email = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;

if (!email || !emailPassword) {
  throw new Error('EMAIL and EMAIL_PASSWORD must be defined in environment variables');
}

const transporter = nodemailer.createTransport({
  service: 'gmail', // you can change this or use SMTP object
  auth: {
    user: email,
    pass: emailPassword,
  },
});

export default transporter;
