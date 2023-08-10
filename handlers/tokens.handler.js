import { createRandomString, hashPassword, isString } from "../lib/utils.js";
import { createFile, deleteFile, readFile, updateFile } from "../lib/data.js";

const _tokens = {};

/* Tokens CRUD */
_tokens.GET = async (data) => {
	if (!data.params) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	let tokenId = data.params.get("tokenId");
	tokenId = isString(tokenId, 20, 20) ? tokenId.trim() : null;

	if (tokenId) {
		try {
			const { data: tokenData } = await readFile("tokens", tokenId);
			return {
				status: 200,
				data: tokenData,
			};
		} catch (error) {
			return {
				status: 404,
				data: "Token not found",
			};
		}
	} else {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
};

_tokens.POST = async (data) => {
	if (!data.payload) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	let { phone, password } = data.payload;
	phone = isString(phone, 10, 10) ? phone.trim() : null;
	password = isString(password) ? hashPassword(password.trim()) : null;
	if (!phone || !password) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}

	try {
		const { data: userData } = await readFile("users", phone);
		if (password === userData.password) {
			// create token with 1hr expiry period.
			const token = {
				tokenId: createRandomString(20),
				phone,
				expires: Date.now() + 60 * 60 * 1000,
			};

			try {
				const { data: tokenData } = await createFile(
					"tokens",
					token.tokenId,
					token
				);
				return {
					status: 200,
					data: tokenData,
				};
			} catch (error) {
				return {
					status: 500,
					data: "Could not create token",
				};
			}
		} else {
			return {
				status: 400,
				data: "Password did not match",
			};
		}
	} catch (error) {
		return {
			status: 400,
			data: "Could not find user",
		};
	}
};

_tokens.PUT = async (data) => {
	if (!data.payload) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	let { extend } = data.payload;
	let tokenId = data.params.get("tokenId");

	extend = Boolean(extend);
	tokenId = isString(tokenId, 20, 20) ? tokenId.trim() : null;

	if (!extend || !tokenId) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	try {
		const { data: oldToken } = await readFile("tokens", tokenId);
		/* If token is expired */
		if (Date.now() > oldToken.expires) {
			return {
				status: 400,
				data: "token already expired and cannot extended",
			};
		}
		oldToken.expires = Date.now() + 60 * 60 * 1000;
		try {
			const { data: updatedToken } = await updateFile(
				"tokens",
				tokenId,
				oldToken
			);
			return {
				status: 200,
				data: updatedToken,
			};
		} catch (error) {
			return {
				status: 500,
				data: "Could not update token",
			};
		}
	} catch (error) {
		return {
			status: 404,
			data: "Could not find any token with the given Id",
		};
	}
};

_tokens.DELETE = async (data) => {
	if (!data.params) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	let tokenId = data.params.get("tokenId");
	tokenId = isString(tokenId, 20, 20) ? tokenId.trim() : null;
	if (!tokenId) {
		return {
			status: 400,
			data: "Missing required fields",
		};
	}
	try {
		await deleteFile("tokens", tokenId);
		return {
			status: 200,
			data: "Token deleted successfully",
		};
	} catch (error) {
		return {
			status: 404,
			data: error,
		};
	}
};

_tokens.verify = async (id, phone) => {
	if (!id || !phone) return false;
	try {
		const { data, success } = await readFile("tokens", id);
		if (success && data) {
			return data.phone === phone && data.expires > Date.now() ? true : false;
		}
	} catch (error) {
		return false;
	}
};

export default _tokens;
