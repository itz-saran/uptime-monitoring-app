import config from "../config.js";
import { createFile, deleteFile, readFile, updateFile } from "../lib/data.js";
import { createRandomString, isString } from "../lib/utils.js";
import _tokens from "./tokens.handler.js";

const _checks = {};

_checks.GET = async (data) => {
  if (!data.params) {
    return {
      status: 400,
      data: "Missing required fields",
    };
  }

  let checkId = data.params.get("checkId");
  checkId = isString(checkId, 20, 20) ? checkId.trim() : null;

  if (!checkId) {
    return {
      status: 400,
      data: "Missing required fields",
    };
  }

  try {
    const { data: existingCheck } = await readFile("checks", checkId);

    if (!existingCheck) {
      return {
        status: 404,
        data: "No check found with given id",
      };
    }

    /* User auth */
    let token = data.headers?.authorization;
    token = isString(token, 20, 20) ? token : null;
    /* verify token from header */
    if (!(await _tokens.verify(token, existingCheck.phone))) {
      return {
        status: 403,
        data: "User not authorized. Missing auth token / invalid token",
      };
    }

    return {
      status: 200,
      data: existingCheck,
    };
  } catch (error) {
    return {
      status: 404,
      data: "No check found with given id",
    };
  }
};

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
          phone,
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

_checks.PUT = async (data) => {
  if (!data.payload) {
    return {
      status: 400,
      data: "Missing required fields",
    };
  }

  let { id, protocol, url, method, successCodes, timeOutSeconds } =
    data.payload;
  /* Get ID from payload */
  id = isString(id, 20, 20) ? id.trim() : null;
  protocol = ["https", "http"].includes(protocol) ? protocol : null;
  url = isString(url, 0) ? url : null;
  method = ["get", "post", "put", "delete"].includes(method) ? method : null;
  successCodes =
    Array.isArray(successCodes) && successCodes.length ? successCodes : null;
  timeOutSeconds =
    parseInt(timeOutSeconds) && timeOutSeconds >= 1 && timeOutSeconds <= 5
      ? timeOutSeconds
      : null;

  if (id && (protocol || url || method || successCodes || timeOutSeconds)) {
    try {
      const { data: oldData } = await readFile("checks", id);

      /* User auth */
      let token = data.headers?.authorization;
      token = isString(token, 20, 20) ? token : null;
      /* verify token from header */
      if (!(await _tokens.verify(token, oldData.phone))) {
        return {
          status: 403,
          data: "User not authorized. Missing auth token / invalid token",
        };
      }

      oldData.protocol = protocol ?? oldData.protocol;
      oldData.url = url ?? oldData.url;
      oldData.method = method ?? oldData.method;
      oldData.successCodes = successCodes ?? oldData.successCodes;
      oldData.timeOutSeconds = timeOutSeconds ?? oldData.timeOutSeconds;

      try {
        const { data: updatedData } = await updateFile("checks", id, oldData);
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
        data: "Check not found for the given id",
      };
    }
  } else {
    return {
      status: 400,
      data: "Missing required fields",
    };
  }
};

_checks.DELETE = async (data) => {
  if (!data.params) {
    return {
      status: 400,
      data: "Missing required fields",
    };
  }

  let checkId = data.params.get("checkId");
  checkId = isString(checkId, 20, 20) ? checkId.trim() : null;

  try {
    const { data: existingCheck } = await readFile("checks", checkId);

    /* User auth */
    let token = data.headers?.authorization;
    token = isString(token, 20, 20) ? token : null;
    /* verify token from header */
    if (!(await _tokens.verify(token, existingCheck.phone))) {
      return {
        status: 403,
        data: "User not authorized. Missing auth token / invalid token",
      };
    }

    try {
      await deleteFile("checks", checkId);
      const { data: existingUser } = await readFile(
        "users",
        existingCheck.phone
      );
      existingUser.checks = existingUser.checks.filter(
        (check) => check !== checkId
      );
      await updateFile("users", existingCheck.phone, existingUser);
      return {
        status: 200,
        data: "check deleted successfully",
      };
    } catch (error) {
      return {
        status: 500,
        data: "Error in updating checks",
      };
    }
  } catch (error) {
    return {
      status: 404,
      data: "No check found with given id",
    };
  }
};

export default _checks;
