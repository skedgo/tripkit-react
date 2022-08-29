import * as React from "react";
import Segment from "../model/trip/Segment";
import TransportUtil from "./TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import { Visibility } from "../model/trip/SegmentTemplate";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUITrackTransportDefaultStyle } from "./TKUITrackTransport.css";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { ReactComponent as AlertIcon } from "../images/ic-alert.svg";
import { ReactComponent as RealtimeIcon } from "../images/ic-realtime.svg";
import classNames from "classnames";

type IStyle = ReturnType<typeof tKUITrackTransportDefaultStyle>;
export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    brief?: boolean;
    info?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUITrackTransportProps = IProps;
export type TKUITrackTransportStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITrackTransport {...props} />,
    styles: tKUITrackTransportDefaultStyle,
    classNamePrefix: "TKUITrackTransport"
};

class TKUITrackTransport extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const { segment, t, theme, brief } = this.props;
        const hideTimes = segment.hideExactTimes || segment.trip.hideExactTimes;
        let infoTitle: string | undefined;
        let infoSubtitle: string | undefined;
        const modeInfo = segment.modeInfo!;
        if (segment.isPT()) {
            infoTitle = segment.serviceNumber !== null ? segment.serviceNumber : "";
            if (!brief && !hideTimes) {
                infoSubtitle = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.timeFormat(false));
            }
        } else if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && (segment.isBicycle() || segment.isWheelchair())) {
            // TODO getDurationWithContinuation
            const mainInfo = segment.metres !== undefined ?
                TransportUtil.distanceToBriefString(segment.metres) :
                !hideTimes ? DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false) : undefined;
            const friendlinessPct = (segment.metresSafe !== undefined && segment.metres !== undefined) ? Math.floor(segment.metresSafe * 100 / segment.metres) : undefined;
            if (friendlinessPct) {
                infoTitle = mainInfo;
                infoSubtitle = segment.isBicycle() ? t("X.cycle.friendly", { 0: friendlinessPct + "%" }) : t("X.wheelchair.friendly", { 0: friendlinessPct + "%" });
            } else {
                infoSubtitle = mainInfo;
            }
        } else {
            if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && segment.metres !== undefined) {
                infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
            } else if (!brief && !hideTimes) {
                infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
            }
            // At this point we don't have title.
            if (segment.realTime && !hideTimes) {
                infoTitle = infoSubtitle;
                infoSubtitle = t("Live.traffic");
            } else if (modeInfo.description && !brief) {    // Put modeInfo description as title if not brief.
                infoTitle = modeInfo.description
            }
        }
        const classes = this.props.classes;
        const ariaLabel = modeInfo.alt + (infoTitle ? " " + infoTitle : "") + " " + (infoSubtitle ? " " + infoSubtitle : "") +
            (!segment.isLast(Visibility.IN_SUMMARY) ? ", then " : "");
        const transportIconUrl = TransportUtil.getTransIcon(modeInfo, { isRealtime: segment.realTime ?? false, onDark: this.props.theme.isDark });
        const isRemote = transportIconUrl === TransportUtil.getTransportIconRemote(modeInfo);
        return (
            <div className={classes.main}>
                <div className={classNames(classes.compositeIcon, theme.isDark && isRemote && classes.circleWhite)}>
                    {modeInfo.remoteIconIsBranding && modeInfo.remoteIcon &&
                        <img src={TransportUtil.getTransIcon(modeInfo, { onDark: this.props.theme.isDark, useLocal: true })}
                            className={classes.icon}
                        />}
                    <img src={transportIconUrl}
                        alt={modeInfo.alt}
                        role="img" // Needed to be read by iOS VoiceOver
                        className={classes.icon}
                        aria-label={ariaLabel}
                    />
                    {segment.hasAlerts && <AlertIcon className={classes.alertIcon} />}
                </div>
                {(infoTitle || infoSubtitle || segment.realTime) ?
                    <div className={classes.info}
                        aria-hidden={true}
                    >
                        {infoTitle ? <div className={classes.title}>{infoTitle}</div> : null}
                        <div className={classes.subtitle}>
                            {infoSubtitle}
                            {segment.realTime && <RealtimeIcon className={classes.realtimeIcon} />}
                        </div>
                    </div> : null}
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUITrackTransport, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));