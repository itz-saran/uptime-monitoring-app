const environment = {};

environment.STAGING = {
	port: 3000,
	name: "staging",
	httpsPort: 443,
	hashingSecret: "moiwepf83fcn3r24fv",
	maxChecks: 5,
	accountSid: "YOUR_TWILIO_ACCOUNT_SID",
	authToken: "YOUR_TWILIO_AUTH_TOKEN",
	from: "YOUR_TWILIO_FROM",
	to: "YOUR_TWILIO_TO",
};

environment.PRODUCTION = {
	port: 3001,
	name: "production",
	httpsPort: 444,
	hashingSecret: "moiwepf83fcn3r24fv",
	maxChecks: 5,
	accountSid: "YOUR_TWILIO_ACCOUNT_SID",
	authToken: "YOUR_TWILIO_AUTH_TOKEN",
	from: "YOUR_TWILIO_FROM",
	to: "YOUR_TWILIO_TO",
};

export default environment[process.env.NODE_ENV.toUpperCase()] ??
	environment["STAGING"];
