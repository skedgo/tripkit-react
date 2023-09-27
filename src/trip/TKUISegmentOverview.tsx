import React from "react";
import Segment, { TripAvailability } from "../model/trip/Segment";
import DateTimeUtil from "../util/DateTimeUtil";
import TransportUtil from "./TransportUtil";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import {
    isIconOnDark,
    isUnconnected,
    tKUISegmentOverviewDefaultStyle
} from "./TKUISegmentOverview.css";
import { ReactComponent as IconPinStart } from "../images/ic-pin-start.svg";
import TKUIStreetsChart, { TKUIStreetsChartProps, TKUIStreetsChartStyle } from "./TKUIStreetsChart";
import TKUIOccupancySign from "../service/occupancy/TKUIOccupancyInfo";
import TKUIWheelchairInfo from "../service/occupancy/TKUIWheelchairInfo";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, PropsMapper } from "../config/TKConfigHelper";
import { IOptionsContext, OptionsContext } from "../options/OptionsProvider";
import { Subtract } from "utility-types";
import TKUserProfile from "../model/options/TKUserProfile";
import TKUIAlertsSummary from "../alerts/TKUIAlertsSummary";
import TKUIButton, { TKUIButtonType } from "../buttons/TKUIButton";
import { cardSpacing } from "../jss/TKUITheme";
import { TKUIViewportUtil, TKUIViewportUtilProps } from "../util/TKUIResponsiveUtil";
import { SegmentType } from "../model/trip/SegmentTemplate";
import classNames from "classnames";
import DeviceUtil from "../util/DeviceUtil";
import { lazyComponent } from "../lazy/TKLazy";

type IStyle = ReturnType<typeof tKUISegmentOverviewDefaultStyle>;
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: Segment;
    actions?: JSX.Element[];
    onRequestAlternativeRoutes?: (segment: Segment) => void;
    onClick?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {
    options: TKUserProfile;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUISegmentOverviewProps = IProps;
export type TKUISegmentOverviewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISegmentOverview {...props} />,
    styles: tKUISegmentOverviewDefaultStyle,
    classNamePrefix: "TKUISegmentOverview",
    randomizeClassNames: true
};

function platformText(platformS: string): string {
    return platformS.toLowerCase().startsWith("stop") ? platformS : "Platform " + platformS;
}

// Disable lazy load of chart component (using heavy library) since it implies code splitting in chunks, which fail to load
// on embedded web-apps, since code tries to load chunks from '/'. Static solution: configure publicPath on client project.
// Dynamic solution (no config required): https://github.com/webpack/webpack/pull/11258 (didn't test).
// const TKUIStreetsChart = lazyComponent<TKUIStreetsChartProps, TKUIStreetsChartStyle>(() => import("./TKUIStreetsChart"));
// setTimeout(() => import("./TKUIStreetsChart"), 2000);

class TKUISegmentOverview extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        const { value: segment, t, classes } = this.props;
        const hideTimes = segment.hideExactTimes || segment.trip.hideExactTimes;
        const modeInfo = segment.modeInfo!;
        const fromLocS = segment.type === SegmentType.stationary ? segment.location.getDisplayString() : segment.from.getDisplayString();
        const from = segment.isFirst() ? t("Leave.X", { 0: fromLocS }) : segment.arrival ? t("Arrive.X", { 0: fromLocS }) : fromLocS;
        const hasBusOccupancy = segment.isPT() && segment.realtimeVehicle && segment.realtimeVehicle.components &&
            segment.realtimeVehicle.components.length === 1 && segment.realtimeVehicle.components[0].length === 1 &&
            segment.realtimeVehicle.components[0][0].occupancy;
        const showWheelchair = (this.props.options.wheelchair || segment.wheelchairAccessible === false) &&
            segment.isPT();
        const wheelchairInfo = showWheelchair &&
            <div className={classes.occupancy}>
                <TKUIWheelchairInfo accessible={segment.wheelchairAccessible} />
            </div>;
        const occupancyInfo = hasBusOccupancy ?
            <div className={classes.occupancy}>
                <TKUIOccupancySign status={segment.realtimeVehicle!.components![0][0].occupancy!} />
            </div> : undefined;
        const wcSegmentInfo = segment.streets?.some(street => street.roadTags.length > 0) ?
            <TKUIStreetsChart value={segment} /> : undefined;
        const showPin = (segment.isFirst() || segment.arrival) && isUnconnected(segment);
        const prevSegment = segment.prevSegment();

        let header;
        if (prevSegment && prevSegment.type === SegmentType.stationary) {
            // E.g./s of stationary segments: transfer, wait taxi, find parking, collect vehicle, etc.
            // Don't display the header since it's substituted by the header of the previous (stationary) segment.
            header = null;
        } else if (segment.type === SegmentType.stationary) {   // Header of a stationary segment.
            const nextSegment = segment.nextSegment();
            const arrivePlatform = prevSegment && prevSegment.type === SegmentType.scheduled ? prevSegment.endPlatform : undefined;
            const transferAction = nextSegment && nextSegment.type === SegmentType.scheduled ? (nextSegment.startPlatform && platformText(nextSegment.startPlatform)) : segment.getAction();
            const arriveTime = DateTimeUtil.format(segment.startTime, DateTimeUtil.timeFormat(false));
            const departTime = hideTimes ? undefined : DateTimeUtil.format(segment.endTime, DateTimeUtil.timeFormat(false));
            const betweenScheduled = prevSegment && prevSegment.type === SegmentType.scheduled && nextSegment && nextSegment.type === SegmentType.scheduled;
            header =
                <div className={classes.header}>
                    <div className={classes.track}>
                        <div className={classNames(classes.preLine, betweenScheduled && classes.longLine)} />
                        {betweenScheduled &&
                            <div className={classNames(classes.prevCircle, classes.circleSeparation)} />}
                        {/* If next segment is unconnected, then the stationary segment connects with previous one, so
                        paint circle accordingly. E.g. find parking. */}
                        <div className={!nextSegment || nextSegment.arrival || isUnconnected(nextSegment) ? classes.prevCircle : classes.nextCircle} />
                        <div className={classes.nextLine} />
                    </div>
                    <div className={classes.title} aria-label={from}>
                        {from}
                        {betweenScheduled && arrivePlatform ?
                            <div className={classNames(classes.subtitle, classes.separation)}>
                                {platformText(arrivePlatform)}
                            </div> : null}
                        <div className={classes.subtitle}>
                            {transferAction}
                        </div>
                        {this.props.actions}
                    </div>
                    <div className={betweenScheduled ? classes.timeBottom : classes.time} aria-label={"at " + departTime + "."}>
                        {betweenScheduled &&
                            <span className={classes.separation}>{arriveTime}</span>}
                        <span>{departTime}</span>
                    </div>
                </div>;
        } else {    // Header of a non-stationary segment.
            const startTime = segment.isContinuation || hideTimes ? undefined :
                DateTimeUtil.format(segment.startTime, DateTimeUtil.timeFormat(false));
            const startPlatform = segment.type === SegmentType.scheduled && !segment.isContinuation ? segment.startPlatform :
                prevSegment?.type === SegmentType.scheduled ? prevSegment.endPlatform : undefined;
            header =
                <div className={classes.header}>
                    <div className={classes.track}>
                        <div className={classes.preLine} />
                        {showPin ? <IconPinStart className={classes.iconPin} /> :
                            <div className={isUnconnected(segment) ? classes.prevCircle : classes.circle} />}
                        <div className={classes.line} />
                    </div>
                    <div className={classes.title} aria-label={from}>
                        {from}
                        {startPlatform &&
                            <div className={classes.subtitle}>
                                {platformText(startPlatform)}
                            </div>}
                        {this.props.actions}
                    </div>
                    <div className={classes.time} aria-label={"at " + startTime + "."}>
                        <span>{startTime}</span>
                    </div>
                </div>;
        }
        const renderTransportIcon = () => {
            const isOnDark = isIconOnDark(segment);
            const transportIconUrl = TransportUtil.getTransIcon(modeInfo, { isRealtime: segment.realTime ?? false, onDark: isOnDark || this.props.theme.isDark });
            const isRemote = transportIconUrl === TransportUtil.getTransportIconRemote(modeInfo);
            return (
                <div className={isRemote ? classes.iconCircledWhite : isOnDark ? classes.iconCircledColor : classes.icon}>
                    <img src={transportIconUrl} aria-hidden={true} />
                </div>
            );
        };
        return (
            <div className={classes.main}
                tabIndex={0}
                role={DeviceUtil.isTouch() ? "button" : undefined}
                onClick={this.props.onClick}
            >
                {header}
                {!segment.arrival && segment.type !== SegmentType.stationary ?
                    <div className={classes.body}>
                        <div className={classes.track}>
                            <div className={classes.line} />
                            {!segment.isContinuation && renderTransportIcon()}
                            <div className={classes.line} />
                        </div>
                        <div className={classes.description}>
                            <div className={classes.action}>
                                {segment.getAction()}
                            </div>
                            {wheelchairInfo}
                            {occupancyInfo}
                            {wcSegmentInfo}
                            <div className={classes.notes}>
                                {segment.getNotes().map((note: string, i: number) =>
                                    <div key={i}>{note}</div>
                                )}
                            </div>
                            {segment.hasAlerts &&
                                <div className={classes.alertsSummary}>
                                    <TKUIAlertsSummary
                                        alerts={segment.alerts}
                                        slideUpOptions={{
                                            modalUp: { top: cardSpacing(this.props.landscape), unit: 'px' },
                                        }}
                                    />
                                </div>}
                        </div>
                    </div>
                    :
                    null
                }
                {segment.isPT() && segment.availability === TripAvailability.CANCELLED && !segment.hasContinuation() &&
                    <div className={classes.cancelledBanner}>
                        <div className={classes.cancelledMsg}>
                            {t("Service.has.been.cancelled.")}
                        </div>
                        <TKUIButton
                            type={TKUIButtonType.SECONDARY}
                            text={t("Alternative.routes")}
                            onClick={() => this.props.onRequestAlternativeRoutes && this.props.onRequestAlternativeRoutes(segment)}
                        />
                    </div>}
            </div>
        );
    }
}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({ inputProps, children }) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                <OptionsContext.Consumer>
                    {(optionsContext: IOptionsContext) =>
                        children!({
                            ...inputProps,
                            options: optionsContext.userProfile,
                            ...viewportProps
                        })
                    }
                </OptionsContext.Consumer>
            }
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUISegmentOverview, config, Mapper);