import * as React from "react";
import Segment from "../model/trip/Segment";
import TransportUtil from "./TransportUtil";
import DateTimeUtil from "../util/DateTimeUtil";
import {Visibility} from "../model/trip/SegmentTemplate";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUITrackTransportDefaultStyle} from "./TKUITrackTransport.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    brief?: boolean;
    info?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    icon: CSSProps<IProps>;
    info: CSSProps<IProps>;
    subtitle: CSSProps<IProps>;
}

export type TKUITrackTransportProps = IProps;
export type TKUITrackTransportStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITrackTransport {...props}/>,
    styles: tKUITrackTransportDefaultStyle,
    classNamePrefix: "TKUITrackTransport"
};

class TKUITrackTransport extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const segment = this.props.segment;
        const t = this.props.t;
        let infoTitle: string | null = null;
        let infoSubtitle: string;
        if (segment.isPT()) {
            infoTitle = segment.serviceNumber !== null ? segment.serviceNumber : "";
            infoSubtitle = DateTimeUtil.momentFromTimeTZ(segment.startTime * 1000, segment.from.timezone).format(DateTimeUtil.TIME_FORMAT_TRIP);
        } else if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && (segment.isBicycle() || segment.isWheelchair())) {
            // TODO getDurationWithContinuation
            const mainInfo = segment.metres !== undefined ?
                TransportUtil.distanceToBriefString(segment.metres) :
                DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
            const friendlinessPct = (segment.metresSafe !== undefined && segment.metres !== undefined) ? Math.floor(segment.metresSafe * 100 / segment.metres) : undefined;
            if (friendlinessPct) {
                infoTitle = mainInfo;
                infoSubtitle = segment.isBicycle() ? t("X.cycle.friendly", {0: friendlinessPct + "%"}) : t("X.wheelchair.friendly", {0: friendlinessPct + "%"});
            } else {
                infoSubtitle = mainInfo;
            }
        } else {
            if (segment.trip.isSingleSegment(Visibility.IN_SUMMARY) && segment.metres !== undefined) {
                infoSubtitle = TransportUtil.distanceToBriefString(segment.metres);
            } else {
                // TODO more cases
                infoSubtitle = DateTimeUtil.durationToBriefString(segment.getDurationInMinutes(), false);
            }
            if (segment.realTime) {
                infoTitle = infoSubtitle;
                infoSubtitle = t("Live.traffic");
            }
        }
        const modeInfo = segment.modeInfo!;
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <img src={TransportUtil.getTransportIcon(modeInfo, segment.realTime === true, false)}
                     alt={modeInfo.alt}
                     role="img" // Needed to be read by iOS VoiceOver
                     className={classes.icon}
                     aria-label={modeInfo.alt + (infoTitle ? " " + infoTitle : "") + " " + infoSubtitle}
                />
                { this.props.brief ? null :
                    <div className={classes.info}
                         aria-hidden={true}
                    >
                        {infoTitle ? <div>{infoTitle}</div> : null}
                        <div className={classes.subtitle}>{infoSubtitle}</div>
                    </div> }
            </div>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUITrackTransport, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));