import React from "react";
import Drawer from 'react-drag-drawer';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./TKUICardCarousel.css";

interface IProps {
    selected?: number;
    onChange?: (selected: number) => void;
}

class TKUICardCarousel extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <Drawer
                open={true}
                modalElementClass={"TKUICardCarousel-modal"}
                containerElementClass={"TKUICardCarousel-modalContainer"}
                allowClose={false}
                dontApplyListeners={true}
            >
                <div className={"TKUICardCarousel-middle"}>
                    <Carousel
                        showStatus={false}
                        showThumbs={false}
                        transitionTime={500}
                        selectedItem={this.props.selected}
                        onChange={this.props.onChange}
                        // width={'470px'}
                        // emulateTouch={true}
                    >
                        {React.Children.map(this.props.children, (child: any, i: number) =>
                            <div className={"TKUICardCarousel-pageWrapper"} key={i}>
                                {child}
                            </div>
                        )}
                    </Carousel>
                </div>
            </Drawer>
        );
    }

}

export default TKUICardCarousel;