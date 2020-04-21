import * as React from "react";
import { SliderProps } from '@material-ui/core';
export declare type TKUISliderProps = SliderProps & {
    thumbIcon?: string;
    label?: string;
    leftLabel?: string;
    rightLabel?: string;
};
declare class TKUISlider extends React.Component<TKUISliderProps, {}> {
    private WithStyle;
    constructor(props: TKUISliderProps);
    render(): React.ReactNode;
}
export default TKUISlider;
