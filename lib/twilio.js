import twilio from "twilio";
import { isString } from "./utils.js";
import config from "../config.js";


const client = twilio(config.accountSid, config.authToken);

export const sendSms = (phoneNo, message) => {
	phoneNo = isString(phoneNo, 10, 10) ? phoneNo : null;
	message = isString(message, 1, 1600) ? message : null;
	if (!phoneNo || !message) return false;

	client.messages
		.create({
			from: config.from,
			to: config.to,
		})
		.then((message) => console.log(message.sid))
		.done();
};
