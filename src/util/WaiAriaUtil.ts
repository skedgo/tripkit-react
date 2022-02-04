import {genClassNames} from "../css/GenStyle.css";
import {KeyboardEvent} from "react";

export interface AriaAttributes {
    tabIndex?: number;
    ariaHidden?: boolean;
    ariaLabel?: string;
}


class WaiAriaUtil {

    public static getElementByQuerySelector(query: string): Element | undefined {
        const querySearchResult = document.querySelectorAll(query);
        return querySearchResult && querySearchResult.length > 0 ? querySearchResult[0] : undefined;
    }

    public static getElementsByQuerySelector(query: string): Element[] {
        const querySearchResult = document.querySelectorAll(query);
        return Array.from((querySearchResult as any).values());
    }

    private static applyToElement(element: Element, ariaAttributes: AriaAttributes) {
        ariaAttributes.tabIndex !== undefined && element.setAttribute("tabindex", ariaAttributes.tabIndex.toString());
        ariaAttributes.ariaHidden !== undefined && element.setAttribute("aria-hidden", ariaAttributes.ariaHidden.toString());
        ariaAttributes.ariaLabel !== undefined && element.setAttribute("aria-label", ariaAttributes.ariaLabel);
    }

    public static apply(query: string, ariaAttributes: AriaAttributes) {
        const element = this.getElementByQuerySelector(query);
        if (element) {
            this.applyToElement(element, ariaAttributes);
        }
    }

    public static applyToAll(query: string, ariaAttributes: AriaAttributes) {
        const elements = this.getElementsByQuerySelector(query);
        elements.forEach((element: Element) => this.applyToElement(element, ariaAttributes));
    }

    public static keyDownToClick(clickListener: () => void) {
        return (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.keyCode === 32 || e.keyCode === 13) {
                clickListener();
            }
        }
    }

}

export default WaiAriaUtil;