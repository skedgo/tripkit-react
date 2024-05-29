import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIFromToDefaultStyle } from "./TKUIFromTo.css";
import Location from "../model/Location";
import DateTimeUtil from '../util/DateTimeUtil';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    from: Location;
    to: Location;
    startTime?: string;
    endTime?: string;
    queryIsLeaveAfter?: boolean;
    showDate?: boolean;
    formatRelativeDay?: boolean;
    timezone?: string;
    showGMT?: boolean;
    status?: string;
    onClick?: () => void;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIFromToDefaultStyle>

export type TKUIFromToProps = IProps;
export type TKUIFromToStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIFromTo {...props} />,
    styles: tKUIFromToDefaultStyle,
    classNamePrefix: "TKUIFromTo"
};

const TKUIFromTo: React.FunctionComponent<IProps> = (props: IProps) => {
    const { from, to, startTime, endTime, queryIsLeaveAfter = true, showDate, formatRelativeDay = true, timezone, showGMT, status, onClick, classes, t } = props;
    const startMoment = startTime !== undefined ? (timezone ? DateTimeUtil.momentFromStringTZ(startTime, timezone) : DateTimeUtil.moment(startTime)) : undefined;
    let startTimeText = startMoment && (
        showDate ?
            (formatRelativeDay ?
                DateTimeUtil.formatRelativeDay(startMoment,
                    DateTimeUtil.dateFormat({ doubleDigit: false }) + " " + DateTimeUtil.timeFormat(), { partialReplace: DateTimeUtil.dateFormat({ doubleDigit: false }) })
                : startMoment.format(DateTimeUtil.dateFormat({ doubleDigit: false }) + " " + DateTimeUtil.timeFormat()))
            : startMoment.format(DateTimeUtil.timeFormat())
    );
    const endMoment = endTime !== undefined ? (timezone ? DateTimeUtil.momentFromStringTZ(endTime, timezone) : DateTimeUtil.moment(endTime)) : undefined;
    let endTimeText = endMoment && (
        showDate ?
            (formatRelativeDay ?
                DateTimeUtil.formatRelativeDay(endMoment,
                    DateTimeUtil.dateFormat({ doubleDigit: false }) + " " + DateTimeUtil.timeFormat(), { partialReplace: DateTimeUtil.dateFormat({ doubleDigit: false }) })
                : endMoment.format(DateTimeUtil.dateFormat({ doubleDigit: false }) + " " + DateTimeUtil.timeFormat()))
            : endMoment.format(DateTimeUtil.timeFormat())
    );
    if (startTimeText && timezone && showGMT) {
        startTimeText += " " + DateTimeUtil.timezoneToGMTString(timezone);
    }
    if (endTimeText && timezone && showGMT) {
        endTimeText += " " + DateTimeUtil.timezoneToGMTString(timezone);
    }
    if (status === "PROCESSING" && startTimeText) {
        if (queryIsLeaveAfter) {
            startTimeText = t("Requested.time.X", { 0: startTimeText });
        } else {
            startTimeText = undefined;
        }
    }
    if (status === "PROCESSING" && endTimeText) {
        if (!queryIsLeaveAfter) {
            endTimeText = t("Requested.time.X", { 0: endTimeText });
        } else {
            endTimeText = undefined;
        }
    }
    return (
        <div className={classes.group} onClick={onClick} style={onClick && { cursor: 'pointer' }}>
            <div className={classes.fromToTrack}>
                <div className={classes.circle} />
                <div className={classes.line} />
                <div className={classes.circle} />
                <div className={classes.value} style={{ height: '1.2em' }} />
                {endTime !== undefined && <div className={classes.value} style={{ height: '1.2em' }} />}
            </div>
            <div className={classes.groupRight}>
                <div className={classes.label}>
                    {t("Pick-up")}
                </div>
                {startTimeText &&
                    <div className={classes.value}>
                        {startTimeText}
                    </div>}
                <div className={classes.value}>
                    {from.getDisplayString(true)}
                </div>
                <div className={classes.label}>
                    {t("Drop-off")}
                </div>
                {endTimeText &&
                    <div className={classes.value}>
                        {endTimeText}
                    </div>}
                <div className={classes.value}>
                    {to.getDisplayString(true)}
                </div>
            </div>
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIFromTo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));