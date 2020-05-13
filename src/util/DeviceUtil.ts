export enum Device {
    PHONE = "PHONE",
    TABLET = "TABLET",
    DESKTOP = "DESKTOP"
}

export enum OS {
    IOS = "IOS",
    ANDROID = "ANDROID",
    OTHER = "OTHER"
}

export enum BROWSER {
    CHROME = "CHROME",
    SAFARI = "SAFARI",
    FIREFOX = "FIREFOX",
    OPERA = "OPERA",
    IE = "IE",
    EDGE = "EDGE",
    OTHER = "OTHER"
}

class DeviceUtil {
    public static deviceS = (() => {
        const ua = window.navigator.userAgent.toLowerCase();

        if (ua.indexOf('android') !== -1) {
            if (ua.indexOf('mobile') !== -1) {
                return "android";
            } else {
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

    private static findDevice(): Device {
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
    }

    private static findOS(): OS {
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
    }

    private static findBrowser(): BROWSER {
        const ua = window.navigator.userAgent.toLowerCase();
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
    }

    public static device: Device = DeviceUtil.findDevice();
    public static os: OS = DeviceUtil.findOS();
    public static browser: BROWSER = DeviceUtil.findBrowser();

    public static isPhone = DeviceUtil.device === Device.PHONE;
    public static isTablet = DeviceUtil.device === Device.TABLET;
    public static isDesktop = DeviceUtil.device === Device.DESKTOP;
    public static isIOS = DeviceUtil.os === OS.IOS;
    public static isAndroid = DeviceUtil.os === OS.ANDROID;

    public static isTouch() {
        return ( 'ontouchstart' in window ) ||
            ( navigator.maxTouchPoints > 0 ) ||
            ( navigator.msMaxTouchPoints > 0 );
    }

    public static initCss() {
        document.getElementsByTagName("body")[0].classList.add("device-" + DeviceUtil.device.toLowerCase());
        document.getElementsByTagName("body")[0].classList.add("os-" + DeviceUtil.os.toLowerCase());
        document.getElementsByTagName("body")[0].classList.add("browser-" + DeviceUtil.browser.toLowerCase());
    }
}

export default DeviceUtil;