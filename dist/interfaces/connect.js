"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validities = exports.OrderTypes = exports.Products = exports.TransactionTypes = exports.Exchanges = exports.PositionTypes = exports.GTTStatusTypes = exports.StatusTypes = exports.MarginTypes = exports.ValidityTypes = exports.Varieties = exports.ProductTypes = void 0;
/**
 * @public
 * @enum {string}
 */
var ProductTypes;
(function (ProductTypes) {
    ProductTypes["PRODUCT_MIS"] = "MIS";
    ProductTypes["PRODUCT_CNC"] = "CNC";
    ProductTypes["PRODUCT_NRML"] = "NRML";
})(ProductTypes = exports.ProductTypes || (exports.ProductTypes = {}));
;
/**
 * @public
 * @enum {string}
 */
var Varieties;
(function (Varieties) {
    Varieties["VARIETY_AMO"] = "amo";
    Varieties["VARIETY_AUCTION"] = "auction";
    Varieties["VARIETY_ICEBERG"] = "iceberg";
    Varieties["VARIETY_REGULAR"] = "regular";
    Varieties["VARIETY_CO"] = "co";
    Varieties["TEST"] = "test";
})(Varieties = exports.Varieties || (exports.Varieties = {}));
;
/**
 * @public
 * @enum {string}
 */
var ValidityTypes;
(function (ValidityTypes) {
    ValidityTypes["VALIDITY_DAY"] = "DAY";
    ValidityTypes["VALIDITY_IOC"] = "IOC";
    ValidityTypes["VALIDITY_TTL"] = "TTL";
})(ValidityTypes = exports.ValidityTypes || (exports.ValidityTypes = {}));
/**
 * @public
 * @enum {string}
 */
var MarginTypes;
(function (MarginTypes) {
    MarginTypes["MARGIN_EQUITY"] = "equity";
    MarginTypes["MARGIN_COMMODITY"] = "commodity";
})(MarginTypes = exports.MarginTypes || (exports.MarginTypes = {}));
/**
 * @public
 * @enum {string}
 */
var StatusTypes;
(function (StatusTypes) {
    StatusTypes["STATUS_CANCELLED"] = "CANCELLED";
    StatusTypes["STATUS_REJECTED"] = "REJECTED";
    StatusTypes["STATUS_COMPLETE"] = "COMPLETE";
    StatusTypes["STATUS_UPDATE"] = "UPDATE";
})(StatusTypes = exports.StatusTypes || (exports.StatusTypes = {}));
/**
 * @public
 * @enum {string}
 */
var GTTStatusTypes;
(function (GTTStatusTypes) {
    GTTStatusTypes["GTT_TYPE_OCO"] = "two-leg";
    GTTStatusTypes["GTT_TYPE_SINGLE"] = "single";
    GTTStatusTypes["GTT_STATUS_ACTIVE"] = "active";
    GTTStatusTypes["GTT_STATUS_TRIGGERED"] = "triggered";
    GTTStatusTypes["GTT_STATUS_DISABLED"] = "disabled";
    GTTStatusTypes["GTT_STATUS_EXPIRED"] = "expired";
    GTTStatusTypes["GTT_STATUS_CANCELLED"] = "cancelled";
    GTTStatusTypes["GTT_STATUS_REJECTED"] = "rejected";
    GTTStatusTypes["GTT_STATUS_DELETED"] = "deleted";
})(GTTStatusTypes = exports.GTTStatusTypes || (exports.GTTStatusTypes = {}));
/**
 * @public
 * @enum {string}
 */
var PositionTypes;
(function (PositionTypes) {
    PositionTypes["POSITION_TYPE_DAY"] = "day";
    PositionTypes["POSITION_TYPE_OVERNIGHT"] = "overnight";
})(PositionTypes = exports.PositionTypes || (exports.PositionTypes = {}));
;
;
/**
 * @public
 * @enum {string}
 */
var Exchanges;
(function (Exchanges) {
    Exchanges["NSE"] = "NSE";
    Exchanges["BSE"] = "BSE";
    Exchanges["NFO"] = "NFO";
    Exchanges["BFO"] = "BFO";
    Exchanges["CDS"] = "CDS";
    Exchanges["MCX"] = "MCX";
    Exchanges["BCD"] = "BCD";
    Exchanges["NSEIX"] = "NSEIX";
})(Exchanges = exports.Exchanges || (exports.Exchanges = {}));
;
/**
 * @public
 * @enum {string}
 */
var TransactionTypes;
(function (TransactionTypes) {
    TransactionTypes["BUY"] = "BUY";
    TransactionTypes["SELL"] = "SELL";
})(TransactionTypes = exports.TransactionTypes || (exports.TransactionTypes = {}));
;
/**
 * @public
 * @enum {string}
 */
var Products;
(function (Products) {
    Products["NRML"] = "NRML";
    Products["MIS"] = "MIS";
    Products["CNC"] = "CNC";
})(Products = exports.Products || (exports.Products = {}));
;
/**
 * @public
 * @enum {string}
 */
var OrderTypes;
(function (OrderTypes) {
    OrderTypes["LIMIT"] = "LIMIT";
    OrderTypes["SL"] = "SL";
    OrderTypes["SLM"] = "SL-M";
    OrderTypes["MARKET"] = "MARKET";
})(OrderTypes = exports.OrderTypes || (exports.OrderTypes = {}));
;
/**
 * @public
 * @enum {string}
 */
var Validities;
(function (Validities) {
    Validities["DAY"] = "DAY";
    Validities["IOC"] = "IOC";
    Validities["TTL"] = "TTL";
})(Validities = exports.Validities || (exports.Validities = {}));
;
;
;
;
;
;
;
;
