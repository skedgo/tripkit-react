import React from "react";
import genStyles from "../css/GenStyle.css";
import DeviceUtil from "../util/DeviceUtil";

interface IProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    scrollRef?: (instance: HTMLDivElement | null) => void;
    freezeScroll?: boolean;
}

/**
 * Wrapper for scrollable div that stops propagation of touch events, so scrolling on that div does not cause slide up
 * card gesture to take place.
 */

class TKUIScrollForCard extends React.Component<IProps, {}> {

    private scrollRef: any;
    private lastTouchY: number = 0;

    public render(): React.ReactNode {
        const {scrollRef: any, freezeScroll: boolean, ...props} = this.props;
        return (
            <div
                {...props as any}
                // If freezeScroll (card not on top) and scroll is at initial position, then set overflowY to visible,
                // instead of hidden, since it avoids the undesired scroll freeze problem. Still need to use hidden
                // otherwise, e.g. when user did scroll down, then dragged the card down from header to middle position,
                // and then dragged the card up to top from its body. In this situation we need the workaround below.
                style={{
                    ...this.props.style,
                    ...!this.props.freezeScroll ? {overflowY: 'auto'} :
                        this.scrollRef && this.scrollRef.scrollTop <= 10 ? {overflowY: 'visible'} : {overflowY: 'hidden'},
                    ...{overflowX: 'hidden'} as any
                }}
                // style={{...this.props.style, ...!this.props.freezeScroll ? {overflowY: 'scroll'} : {overflowY: 'hidden'}}}
                ref={(scrollRef: any) => {
                    if (scrollRef && !this.scrollRef) {
                        this.scrollRef = scrollRef;
                        scrollRef.addEventListener("touchstart", (e: any) => {
                            if (scrollRef.scrollTop > 0 && !this.props.freezeScroll) {
                                e.stopPropagation();
                            }
                        });
                        scrollRef.addEventListener("touchmove", (e: any) => {
                            if (scrollRef.scrollTop > 0  && !this.props.freezeScroll) {
                                e.stopPropagation();
                            }

                            // Workaround for scroll on Safari iOS freezes sometimes: when full screen view (start screen
                            // web-app or address bar hidden on Safari) and after dragging card up from its body, and
                            // immediatly trying to scroll down (i.e. slide fingers upwards). If continue trying to scroll
                            // down repeatedly the scroll continues freezed, but if I wait for just 1 or 2 seconds it
                            // recovers movement. The workaround detects finger touch move and adjust scroll programatically
                            // to mimic finger direction. Use 1.5 to give a bit more speed.
                            // TODO: solve the underlying issue. In the meantime, ensure the workaround activates just
                            // when neccesary: Sadfari + iOS + find other conditions, so doesn't cause any bad effect
                            // when not necessary.
                            if (DeviceUtil.isIOS && !this.props.freezeScroll && this.lastTouchY !== -1) {
                                scrollRef.scrollTop = Math.max(scrollRef.scrollTop + (this.lastTouchY - e.layerY) * 1.5, 0);
                            }
                            this.lastTouchY = e.layerY;
                        });
                        scrollRef.addEventListener("touchend", (e: any) => {
                            if (scrollRef.scrollTop > 0  && !this.props.freezeScroll) {
                                e.stopPropagation();
                            }
                            this.lastTouchY = -1;
                        });
                    }
                    if (this.props.scrollRef) {
                        this.props.scrollRef(scrollRef);
                    }
                }}
            >
                {this.props.children}
            </div>
        );
    }

}

export default TKUIScrollForCard;