const transporter = require("./nodemailer");

const sendMail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SENDER_EMAIL,
            to,
            subject,
            text,
        });

        console.log("Email sent:", info.messageId);

        return info;
    } catch (error) {
        console.error("Email error:", error.message);
        throw error;
    }
};

module.exports = sendMail;