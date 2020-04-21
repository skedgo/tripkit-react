import * as React from "react";
import { CSSProps, TKUIWithStyle } from "../jss/StyleHelper";
import ServiceStopLocation from "../model/ServiceStopLocation";
import Street from "../model/trip/Street";
interface ITKUITripSergmentStepsProps<T> extends IStyleRelevantProps, TKUIWithStyle<ITKUITripSergmentStepsStyle, IStyleRelevantProps> {
    steps: T[];
    toggleLabel?: (open: boolean) => string;
    leftLabel?: (step: T) => string | JSX.Element;
    rightLabel: (step: T) => string | JSX.Element;
    stepMarker?: (step: T) => JSX.Element | undefined;
    stepClassName?: (step: T) => string | undefined;
    onStepClicked?: (step: T) => void;
}
export interface IStyleRelevantProps {
    borderColor: string;
    dashed?: boolean;
}
export interface ITKUITripSergmentStepsStyle {
    step: CSSProps<IStyleRelevantProps>;
    stepClickable: CSSProps<IStyleRelevantProps>;
    leftLabel: CSSProps<IStyleRelevantProps>;
    rightLabel: CSSProps<IStyleRelevantProps>;
    linePanel: CSSProps<IStyleRelevantProps>;
    line: CSSProps<IStyleRelevantProps>;
    linePanelFirst: CSSProps<IStyleRelevantProps>;
    linePanelLast: CSSProps<IStyleRelevantProps>;
    circle: CSSProps<IStyleRelevantProps>;
    circleFirstLast: CSSProps<IStyleRelevantProps>;
    iconPanel: CSSProps<IStyleRelevantProps>;
    iconAngleDown: CSSProps<IStyleRelevantProps>;
}
export declare class ITKUITripSergmentStepsConfig implements TKUIWithStyle<ITKUITripSergmentStepsStyle, IStyleRelevantProps> {
    styles: import("../jss/StyleHelper").TKUIStyles<ITKUITripSergmentStepsStyle, IStyleRelevantProps>;
    randomizeClassNames?: boolean;
    static instance: ITKUITripSergmentStepsConfig;
}
export declare const TKUIStopSteps: React.ComponentType<ITKUITripSergmentStepsProps<ServiceStopLocation>>;
export declare const TKUIStreetSteps: React.ComponentType<ITKUITripSergmentStepsProps<Street>>;
export {};
