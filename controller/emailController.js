import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmailController = (req, res) => {
  const { name, email, message, mobile } = req.body;

  sendFormDataEmail({ name, email, message, mobile })
    .then(() => {
      res.status(200).send("Form submitted successfully and emails sent");
    })
    .catch((error) => {
      console.error("Error sending email:", error);
      res.status(500).send("Failed to send email");
    });
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendFormDataEmail = (formData) => {
  return new Promise((resolve, reject) => {
    // Email to be sent to you (tekiskymart920@gmail.com)
    const mailOptionsToYou = {
      from: formData.email,
      to: process.env.SMTP_USER,
      subject: "New Form Submission",
      text: `
        Name: ${formData.name}
        Email: ${formData.email}
        Mobile: ${formData.mobile}
        Message: ${formData.message}
      `,
    };

    // Email to be sent to the user
    const mailOptionsToUser = {
      from: "tekiskymart920@gmail.com",
      to: formData.email,
      subject: "Confirmation: Your Message Has Been Received",
      html: `
        <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #007bff; text-align: center; font-family: 'Arial', sans-serif;">Thank You for Reaching Out to Tekisky Pvt Ltd!</h1>
          <p>Dear ${formData.name},</p>
          <p>Thank you for taking the first step toward a brighter future with Tekisky Pvt Ltd. Your message has landed in our inbox like a beacon of opportunity, and we couldn't be more thrilled!</p>
          <p>We've received your inquiry and our team is buzzing with excitement to connect with you. Rest assured, we'll be reaching out to you shortly to dive into the details and discuss the amazing possibilities ahead.</p>
          <p>While you eagerly await our response, why not take a stroll through our <a href="https://tekisky.com" style="color: #007bff; text-decoration: none;">Tekisky Pvt Ltd website</a>? Discover more about our innovative solutions, passionate team, and the incredible projects that fuel our journey.</p>
          <p>Once again, thank you for considering Tekisky Pvt Ltd as your partner in progress. We can't wait to embark on this exciting journey together!</p>
          <div style="margin-top: 20px; text-align: right; font-style: italic; color: #777;">Warm Regards,<br>The Tekisky Talent Team<br>Tekisky Pvt Ltd</div>
        </div>
      `,
    };

    // Send email to you
    transporter.sendMail(mailOptionsToYou, function (error, info) {
      if (error) {
        console.log("Error sending email to you:", error);
        reject(error);
      } else {
        console.log("Email sent to you:", info.response);
        // Send email to the user
        transporter.sendMail(mailOptionsToUser, function (error, info) {
          if (error) {
            console.log("Error sending email to user:", error);
            reject(error);
          } else {
            console.log("Email sent to user:", info.response);
            resolve();
          }
        });
      }
    });
  });
};

export default sendEmailController;
