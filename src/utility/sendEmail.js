const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: "manish@goldeneagle.ai",
                pass: "jthj biil efyz fizc",
            },
        });

        const mailOptions = {
            from:"manish@goldeneagle.ai",
            to,
            subject,
            text,
        };

        await transporter.sendMail(mailOptions);
        console.log("OTP sent successfully");
    } catch (error) {
        console.error("Failed to send OTP", error);
        res.status(400).send(error.message)
    }
};

module.exports = sendEmail;
