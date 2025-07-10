const nodemailer = require('nodemailer'); // NodeJs Email Sender
const handlebars = require('handlebars'); // Template Engine to send Dynamic HTML
const fs = require('fs'); // File System
const path = require('path'); // Path Setter


// Load Email Template

const loadAccountTemplates = (templateName, data) => {
    const filePath = path.join(__dirname, './emailTemplates/accountEmails', `${templateName}.html`);
    const source = fs.readFileSync(filePath, 'utf-8');
    const compiledTemplate = handlebars.compile(source);
    return compiledTemplate(data);
};

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOSTNAME,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    }

})

// Dispatch Email

// This is the primary function that would be used throughout the application to send emails.
// Parameters
// Type : Refers to the type of email which needs to be sent. Email templates would be selected accordingly
// To : Refers to the reciepent's email address
// Data : Refers to the dynamic data which needs to be passed to the email templates

const dispatchEmail = async (type, to, data) => {

    let subject, html;

    console.log("Type in dispatch email function", type)

    switch (type) {

        // Account Email Configurations
        
        // Password Reset Email Configuration

        case 'forgotPassword':
            subject = 'Reset Your Password'
            html = loadAccountTemplates('forgotPassword', data.data)
            text = 'Password Reset Test'

            try{

                console.log(`[*] Initiating Password Reset Email for ${to}\n`)

                await sendEmail({ to, subject, html })
               
            }
            catch(error){
                console.log("[*] Error in sending reset password email ",error)
            }

            break;

        // Account Creation Email Configuration

        case 'accountCreated':
            console.log("[*] Account Created Email Type used");

         // Account Locked Email Configuration
        
        case 'accountLocked':
            console.log("[*] Account Locked Email Type used ")


        // Email Testing Configuration

        case 'testEmail':
            console.log("[*] Test Email Type used ")

        // Account Disabled Email Configuration

        case 'accountDisabled':
            console.log("[*] Account Disabled Email Type used ")


        default:

        // Default Switch Case (No condition matched)

        console.log(`[*] Unknown email type: ${type}`);
    }


}

const sendEmail = async ({ to, subject, text, html }) => {
    const mailOptions = {
        from: `<hello@demomailtrap.co>`,
        to,
        subject,
        text,
        html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[*] Email launched to ${to}: ${info.messageId}`);
    } catch (err) {
        console.error(`Email launch failed: ${err.message}`);
    }
}

module.exports = {
    sendEmail,
    dispatchEmail,
    transporter
};
