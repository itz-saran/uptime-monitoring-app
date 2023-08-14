import { createFile, deleteFile, readFile, updateFile } from "../lib/data.js";
import { hashPassword, isString } from "../lib/utils.js";
import _tokens from "./tokens.handler.js";

const _users = {};

/* User CRUD */
_users.GET = async (data) => {
	if (!data.params) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	let phone = data.params.get("phone");
	phone = isString(phone, 10, 10) ? phone.trim() : null;

	if (!phone) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	/* User auth */
	let token = data.headers?.authorization;
	token = isString(token, 20, 20) ? token : null;
	/* verify token from header */
	if (!(await _tokens.verify(token, phone))) {
		return {
			status: 403,
			data: "User not authorized. Missing auth token / invalid token",
		};
	}

	try {
		const { data } = await readFile("users", phone);
		delete data.password;
		return {
			status: 200,
			data,
		};
	} catch (error) {
		return {
			status: 404,
			data: error,
		};
	}
};

_users.POST = async (data) => {
	if (!data.payload) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	let { firstName, lastName, phone, password, tos } = data.payload;

	firstName = isString(firstName) ? firstName.trim() : null;
	lastName = isString(lastName) ? lastName.trim() : null;
	phone = isString(phone, 10, 10) ? phone.trim() : null;
	password = isString(password) ? hashPassword(password.trim()) : null;
	tos = Boolean(tos);

	if (firstName && lastName && phone && password && tos) {
		try {
			const userPayload = {
				firstName,
				lastName,
				phone,
				password,
				tos,
			};
			const user = await createFile("users", phone, userPayload);
			return {
				status: 200,
				data: user.data,
			};
		} catch (error) {
			return {
				status: 400,
				data: error,
			};
		}
	} else {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
};

_users.PUT = async (data) => {
	if (!data.payload) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	let { phone, firstName, lastName, password } = data.payload;
	phone = isString(phone, 10, 10) ? phone.trim() : null;
	firstName = isString(firstName) ? firstName.trim() : null;
	lastName = isString(lastName) ? lastName.trim() : null;
	password = isString(password) ? hashPassword(password.trim()) : null;

	/* User auth */
	let token = data.headers?.authorization;
	token = isString(token, 20, 20) ? token : null;
	/* verify token from header */
	if (!(await _tokens.verify(token, phone))) {
		return {
			status: 403,
			data: "User not authorized. Missing auth token / invalid token",
		};
	}

	if (phone && (firstName || lastName || password)) {
		try {
			const { data: oldData } = await readFile("users", phone);
			oldData.firstName = firstName ?? oldData.firstName;
			oldData.lastName = lastName ?? oldData.lastName;
			oldData.password = password ? hashPassword(password) : oldData.password;
			try {
				const { data: updatedData } = await updateFile("users", phone, oldData);
				delete updatedData.password;
				return {
					status: 200,
					data: updatedData,
				};
			} catch (error) {
				return {
					status: 500,
					data: error,
				};
			}
		} catch (error) {
			return {
				status: 404,
				data: error,
			};
		}
	} else {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
};

_users.DELETE = async (data) => {
	if (!data.params) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	let phone = data.params.get("phone");
	phone = isString(phone, 10, 10) ? phone.trim() : null;

	/* User auth */
	let token = data.headers?.authorization;
	token = isString(token, 20, 20) ? token : null;
	/* verify token from header */
	if (!(await _tokens.verify(token, phone))) {
		return {
			status: 403,
			data: "User not authorized. Missing auth token / invalid token",
		};
	}

	if (!phone) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	try {
		/* Delete checks associated with the given user */
		const { data: userData } = await readFile("users", phone);

		try {
			userData.checks.forEach(
				async (check) => await deleteFile("checks", check)
			);
		} catch (error) {
			return {
				status: 500,
				data: "Error while deleting checks",
			};
		}

		await deleteFile("users", phone);

		return {
			status: 200,
			data: "User deleted successfully",
		};
	} catch (error) {
		return {
			status: 404,
			data: error,
		};
	}
};

export default _users;
