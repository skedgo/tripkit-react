class WaiAriaUtil {

    public static addTabbingDetection() {
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    }

    private static handleFirstTab(e: any) {
        if (e.keyCode === 9) {
            document.body.classList.add('user-is-tabbing');

            window.removeEventListener('keydown', WaiAriaUtil.handleFirstTab);
            window.addEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        }
    }

    private static handleMouseDownOnce() {
        document.body.classList.remove('user-is-tabbing');

        window.removeEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    }

}

export default WaiAriaUtil;