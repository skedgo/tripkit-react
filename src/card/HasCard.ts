import {CardPresentation} from "./TKUICard";
import {TKUISlideUpOptions} from "./TKUISlideUp";

export enum HasCardKeys {
    onRequestClose = "onRequestClose",
    cardPresentation = "cardPresentation",
    slideUpOptions = "slideUpOptions"
}

interface HasCard {

    /**
     * Corresponds to ```onRequestClose``` property of [](TKUICard), used on this component implementation.
     * @ctype
     */
    [HasCardKeys.onRequestClose]?: () => void;

    /**
     * Corresponds to ```presentation``` property of [](TKUICard), used on this component implementation.
     * @ctype
     * @default CardPresentation.SLIDE_UP
     */
    [HasCardKeys.cardPresentation]?: CardPresentation;

    /**
     * Options specific for slide up card presentation (when ```cardPresentation``` is CardPresentation.SLIDE_UP).
     * @ctype
     */
    [HasCardKeys.slideUpOptions]?: TKUISlideUpOptions;

}

export default HasCard;