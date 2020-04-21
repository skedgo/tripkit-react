import React from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "./TKUICardCarousel.css";
import { TKUISlideUpOptions } from "./TKUISlideUp";
interface IProps {
    selected?: number;
    onChange?: (selected: number) => void;
    slideUpOptions?: TKUISlideUpOptions;
}
interface IState {
    freezeCarousel: boolean;
    handles: Map<number, any>;
}
declare class TKUICardCarousel extends React.Component<IProps, IState> {
    constructor(props: IProps);
    private registerHandle;
    render(): React.ReactNode;
}
export default TKUICardCarousel;
