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

class TKUICardCarousel extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <TKUIViewportUtil>
                {(viewportProps: TKUIViewportUtilProps) =>
                    <TKUISlideUp
                        {...this.props.slideUpOptions}
                        containerClass={"TKUICardCarousel-modalContainer"}
                        modalClass={"TKUICardCarousel-modal"}
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