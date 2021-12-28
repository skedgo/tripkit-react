import * as React from "react";
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
        const stops: ServiceStopLocation[] = [];
        // Array mapping stop index to the 'travelled' flag of it's shape.
        const travelledStops: boolean[] = [];
        steps.forEach(shape => {
            const shapeStops = shape.stops || [];
            stops.push(...shapeStops);
            shapeStops.forEach(() => travelledStops.push(shape.travelled));
        });
        const stepElements = stops.map((stop: ServiceStopLocation, stopI: number) => {
            const leftLabel = stop.departure ?
                DateTimeUtil.momentFromTimeTZ(stop.departure * 1000, timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) :
                stop.arrival ? DateTimeUtil.momentFromTimeTZ(stop.arrival * 1000, timezone).format(DateTimeUtil.TIME_FORMAT_TRIP) : "";
            const ariaLabel = stop.name + ", " + t("At.X", {0: leftLabel}) + ". ";
            const travelledStop = travelledStops[stopI];
            const firstStop = stopI === 0;
            const firstTravelledStop = travelledStop && (stopI === 0 || !travelledStops[stopI - 1]);
            const lastStop = stopI === stops.length - 1;
            const lastTravelledStop = travelledStop && (stopI === stops.length - 1 || !travelledStops[stopI + 1]);
            return (
                <div className={classes.step}
                     key={stopI}
                     tabIndex={0}
                     aria-label={ariaLabel}
                >
                    <div className={classes.leftLabel}>
                        {leftLabel}
                    </div>
                    <div className={classes.linePanel}>
                        <div className={classNames(classes.line, travelledStop && !firstTravelledStop && classes.travelled,
                            (!travelledStop || firstTravelledStop) && !firstStop && classes.untravelled,
                            firstTravelledStop && "TKUIServiceSteps-firstTravelledStop")}/>
                        <div className={classNames(classes.circle,
                            travelledStop && classes.travelled, !travelledStop && classes.untravelled)}>
                            <div/>
                        </div>
                        <div className={classNames(classes.line, travelledStop && !lastTravelledStop && classes.travelled,
                            (!travelledStop || lastTravelledStop) && !lastStop && classes.untravelled)}/>
                    </div>
                    <div className={classes.rightLabel}>
                        {stop.name}
                    </div>
                </div>
            );
        });
        return (
            <div id={this.id}>
                {stepElements}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUIServiceSteps, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));