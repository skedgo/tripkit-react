import {TKUISlideUpPosition} from "./TKUISlideUp";


export interface TKUISlideUpOptions {
    initPosition?: TKUISlideUpPosition;
    // For controlled positioning. If set (not undefined), it takes precedence over this.state.position.
    position?: TKUISlideUpPosition;
    onPositionChange?: (position: TKUISlideUpPosition) => void;
    modalUp?: {top: number, unit: string};
    modalMiddle?: {top: number, unit: string};
    modalDown?: {top: number, unit: string};
    draggable?: boolean;
    zIndex?: number;
    showHandle?: boolean;
    containerClass?: string;
}

export default TKUISlideUpOptions;
export const TKUISlideUpOptionsForDoc = (props: TKUISlideUpOptions) => null;
TKUISlideUpOptionsForDoc.displayName = "TKUISlideUpOptions";