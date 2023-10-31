import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../config/TKUIConfig";
import { tKUIFromToDefaultStyle } from "./TKUIFromTo.css";
import Location from "../model/Location";
import DateTimeUtil from '../util/DateTimeUtil';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    from: Location;
    to: Location;
    startTime?: string;
    endTime?: string;
    showDate?: boolean;
    timezone?: string;
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
    const { from, to, startTime, endTime, showDate, timezone, status, onClick, classes, t } = props;
    const startMoment = startTime !== undefined ? (timezone ? DateTimeUtil.momentFromStringTZ(startTime, timezone) : DateTimeUtil.moment(startTime)) : undefined;
    let startTimeText = startMoment !== undefined && (
        showDate ? DateTimeUtil.formatRelativeDay(startMoment,
            DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), { partialReplace: DateTimeUtil.dateFormat() })
            :
            startMoment.format(DateTimeUtil.timeFormat())
    );
    if (startTimeText && status === "PROCESSING") {
        startTimeText = t("Requested.time.X", { 0: startTimeText });
    }
    const endMoment = endTime !== undefined ? (timezone ? DateTimeUtil.momentFromStringTZ(endTime, timezone) : DateTimeUtil.moment(endTime)) : undefined;
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
                {endMoment !== undefined &&
                    <div className={classes.value}>
                        {showDate ? DateTimeUtil.formatRelativeDay(endMoment,
                            DateTimeUtil.dateFormat() + " " + DateTimeUtil.timeFormat(), { partialReplace: DateTimeUtil.dateFormat() }) :
                            endMoment.format(DateTimeUtil.timeFormat())}
                    </div>}
                <div className={classes.value}>
                    {to.getDisplayString(true)}
                </div>
            </div>
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));