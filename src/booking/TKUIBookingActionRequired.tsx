import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingActionRequiredDefaultStyle } from "./TKUIBookingActionRequired.css";
import TKUIFromTo from './TKUIFromTo';
import TKUIBookingActions from './TKUIBookingActions';
import { ReactComponent as IconInfo } from '../images/ic-info-circle-2.svg';
import BookingActionRequired from '../model/trip/BookingActionRequired';

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
    const differencesUI = differences.map(({ bookingType, from, externalFrom, to, externalTo }, index) =>
        <div className={classes.fromToDetails} key={index}>
            {bookingType === "RETURN" ?
                <div className={classes.returnTripLabel}>Return trip</div> : null}
            <TKUIFromTo
                from={from!}
                to={to!}
                externalFrom={externalFrom}
                externalTo={externalTo}
            />
        </div>
    );
    return (
        <div>
            <div className={classes.status}>
                <div className={classes.statusInfo}>
                    <div className={classes.statusTitle}>
                        <IconInfo className={classes.statusIcon} />
                        {title}
                    </div>
                    {message}
                </div>
            </div>
            {differencesUI}
            {actions.length > 0 &&
                <TKUIBookingActions
                    actions={actions}
                />}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingActionRequired, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));