import _users from "./users.handler.js";
import _tokens from "./tokens.handler.js";
import _checks from "./checks.handler.js";

const acceptedMethods = ["GET", "POST", "PUT", "DELETE"];
const handlers = {};

handlers.notFound = async () => ({
	status: 404,
	data: "not found",
});

handlers.ping = async () => ({
	status: 200,
	data: "Server is up and running",
});

handlers.users = async (data) => {
	if (acceptedMethods.includes(data.method)) {
		const response = await _users[data.method](data);
		return response;
	}
	return {
		status: 405,
		data: "Method not allowed",
	};
};

handlers.tokens = async (data) => {
	if (acceptedMethods.includes(data.method)) {
		const response = await _tokens[data.method](data);
		return response;
	}
	return {
		status: 405,
		data: "Method not allowed",
	};
};

handlers.checks = async (data) => {
	if (acceptedMethods.includes(data.method)) {
		const response = await _checks[data.method](data);
		return response;
	}
	return {
		status: 405,
		data: "Method not allowed",
	};
};

export default handlers;
