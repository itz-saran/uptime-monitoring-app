import fs from "node:fs/promises";
import path, { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { JsonToObject } from "./utils.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDir = path.join(__dirname, "../.data/");

export const createFile = async (dirName, fileName, data) => {
	try {
		const fileDescriptor = await fs.open(
			`${baseDir}${dirName}/${fileName}.json`,
			"wx"
		);
		data = JSON.stringify(data);
		await fileDescriptor.writeFile(data);
		await fileDescriptor.close();
		return {
			success: true,
			msg: "File created successfully",
			data: JsonToObject(data),
		};
	} catch (error) {
		throw {
			msg: error,
			success: false,
			data: null,
		};
	}
};

export const readFile = async (dirName, fileName) => {
	try {
		const fileData = await fs.readFile(
			`${baseDir}${dirName}/${fileName}.json`,
			"utf-8"
		);

		return {
			success: true,
			msg: "File read successfully",
			data: JsonToObject(fileData),
		};
	} catch (error) {
		throw {
			success: false,
			data: null,
			msg: error,
		};
	}
};

export const updateFile = async (dirName, fileName, data) => {
	try {
		const fileDescriptor = await fs.open(
			`${baseDir}${dirName}/${fileName}.json`,
			"r+"
		);
		data = JSON.stringify(data);
		await fileDescriptor.truncate();
		await fileDescriptor.writeFile(data);
		await fileDescriptor.close();
		return {
			success: true,
			msg: "File updated successfully",
			data: JsonToObject(data),
		};
	} catch (error) {
		throw {
			success: false,
			data: null,
			msg: error,
		};
	}
};

export const deleteFile = async (dirName, fileName) => {
	try {
		await fs.unlink(`${baseDir}${dirName}/${fileName}.json`);
		return {
			success: false,
			data: null,
			msg: "File deleted successfully",
		};
	} catch (error) {
		throw {
			success: false,
			data: null,
			msg: error,
		};
	}
};
