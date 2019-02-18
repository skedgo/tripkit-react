// import browser from "browser-detect";
// import {detect} from "detect-browser";
export var Device;
(function (Device) {
    Device["PHONE"] = "PHONE";
    Device["TABLET"] = "TABLET";
    Device["DESKTOP"] = "DESKTOP";
})(Device || (Device = {}));
export var OS;
(function (OS) {
    OS["IOS"] = "IOS";
    OS["ANDROID"] = "ANDROID";
    OS["OTHER"] = "OTHER";
})(OS || (OS = {}));
export var BROWSER;
(function (BROWSER) {
    BROWSER["CHROME"] = "CHROME";
    BROWSER["SAFARI"] = "SAFARI";
    BROWSER["FIREFOX"] = "FIREFOX";
    BROWSER["OPERA"] = "OPERA";
    BROWSER["IE"] = "IE";
    BROWSER["EDGE"] = "EDGE";
    BROWSER["OTHER"] = "OTHER";
})(BROWSER || (BROWSER = {}));
var DeviceUtil = /** @class */ (function () {
    function DeviceUtil() {
    }
    DeviceUtil.findDevice = function () {
        switch (DeviceUtil.deviceS) {
            case 'iphone':
            case 'retina':
            case 'blackberry':
            case 'android':
                return Device.PHONE;
            case 'ipad':
            case 'ipad_retina':
            case 'android_tablet':
                return Device.TABLET;
            default:
                return Device.DESKTOP;
        }
    };
    DeviceUtil.findOS = function () {
        switch (DeviceUtil.deviceS) {
            case 'iphone':
            case 'retina':
            case 'ipad':
            case 'ipad_retina':
                return OS.IOS;
            case 'android':
            case 'android_tablet':
                return OS.ANDROID;
            default:
                return OS.OTHER;
        }
    };
    DeviceUtil.findBrowser = function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.includes("chrome") || ua.includes("crios")) {
            return BROWSER.CHROME;
        }
        else if (ua.includes("safari") && !ua.includes("fxios")) {
            return BROWSER.SAFARI;
        }
        else if (ua.includes("firefox") || (ua.includes("fxios"))) {
            return BROWSER.FIREFOX;
        }
        else if (ua.includes("msie") || ua.includes("trident/")) {
            return BROWSER.IE;
        }
        else if (ua.includes("edge")) {
            return BROWSER.EDGE;
        }
        else if (ua.includes("opera")) {
            return BROWSER.OPERA;
        }
        else {
            return BROWSER.OTHER;
        }
    };
    DeviceUtil.initCss = function () {
        document.getElementsByTagName("body")[0].classList.add("device-" + DeviceUtil.device.toLowerCase());
        document.getElementsByTagName("body")[0].classList.add("os-" + DeviceUtil.os.toLowerCase());
        document.getElementsByTagName("body")[0].classList.add("browser-" + DeviceUtil.browser.toLowerCase());
        // window.alert(JSON.stringify(detect()) + " " + DeviceUtil.findBrowser());
        // window.alert(JSON.stringify(browser()) + " " + DeviceUtil.findBrowser());
        // window.alert(window.navigator.userAgent.toLowerCase() + "      " + DeviceUtil.findBrowser());
        // window.alert(DeviceUtil.findBrowser());
        // window.alert(window.navigator.userAgent.toLowerCase());
    };
    DeviceUtil.deviceS = (function () {
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf('android') !== -1) {
            if (ua.indexOf('mobile') !== -1) {
                return "android";
            }
            else {
                return "android_tablet";
            }
        }
        if (ua.indexOf('ipad') !== -1) {
            if (window.devicePixelRatio >= 2) {
                return "ipad_retina";
            }
            return "ipad";
        }
        if (ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1) {
            if (window.devicePixelRatio >= 2) {
                return "retina";
            }
            return "iphone";
        }
        if (ua.indexOf('blackberry') !== -1) {
            return "blackberry";
        }
        return "desktop";
    })();
    DeviceUtil.device = DeviceUtil.findDevice();
    DeviceUtil.os = DeviceUtil.findOS();
    DeviceUtil.browser = DeviceUtil.findBrowser();
    DeviceUtil.isPhone = DeviceUtil.device === Device.PHONE;
    DeviceUtil.isTablet = DeviceUtil.device === Device.TABLET;
    DeviceUtil.isDesktop = DeviceUtil.device === Device.DESKTOP;
    DeviceUtil.isIOS = DeviceUtil.os === OS.IOS;
    DeviceUtil.isAndroid = DeviceUtil.os === OS.ANDROID;
    return DeviceUtil;
}());
export default DeviceUtil;
//# sourceMappingURL=DeviceUtil.js.map