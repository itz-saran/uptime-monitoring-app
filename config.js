const environment = {};

environment.STAGING = {
	port: 3000,
	name: "staging",
	httpsPort: 443,
	hashingSecret: "moiwepf83fcn3r24fv",
	maxChecks: 5,
};

environment.PRODUCTION = {
	port: 3001,
	name: "production",
	httpsPort: 444,
	hashingSecret: "moiwepf83fcn3r24fv",
	maxChecks: 5,
};

export default environment[process.env.NODE_ENV.toUpperCase()] ??
	environment["STAGING"];
