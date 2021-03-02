import * as React from "react";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {tKUITripSergmentStepsDefaultStyle} from "./TripSegmentSteps.css";
import {ClassNameMap} from "react-jss";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import ServiceStopLocation from "../model/ServiceStopLocation";
import Street from "../model/trip/Street";
import classNames from "classnames";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";

export interface IClientProps<T> extends TKUIWithStyle<IStyle<T>, IProps<T>> {
    steps: T[];
    toggleLabel?: (open: boolean) => string;
    leftLabel?: (step: T) => string | JSX.Element;
    rightLabel: (step: T) => string | JSX.Element;
    ariaLabel?: (step: T) => string;
    stepMarker?: (step: T) => JSX.Element | undefined;
    stepClassName?: (step: T) => string | undefined;
    onStepClicked?: (step: T) => void;
    borderColor: string;
    dashed?: boolean;
}

export interface IStyle<T> {
    step: CSSProps<T>;
    stepClickable: CSSProps<T>;
    leftLabel: CSSProps<T>;
    rightLabel: CSSProps<T>;
    linePanel: CSSProps<T>;
    line: CSSProps<T>;
    linePanelFirst: CSSProps<T>;
    linePanelLast: CSSProps<T>;
    circle: CSSProps<T>;
    circleFirstLast: CSSProps<T>;
    iconPanel: CSSProps<T>;
    iconAngleDown: CSSProps<T>;
    iconAngleRotate: CSSProps<T>;
    toggle: CSSProps<T>;
    toggleButton: CSSProps<T>;
}

interface IProps<T> extends IClientProps<T>, TKUIWithClasses<IStyle<T>, IClientProps<T>> {}

export type TKUITripSergmentStepsProps<T> = IProps<T>;
export type TKUITripSergmentStepsStyle<T> = IStyle<T>;

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
                    <div className={classes.toggle}>
                        <div className={classes.iconPanel}/>
                        <div className={classNames(classes.linePanel)}>
                            <div className={classes.line}
                                 style={{
                                     borderColor: this.props.borderColor,
                                     borderLeftStyle: borderLeftStyle
                                 }}/>
                        </div>
                        <button className={classes.toggleButton}
                                onClick={() => this.setState({open: !this.state.open})}
                                aria-expanded={this.state.open}
                                aria-controls={this.id}
                        >
                            {this.props.toggleLabel(this.state.open)}
                            <IconAngleDown className={classNames(classes.iconAngleDown, (this.state.open && classes.iconAngleRotate))}
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
                                     tabIndex={0}
                                     aria-label={this.props.ariaLabel && this.props.ariaLabel(step)}
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

class StopSteps extends TripSegmentSteps<ServiceStopLocation> {}
export type TKUIStopStepsProps = IProps<ServiceStopLocation>;
export type TKUIStopStepsStyle = IStyle<ServiceStopLocation>;

export const stopStepsConfig: TKComponentDefaultConfig<TKUIStopStepsProps, TKUIStopStepsStyle> = {
    render: props => <StopSteps {...props}/>,
    styles: tKUITripSergmentStepsDefaultStyle,
    classNamePrefix: "TKUIStopSteps"
};

export const TKUIStopSteps = connect((config: TKUIConfig) => config.TKUIStopSteps, stopStepsConfig,
        mapperFromFunction((clientProps: IClientProps<ServiceStopLocation>) => clientProps));

// Do for StreetSteps the same than for StopSteps.
class StreetSteps extends TripSegmentSteps<Street> {}