import config from "../config.js";
import { createFile, readFile, updateFile } from "../lib/data.js";
import { createRandomString, isString } from "../lib/utils.js";

const _checks = {};

_checks.GET = async () => {};
_checks.POST = async (data) => {
	if (!data.payload) {
		return { status: 400, data: "No payload provided" };
	}
	let { protocol, url, method, successCodes, timeOutSeconds } = data.payload;

	protocol = ["https", "http"].includes(protocol) ? protocol : null;
	url = isString(url, 0) ? url : null;
	method = ["get", "post", "put", "delete"].includes(method) ? method : null;
	successCodes =
		Array.isArray(successCodes) && successCodes.length ? successCodes : null;
	timeOutSeconds =
		parseInt(timeOutSeconds) && timeOutSeconds >= 1 && timeOutSeconds <= 5
			? timeOutSeconds
			: null;

	/* User auth */
	let token = data.headers?.authorization;
	token = isString(token, 20, 20) ? token : null;
	let phone;
	try {
		const { data: tokenData, success } = await readFile("tokens", token);
		if (!success || !tokenData) {
			return {
				status: 400,
				data: "User not authorized. Missing / invalid auth header.",
			};
		}
		/* Take phone number from token */
		phone = tokenData.phone;
	} catch (error) {
		return {
			status: 500,
			data: "Error in fetching tokens",
		};
	}

	if (protocol && url && method && successCodes && timeOutSeconds) {
		const { data: userData } = await readFile("users", phone);
	
		/* find the user's checks */
		const existingChecks =
			Array.isArray(userData.checks) && userData.checks.length
				? userData.checks
				: [];

		if (existingChecks.length < config.maxChecks) {
			const checkId = createRandomString(20);
			try {
				const checkObject = {
					checkId,
					protocol,
					url,
					method,
					successCodes,
					timeOutSeconds,
				};
				const { data: checkData } = await createFile(
					"checks",
					checkId,
					checkObject
				);
				userData.checks = [...existingChecks, checkId];
				try {
					await updateFile("users", phone, userData);
				} catch (error) {
					return {
						status: 500,
						data: "Error in updating user checks",
					};
				}
				return {
					status: 200,
					data: checkData,
				};
			} catch (error) {
				return {
					status: 500,
					data: "Error in creating check",
				};
			}
		} else {
			return {
				status: 400,
				data: "Maximum checks[5] reached for the user",
			};
		}
	} else {
		return {
			status: 400,
			data: "Invalid inputs / missing fields",
		};
	}
};
_checks.PUT = async () => {};
_checks.DELETE = async () => {};

export default _checks;
