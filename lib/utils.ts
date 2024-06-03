import packageInfo from '../package.json';

/**
 * 
 *
 * @returns {*}
 */
function getPackageInfo() {
	return packageInfo;
}

/**
 * 
 *
 * @returns {string}
 */
function getUserAgent() {
	return 'kiteconnectjs/' + packageInfo.version;
}

export default {
	getPackageInfo,
	getUserAgent
};
