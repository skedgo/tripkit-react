import React from "react";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./TKUICardCarousel.css";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";
import TKUISlideUp, {TKUISlideUpOptions} from "./TKUISlideUp";
import classNames from "classnames";
import Util from "../util/Util";

interface IProps {
    selected?: number;
    onChange?: (selected: number) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IState {
    freezeCarousel: boolean;
    handles: Map<number, any>;
}

class TKUICardCarousel extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            freezeCarousel: false,
            handles: new Map<number, any>()
        };
        this.registerHandle = this.registerHandle.bind(this);
    }

    private registerHandle(index: number, handle: any) {
        // handles is part of the state to force a re-render when a new handle is registered, and so TKUISlideUp always
        // has the current handle.
        const handles = this.state.handles;
        handles.set(index, handle);
        this.setState({
            handles: handles
        });
    }

    public render(): React.ReactNode {
        const children = Util.isFunction(this.props.children) ?
            (this.props.children as (registerHandle: (index: number, handle: any) => void)=> JSX.Element)(this.registerHandle) :
            this.props.children;
        return (
            <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                    <TKUISlideUp
                        {...this.props.slideUpOptions}
                        containerClass={"TKUICardCarousel-modalContainer"}
                        modalClass={"TKUICardCarousel-modal"}
                        onDrag={() => {
                            this.setState({freezeCarousel: true});
                        }}
                        onDragEnd={() => {
                            this.setState({freezeCarousel: false});
                        }}
                        handleRef={this.props.selected !== undefined && this.state.handles.get(this.props.selected)}
                    >
                        <div className={classNames("TKUICardCarousel-middle",
                            children && Array.isArray(children) && children.length > 12 && "TKUICardCarousel-lotOfPages")}>
                            <Carousel
                                showStatus={false}
                                showThumbs={false}
                                showArrows={!DeviceUtil.isTouch()}
                                // showIndicators={!DeviceUtil.isTouch()}
                                transitionTime={500}
                                selectedItem={this.props.selected}
                                onChange={this.props.onChange}
                                // emulateTouch={true}
                                swipeable={!this.state.freezeCarousel}
                                useKeyboardArrows={DeviceUtil.isDesktop}
                            >
                                {React.Children.map(children, (child: any, i: number) =>
                                    <div className={"TKUICardCarousel-pageWrapper"} key={i}>
                                        {child}
                                    </div>
                                )}
                            </Carousel>
                        </div>
                    </TKUISlideUp>
                }
            </TKUIViewportUtil>
        );
    }

}

export default TKUICardCarousel;