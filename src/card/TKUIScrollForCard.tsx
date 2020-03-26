import React from "react";
import genStyles from "../css/GenStyle.css";

interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    scrollRef?: (instance: HTMLDivElement | null) => void;
    cancelTouchEvents?: boolean;
}

/**
 * Wrapper for scrollable div that stops propagation of touch events, so scrolling on that div does not cause slide up
 * card gesture to take place.
 */

class TKUIScrollForCard extends React.Component<IProps, {}> {

    private fullCancel = false;

    public render(): React.ReactNode {
        const {scrollRef: any, cancelTouchEvents: boolean, ...props} = this.props;
        return (
            <div
                {...props}
                style={{...this.props.style, ...genStyles.scrollableY}}
                ref={(scrollRef: any) => {
                    if (this.fullCancel) {
                        if (scrollRef && this.props.cancelTouchEvents) {
                            scrollRef.addEventListener("touchstart", (e: any) => {
                                e.stopPropagation();
                            });
                            scrollRef.addEventListener("touchmove", (e: any) => {
                                e.stopPropagation();
                            });
                            scrollRef.addEventListener("touchend", (e: any) => {
                                e.stopPropagation();
                            });
                        }
                    } else {
                        if (scrollRef && this.props.cancelTouchEvents) {
                            scrollRef.addEventListener("touchstart", (e: any) => {
                                // if (scrollRef.scrollTop + scrollRef.clientHeight < scrollRef.scrollHeight) { // Stop propagation if scrollable and didn't reached the bottom.
                                if (scrollRef.clientHeight !== scrollRef.scrollHeight) { // Stop propagation if scrollable
                                    e.stopPropagation();
                                }
                            });
                            scrollRef.addEventListener("touchmove", (e: any) => {
                                // if (scrollRef.scrollTop + scrollRef.clientHeight < scrollRef.scrollHeight) {
                                if (scrollRef.clientHeight !== scrollRef.scrollHeight) {    // Stop propagation if scrollable
                                    e.stopPropagation();
                                }
                            });
                            scrollRef.addEventListener("touchend", (e: any) => {
                                // if (scrollRef.scrollTop + scrollRef.clientHeight < scrollRef.scrollHeight) {
                                if (scrollRef.clientHeight !== scrollRef.scrollHeight) {    // Stop propagation if scrollable
                                    e.stopPropagation();
                                }
                            });
                        }
                    }

                    if (this.props.scrollRef) {
                        this.props.scrollRef(scrollRef);
                    }
                }}
            >
                {this.props.children}
            </div>
        )
    }

}

export default TKUIScrollForCard;