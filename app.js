import http from "http";
import https from "https";
import fs from "node:fs";
import { URL } from "url";
import { StringDecoder } from "string_decoder";
import config from "./config.js";
import handlers from "./handlers/index.js";
import { JsonToObject } from "./lib/utils.js";
// import { createFile, readFile, updateFile, deleteFile } from "./lib/data.js";

const serverFunction = (req, res) => {
	/* parsing url and taking required data */
	const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
	const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, "");
	const method = req.method.toUpperCase();
	const params = parsedUrl.searchParams;
	const headers = req.headers;

	/* get payloads if there are any */
	const stringDecoder = new StringDecoder("utf-8");
	let payload = "";

	/* listening to data events */
	req.on("data", (data) => {
		payload += stringDecoder.write(data);
	});

	req.on("end", () => {
		payload += stringDecoder.end();
		const handler = router[path] ?? router["notFound"];
		const data = {
			path,
			params,
			method,
			headers,
			payload: JsonToObject(payload),
		};
		handler(data).then((response) => {
			res.setHeader("Content-Type", "application/json");
			res.writeHead(response?.status ?? 500);
			res.end(
				JSON.stringify(response?.data ?? "Placeholder data due to no data")
			);
		});
	});
};
const httpsOptions = {
	key: fs.readFileSync("./https/localhost-key.pem"),
	cert: fs.readFileSync("./https/localhost.pem"),
};
const httpServer = http.createServer(serverFunction);
const httpsServer = https.createServer(httpsOptions, serverFunction);

httpServer.listen(config.port, () => {
	console.log("http listening on port ", config.port);
});

httpsServer.listen(config.httpsPort, () => {
	console.log("https listening on port ", config.httpsPort);
});

const router = {
	ping: handlers.ping,
	users: handlers.users,
	tokens: handlers.tokens,
	checks: handlers.checks,
	notFound: handlers.notFound,
};
