import nodeMailer from "nodemailer";
import { env } from "./env";

const transport = nodeMailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	auth: {
		user: "marlen.swaniawski52@ethereal.email",
		pass: env.GMAIL_PASS,
	},
});

export interface mailOptions {
	to?: string | "marlen.swaniawski52@ethereal.email";
	subject: string;
	text: string;
	html?: string;
}
export async function sendAnEmail({
	subject,
	text,
	html,
	to = "marlen.swaniawski52@ethereal.email",
}: mailOptions) {
	transport.sendMail(
		{
			from: "marlen.swaniawski52@ethereal.email",
			to,
			subject,
			text,
			html,
		},
		(error, info) => {
			if (error) {
				console.log(error);
			} else {
				console.log(info.response);
			}
		},
	);
}
