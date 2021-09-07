import React from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUIMxMIndexDefaultStyle} from "./TKUIMxMIndex.css";
import Segment from "../model/trip/Segment";
import TKUITrackTransport from "../trip/TKUITrackTransport";
import {TKUICard} from "../index";
import TripUtil from "../trip/TripUtil";
import classNames from 'classnames';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segments: Segment[];
    value: number;
    onChange: (value: number) => void;
}

interface IConsumedProps {}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIMxMIndexDefaultStyle>

export type TKUIMxMIndexProps = IProps;
export type TKUIMxMIndexStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMxMIndex {...props}/>,
    styles: tKUIMxMIndexDefaultStyle,
    classNamePrefix: "TKUIMxMIndex"
};

const TKUIMxMIndex: React.SFC<IProps> = (props: IProps) => {
    const segments = props.segments;
    const trip = props.segments[0].trip;
    const classes = props.classes;
    const {departureTime, arrivalTime} = TripUtil.getTripTimeData(trip, true);
    return (
        <TKUICard>
            <div className={classes.main}>
                <div className={classes.track}>
                    {segments.map((segment: Segment, i: number) => {
                        let brief: boolean | undefined;
                        const nOfSegments = segments.length;
                        if (nOfSegments > 4 || (nOfSegments > 3 && window.innerWidth <= 400)) {
                            brief = true;
                        } else if (nOfSegments < 4) {
                            brief = false;
                        }
                        return (
                            <div className={classNames(classes.transport, props.value === i && classes.selected)}
                                 onClick={() => props.onChange(i)}
                                 key={i}
                            >
                                <TKUITrackTransport
                                    segment={segment}
                                    brief={brief}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className={classes.tripTime}>
                    {departureTime + " - " + arrivalTime}
                </div>
            </div>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIMxMIndex, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));