// NOTE: Real email sending (e.g. via Nodemailer + SMTP, or SendGrid) is not
// wired up yet. For now, this just logs the message so password reset tokens
// are visible during development and demos.
async function sendEmail(to, subject, message) {
    console.log(`📧 [EMAIL STUB] To: ${to} | Subject: ${subject}`);
    console.log(`   Message: ${message}`);
    return true;
}

module.exports = sendEmail;
