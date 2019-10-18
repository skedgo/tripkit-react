import * as React from "react";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {tKUITripSergmentStepsDefaultStyle} from "./TripSegmentSteps.css";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import ServiceStopLocation from "../model/ServiceStopLocation";
import Street from "../model/trip/Street";
import classNames from "classnames";

interface ITKUITripSergmentStepsProps<T> extends IStyleRelevantProps,
    TKUIWithStyle<ITKUITripSergmentStepsStyle, IStyleRelevantProps> {
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

interface IProps<T> extends ITKUITripSergmentStepsProps<T> {
    classes: ClassNameMap<keyof ITKUITripSergmentStepsStyle>
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
}

export class ITKUITripSergmentStepsConfig implements TKUIWithStyle<ITKUITripSergmentStepsStyle, IStyleRelevantProps> {
    public styles = tKUITripSergmentStepsDefaultStyle;
    public randomizeClassNames?: boolean = true; // Default should be undefined in general, meaning to inherit ancestor's
                                              // JssProvider, but in this case is true since multiple instances are
                                              // rendered, each with a different service color.

    public static instance = new ITKUITripSergmentStepsConfig();
}

interface IState {
    open: boolean;
}

class TripSegmentSteps<T> extends React.Component<IProps<T>, IState> {

    private static count = 0;
    private id: string;

    constructor(props: IProps<T>) {
        super(props);
        this.state = {
            open: !this.props.toggleLabel,
        };
        this.id = "trip-segment-steps-" + TripSegmentSteps.count++;
    }

    public render(): React.ReactNode {
        const borderLeftStyle = this.props.dashed ? "dashed" : undefined;
        const classes = this.props.classes;
        return (
            <div>
                {this.props.toggleLabel ?
                    <div className="gl-flex">
                        <div className="TripSegmentDetail-iconPanel"/>
                        <div className={classNames(classes.linePanel, "TripSegmentDetail-linePanel gl-flex gl-center")}>
                            <div className="TripSegmentDetail-line"
                                 style={{
                                     borderColor: this.props.borderColor,
                                     borderLeftStyle: borderLeftStyle
                                 }}/>
                        </div>
                        <button className="TripSegmentSteps-stopBtn gl-link"
                                onClick={() => this.setState({open: !this.state.open})}
                                aria-expanded={this.state.open}
                                aria-controls={this.id}
                        >
                            {this.props.toggleLabel(this.state.open)}
                            <IconAngleDown className={"TripSegmentDetail-iconAngleDown" + (this.state.open ? " gl-rotate180" : "")}
                                           focusable="false"
                            />
                        </button>
                    </div> : undefined}
                <div id={this.id} tabIndex={this.state.open ? 0 : -1}>
                    {this.state.open ?
                        this.props.steps.map((step: T, index: number) => {
                            const stepMarker = this.props.stepMarker && this.props.stepMarker(step);
                            return (
                                <div className={classNames(
                                    classes.step,
                                    this.props.onStepClicked && classes.stepClickable,
                                    this.props.stepClassName && this.props.stepClassName(step))}
                                     key={index}
                                     onClick={this.props.onStepClicked &&
                                     (() => this.props.onStepClicked && this.props.onStepClicked(step))}
                                >
                                    <div className={classes.leftLabel}>
                                        {this.props.leftLabel ? this.props.leftLabel(step) : ""}
                                    </div>
                                    <div className={classNames(classes.linePanel,
                                        index === 0 && classes.linePanelFirst,
                                        index === this.props.steps.length - 1 && classes.linePanelLast)}>
                                        <div className={classes.line}/>
                                        { stepMarker ? stepMarker :
                                            <div className={classNames(classes.circle,
                                                (index === 0 || index === this.props.steps.length - 1) && classes.circleFirstLast)}/>}
                                        <div className={classes.line}/>
                                    </div>
                                    <div className={classes.rightLabel}>
                                        {this.props.rightLabel(step)}
                                    </div>
                                </div>
                            )}) : null}
                </div>
            </div>
        );
    }
}

function applyStyleFc<T>(RawComponent: React.ComponentType<IProps<T>>, classPrefix: string): React.ComponentType<ITKUITripSergmentStepsProps<T>> {
    const RawComponentStyled = withStyleProp(RawComponent, classPrefix);
    return (props: ITKUITripSergmentStepsProps<T>) => {
        const stylesToPass = props.styles || ITKUITripSergmentStepsConfig.instance.styles;
        const randomizeClassNamesToPass = props.randomizeClassNames !== undefined ? props.randomizeClassNames :
            ITKUITripSergmentStepsConfig.instance.randomizeClassNames;
        return <RawComponentStyled {...props} styles={stylesToPass} randomizeClassNames={randomizeClassNamesToPass}/>;
    };
}

// TODO: make applyStyleFc to return a generic component, as the original TripSegmentSteps
class StopSteps extends TripSegmentSteps<ServiceStopLocation> {}
class StreetSteps extends TripSegmentSteps<Street> {}

export const TKUIStopSteps = applyStyleFc(StopSteps, "TKUIStopSteps");
export const TKUIStreetSteps = applyStyleFc(StreetSteps, "TKUIStreetSteps");