import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIFromToDefaultStyle } from "./TKUIFromTo.css";
import Location from "../model/Location";
import DateTimeUtil from '../util/DateTimeUtil';
import classNames from 'classnames';

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
    externalFrom?: Location;
    externalTo?: Location;
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
    const {
        from, to, externalFrom, externalTo,
        startTime, endTime, queryIsLeaveAfter = true, showDate, formatRelativeDay = true, timezone, showGMT, status, onClick,
        classes, t
    } = props;
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
    const pickupRowCount = 1 + (startTimeText ? 1 : 0) + 1 + (externalFrom ? 1 : 0);
    return (
        <div className={classes.main} onClick={onClick} style={onClick && { cursor: 'pointer' }}>
            <div className={classes.fromToTrack} style={{ gridRowEnd: pickupRowCount + 2 }}>
                <div className={classes.circle} />
                <div className={classes.line} />
                <div className={classes.circle} />
            </div>
            <div className={classes.pickupLabel}>
                {t("Pick-up")}
            </div>
            {startTimeText &&
                <div className={classes.pickupTime}>
                    {startTimeText}
                </div>}
            <div className={classNames(classes.pickupAddress, externalFrom ? classes.strikedOut : undefined)}>
                {from.getDisplayString(true)}
            </div>
            {externalFrom &&
                <div className={classes.pickupAddress}>
                    {externalFrom.getDisplayString(true)}
                    <div className={classes.newBadge}>NEW</div>
                </div>}
            <div className={classes.dropoffLabel}>
                {t("Drop-off")}
            </div>
            {endTimeText &&
                <div className={classes.dropoffTime}>
                    {endTimeText}
                </div>}
            <div className={classNames(classes.dropoffAddress, externalTo ? classes.strikedOut : undefined)}>
                {to.getDisplayString(true)}
            </div>
            {externalTo &&
                <div className={classes.dropoffAddress}>
                    {externalTo.getDisplayString(true)}
                    <div className={classes.newBadge}>NEW</div>
                </div>}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIFromTo, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));