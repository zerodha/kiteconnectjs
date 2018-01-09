var packageInfo = require('../package.json');

function getPackageInfo() {
	return packageInfo;
}

function getUserAgent() {
	return "kiteconnectjs v" + packageInfo.version;
}

module.exports = {
	getPackageInfo: getPackageInfo,
	getUserAgent: getUserAgent
};
