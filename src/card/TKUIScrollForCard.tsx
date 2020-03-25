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

    public render(): React.ReactNode {
        const {scrollRef: any, cancelTouchEvents: boolean, ...props} = this.props;
        return (
            <div
                {...props}
                style={{...this.props.style, ...genStyles.scrollableY}}
                ref={(scrollRef: any) => {
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