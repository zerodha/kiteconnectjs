import packageInfo from '../package.json';

/**
 * 
 * @date 07/06/2023 - 21:38:03
 *
 * @returns {*}
 */
function getPackageInfo() {
	return packageInfo;
}

/**
 * 
 * @date 07/06/2023 - 21:38:03
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
