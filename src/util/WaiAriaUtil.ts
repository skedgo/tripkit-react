import {genClassNames} from "../css/GenStyle.css";
import {KeyboardEvent} from "react";

class WaiAriaUtil {

    public static addTabbingDetection() {
        window.addEventListener('keydown', WaiAriaUtil.handleFirstTab);
        document.body.setAttribute("tabindex", "-1");
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

    public static getElementByQuerySelector(query: string): Element | undefined {
        const querySearchResult = document.querySelectorAll(query);
        return querySearchResult && querySearchResult.length > 0 ? querySearchResult[0] : undefined;
    }

    public static getElementsByQuerySelector(query: string): Element[] {
        const querySearchResult = document.querySelectorAll(query);
        return Array.from((querySearchResult as any).values());
    }

    public static apply(query: string, tabIndex?: 0 | -1, ariaHidden?: boolean) {
        const element = this.getElementByQuerySelector(query);
        tabIndex !== undefined && element && element.setAttribute("tabindex", tabIndex.toString());
        ariaHidden !== undefined && element && element.setAttribute("aria-hidden", ariaHidden.toString());
    }

    public static applyToAll(query: string, tabIndex?: 0 | -1, ariaHidden?: boolean) {
        const elements = this.getElementsByQuerySelector(query);
        elements.forEach((element: Element) => {
            tabIndex !== undefined && element && element.setAttribute("tabindex", tabIndex.toString());
            ariaHidden !== undefined && element && element.setAttribute("aria-hidden", ariaHidden.toString());
        });
    }

    public static keyDownToClick(clickListener: () => void) {
        return (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.keyCode === 32 || e.keyCode === 13) {
                clickListener();
            }
        }
    }

    public static isUserTabbing(): boolean {
        return document.body.classList.contains(genClassNames.userIsTabbing);
    }

}

export default WaiAriaUtil;