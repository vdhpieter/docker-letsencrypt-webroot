#! /usr/bin/env node

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: process.env.RECEIVER_MAIL,
    from: 'sendgridmailaction@github.com',
    subject: `New activity on ${process.env.GITHUB_REPOSITORY} by ${process.env.GITHUB_ACTOR}`,
    text: 'Event that triggered it: ${process.env.GITHUB_EVENT_NAME}',
    html: `<p>Event that triggered it: ${process.env.GITHUB_EVENT_NAME}</p>`
};

sgMail
    .send(msg)
    .then(() => console.log('Mail sent successfully'))
    .catch(error => console.error(error.toString()));
