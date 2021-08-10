import * as React from "react";
import {ClassNameMap} from "react-jss";
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import classNames from "classnames";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUIServiceStepsDefaultStyle} from "./TKUIServiceSteps.css";
import ServiceShape from "../model/trip/ServiceShape";
import ServiceStopLocation from "../model/ServiceStopLocation";
import DateTimeUtil from "../util/DateTimeUtil";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    steps: ServiceShape[];
    serviceColor: string;
    timezone: string;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIServiceStepsDefaultStyle>


export type TKUIServiceStepsProps = IProps;
export type TKUIServiceStepsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIServiceSteps {...props}/>,
    styles: tKUIServiceStepsDefaultStyle,
    classNamePrefix: "TKUIServiceSteps"
};

class TKUIServiceSteps extends React.Component<IProps, {}> {

    private static count = 0;
    private id: string;

    constructor(props: IProps) {
        super(props);
        this.id = "trip-segment-steps-" + TKUIServiceSteps.count++;
    }

    public render(): React.ReactNode {
        const {steps, classes, timezone, t} = this.props;
        // const stops = steps.reduce((stops: ServiceStopLocation[], shape: ServiceShape) =>
        //     shape.stops ? stops.concat(shape.stops) : stops, []);
        let stopIndex = -1;
        return (
            <div id={this.id}>
                {steps.reduce((stops: JSX.Element[], shape: ServiceShape, shapeI: number) =>
                    stops.concat((shape.stops || []).map((stop: ServiceStopLocation, stopI: number) => {
                        const leftLabel = stop.departure ?
                            DateTimeUtil.momentFromTimeTZ(stop.departure * 1000, timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) :
                            stop.arrival ? DateTimeUtil.momentFromTimeTZ(stop.arrival * 1000, timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) : "";
                        const ariaLabel = stop.name + ", " + t("At.X", {0: leftLabel}) + ". ";
                        stopIndex++;
                        const firstStop = stopIndex === 0;
                        const firstTravelledStop = stopI === 0 && shape.travelled && (shapeI === 0 || !steps[shapeI - 1].travelled);
                        const lastStop = shapeI === steps.length - 1 && stopI === (shape.stops || []).length - 1;
                        const lastTravelledStop = stopI === (shape.stops || []).length - 1 && shape.travelled && (shapeI === steps.length - 1 || !steps[shapeI + 1].travelled);
                        return (
                            <div className={classes.step}
                                 key={stopIndex}
                                 tabIndex={0}
                                 aria-label={ariaLabel}
                            >
                                <div className={classes.leftLabel}>
                                    {leftLabel}
                                </div>
                                <div className={classes.linePanel}>
                                    <div className={classNames(classes.line, shape.travelled && !firstTravelledStop && classes.travelled,
                                        (!shape.travelled || firstTravelledStop) && !firstStop && classes.untravelled,
                                    firstTravelledStop && "TKUIServiceSteps-firstTravelledStop")}/>
                                    <div className={classNames(classes.circle,
                                        shape.travelled && classes.travelled, !shape.travelled && classes.untravelled)}>
                                        <div/>
                                    </div>
                                    <div className={classNames(classes.line, shape.travelled && !lastTravelledStop && classes.travelled,
                                        (!shape.travelled || lastTravelledStop) && !lastStop && classes.untravelled)}/>
                                </div>
                                <div className={classes.rightLabel}>
                                    {stop.name}
                                </div>
                            </div>
                        )})
                    ), [])}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIServiceSteps, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));