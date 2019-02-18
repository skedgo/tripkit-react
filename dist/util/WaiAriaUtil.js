var WaiAriaUtil = /** @class */ (function () {
    function WaiAriaUtil() {
    }
    WaiAriaUtil.addTabbingDetection = function () {
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    };
    WaiAriaUtil.handleFirstTab = function (e) {
        if (e.keyCode === 9) {
            document.body.classList.add('user-is-tabbing');
            window.removeEventListener('keydown', WaiAriaUtil.handleFirstTab);
            window.addEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        }
    };
    WaiAriaUtil.handleMouseDownOnce = function () {
        document.body.classList.remove('user-is-tabbing');
        window.removeEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    };
    return WaiAriaUtil;
}());
export default WaiAriaUtil;
//# sourceMappingURL=WaiAriaUtil.js.map