import packageInfo from '../package.json';

function getPackageInfo() {
	return packageInfo;
}

function getUserAgent() {
	return "kiteconnectjs/" + packageInfo.version;
}

export default {
	getPackageInfo,
	getUserAgent
};
