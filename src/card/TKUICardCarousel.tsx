import React from "react";
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./TKUICardCarousel.css";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../util/TKUIResponsiveUtil";
import DeviceUtil from "../util/DeviceUtil";
import TKUISlideUp, {TKUISlideUpOptions} from "./TKUISlideUp";

interface IProps {
    selected?: number;
    onChange?: (selected: number) => void;
    slideUpOptions?: TKUISlideUpOptions;
}

interface IState {
    freezeCarousel: boolean
}

class TKUICardCarousel extends React.Component<IProps, IState> {


    constructor(props: IProps) {
        super(props);
        this.state = {
            freezeCarousel: false
        };
    }

    public render(): React.ReactNode {
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
                    >
                        <div className={"TKUICardCarousel-middle"}>
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
                            >
                                {React.Children.map(this.props.children, (child: any, i: number) =>
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