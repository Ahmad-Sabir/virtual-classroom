const nodemailer = require('nodemailer');
const ejs = require('ejs');
const config = require('config');
const EMAIL = config.get('tempEmail');
const PASSWORD = config.get('tempPassword');
const NODE_ENV = config.get('environment');
const MAIL_TRAP_USERNAME = config.get('MAIL_TRAP_USERNAME');
const MAIL_TRAP_PASSWORD = config.get('MAIL_TRAP_PASSWORD');
const MAIL_TRAP_HOST = config.get('MAIL_TRAP_HOST');
const MAIL_TRAP_PORT = config.get('MAIL_TRAP_PORT');

const htmlTotext = require('html-to-text');

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.firstName = user.firstName;
		this.url = url;
		this.from = `Virtual Classroom <${EMAIL}>`;
	}

	newTransport() {
		if (NODE_ENV === 'production') {
			return nodemailer.createTransport({
				service: 'gmail',
				auth: {
					user: EMAIL,
					pass: PASSWORD,
				},
			});
		}
		return nodemailer.createTransport({
			host: MAIL_TRAP_HOST,
			port: MAIL_TRAP_PORT,
			auth: {
				user: MAIL_TRAP_USERNAME,
				pass: MAIL_TRAP_PASSWORD,
			},
		});
	}

	async send(template, subject) {
		//render html based on ejs temp
		const html = await ejs.renderFile(`views/emails/${template}.ejs`, {
			firstName: this.firstName,
			url: this.url,
		});
		// mail options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
		};
		//create transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendEmailVerificationToken() {
		await this.send('emailverification', 'Your Account Verification Link');
	}

	async sendPasswordResetToken() {
		await this.send('passwordResetMail', 'Your Password Reset Link(only valid for 10 minutes)');
	}
	async sendMeetingSchedule() {
		await this.send('meetingSchedule', 'New Meeting Scheduled');
	}

	async sendAssignmentCreated(){
		await this.send('assignmentCreated', 'New Assignment Created');
	}
};
