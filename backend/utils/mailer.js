const nodemailer = require('nodemailer');

// Ensure all required environment variables are set
const { MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS } = process.env;
if (!MAIL_HOST || !MAIL_PORT || !MAIL_USER || !MAIL_PASS) {
    throw new Error('Mail credentials are not fully set in environment variables.');
}

const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: Number(MAIL_PORT),
    auth: {
        user: MAIL_USER,
        pass: MAIL_PASS
    }
});

/**
 * Send an email
 * @param {Object} options - { to, subject, html }
 * @returns {Promise}
 */
function sendMail(options) {
    return transporter.sendMail({
        from: 'CrunchyCart <no-reply@crunchycart.com>',
        ...options
    });
}

module.exports = { sendMail }; 