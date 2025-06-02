import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
});

export default transporter;

