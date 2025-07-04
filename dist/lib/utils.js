"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const package_json_1 = __importDefault(require("../package.json"));
/**
 *
 *
 * @returns {*}
 */
function getPackageInfo() {
    return package_json_1.default;
}
/**
 *
 *
 * @returns {string}
 */
function getUserAgent() {
    return 'kiteconnectjs/' + package_json_1.default.version;
}
exports.default = {
    getPackageInfo,
    getUserAgent
};
