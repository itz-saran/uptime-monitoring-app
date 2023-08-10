import crypto from "node:crypto";
import config from "../config.js";

export const isString = (value, minLength, maxLength) => {
	let isValString = typeof value === "string";
	if (!isValString) return false;
	let trimmedValLength = isValString ? value.trim().length : 0;

	if (minLength && !maxLength) {
		return isValString && trimmedValLength >= minLength;
	}

	if (!minLength && maxLength) {
		return isValString && trimmedValLength <= maxLength;
	}

	if (minLength && maxLength) {
		return (
			isValString &&
			trimmedValLength <= maxLength &&
			trimmedValLength >= minLength
		);
	}

	return isValString;
};

export const hashPassword = (password) => {
	if (isString(password)) {
		const hash = crypto
			.createHmac("sha256", config.hashingSecret)
			.update(password)
			.digest("hex");
		return hash;
	}
	return "";
};

export const JsonToObject = (stringObj) => {
	try {
		return JSON.parse(stringObj);
	} catch (err) {
		return null;
	}
};

export const createRandomString = (length) => {
	const possible = "abcdefghijklmnopqrstuvwxyz1234567890";
	let randomString = "";
	if (length > 0) {
		while (randomString.length < length) {
			randomString += possible.charAt(
				Math.floor(Math.random() * possible.length)
			);
		}
	}
	return randomString;
};
