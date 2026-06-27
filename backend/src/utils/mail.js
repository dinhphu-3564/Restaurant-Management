const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerifyEmail({ to, name, verifyUrl }) {
  await transporter.sendMail({
    from: `"Dê Hương Sơn" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Xác thực email tài khoản Dê Hương Sơn",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Xin chào ${name},</h2>
        <p>Bạn vừa đăng ký tài khoản tại Dê Hương Sơn.</p>
        <p>Vui lòng bấm nút bên dưới để xác thực email:</p>
        <p>
          <a href="${verifyUrl}"
             style="display:inline-block;padding:12px 18px;background:#047857;color:white;text-decoration:none;border-radius:10px;font-weight:bold;">
            Xác thực email
          </a>
        </p>
        <p>Liên kết này có hiệu lực trong 24 giờ.</p>
      </div>
    `,
  });
}

module.exports = {
  sendVerifyEmail,
};
