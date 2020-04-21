import React from "react";
interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    scrollRef?: (instance: HTMLDivElement | null) => void;
    freezeScroll?: boolean;
}
/**
 * Wrapper for scrollable div that stops propagation of touch events, so scrolling on that div does not cause slide up
 * card gesture to take place.
 */
declare class TKUIScrollForCard extends React.Component<IProps, {}> {
    private scrollRef;
    private lastTouchY;
    render(): React.ReactNode;
}
export default TKUIScrollForCard;
