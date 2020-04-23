import {genClassNames} from "../css/GenStyle.css";

class WaiAriaUtil {

    public static addTabbingDetection() {
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    }

    private static handleFirstTab(e: any) {
        if (e.keyCode === 9) {
            document.body.classList.add(genClassNames.userIsTabbing);

            window.removeEventListener('keydown', WaiAriaUtil.handleFirstTab);
            window.addEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        }
    }

    private static handleMouseDownOnce() {
        document.body.classList.remove(genClassNames.userIsTabbing);

        window.removeEventListener('mousedown', WaiAriaUtil.handleMouseDownOnce);
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
    }

}

export default WaiAriaUtil;