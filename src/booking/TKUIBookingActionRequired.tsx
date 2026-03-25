import React, { useState } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingActionRequiredDefaultStyle } from "./TKUIBookingActionRequired.css";
import TKUIFromTo from './TKUIFromTo';
import TKUIBookingActions from './TKUIBookingActions';
import { ReactComponent as IconInfo } from '../images/ic-info-circle-2.svg';
import BookingActionRequired from '../model/trip/BookingActionRequired';
import TKUIMapView from '../map/TKUIMapView';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    data: BookingActionRequired;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingActionRequiredDefaultStyle>

export type TKUIBookingActionRequiredProps = IProps;
export type TKUIBookingActionRequiredStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingActionRequired {...props} />,
    styles: tKUIBookingActionRequiredDefaultStyle,
    classNamePrefix: "TKUIBookingActionRequired"
};

const TKUIBookingActionRequired: React.FunctionComponent<IProps> = (props: IProps) => {
    const { data, classes, injectedStyles } = props;
    console.log(data);
    const { title, message, differences, actions } = data
    const [, ...moreDiffs] = differences;
    const [selectedDiff, setSelectedDiff] = useState(differences[0]);
    const mapArrow = differences.length > 1 ?
        <div className={classes.mapArrow}></div> : null;
    const differencesUI = differences.map(({ bookingType, from, externalFrom, to, externalTo }, index) =>
        <div className={classes.fromToDetails} key={index} onMouseOver={() => setSelectedDiff(differences[index])}>
            {differences[index] === selectedDiff ? mapArrow : null}
            {bookingType === "OUTBOUND" ? <div className={classes.returnTripLabel}>Outbound trip</div> :
                bookingType === "RETURN" ? <div className={classes.returnTripLabel}>Return trip</div> : null}
            <TKUIFromTo
                from={from!}
                to={to!}
                externalFrom={externalFrom}
                externalTo={externalTo}
            />
        </div>
    );
    return (
        <div className={classes.main}>
            <div className={classes.status}>
                <div className={classes.statusInfo}>
                    <div className={classes.statusTitle}>
                        <IconInfo className={classes.statusIcon} />
                        {title}
                    </div>
                    {message}
                </div>
            </div>
            <div className={classes.body}>
                <div className={classes.differencesContainer}>
                    {differencesUI}
                </div>
                <div className={classes.mapContainer}>
                    <TKUIMapView
                        from={selectedDiff?.externalFrom}
                        to={selectedDiff?.externalTo}
                        readonly={true}
                        hideLocations={true}
                        showCurrLocBtn={false}
                        padding={{ top: 100, right: 100, bottom: 100, left: 100 }}
                    />
                </div>
            </div>
            {actions.length > 0 &&
                <TKUIBookingActions
                    actions={actions}
                    styles={(theme) => ({
                        actions: {
                            ...injectedStyles.actions as any,
                            ...actions.reduce((accStyles, action, index) => {
                                accStyles[`&>*:nth-child(${index + 1})`] = {
                                    background: action.type === "CANCEL" ? '#FB2C36' : theme.colorSuccess
                                };
                                return accStyles;
                            }, {})
                        } as any
                    })}
                />}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingActionRequired, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));