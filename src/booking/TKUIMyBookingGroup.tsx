import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import ConfirmedBookingData from "../model/trip/ConfirmedBookingData";
import { TKUITheme } from '../jss/TKUITheme';
import TKUIMyBooking from './TKUIMyBooking';

const tKUIMyBookingGroupDefaultStyle = (theme: TKUITheme) => ({
    main: {

    }
});

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    booking: ConfirmedBookingData;
    onShowTrip?: (tripUrl: string) => void;
    requestRefresh?: () => Promise<void>;
    showTickets?: boolean;
    showActions?: boolean;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIMyBookingGroupDefaultStyle>

export type TKUIMyBookingGroupProps = IProps;
export type TKUIMyBookingGroupStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIMyBookingGroup {...props} />,
    styles: tKUIMyBookingGroupDefaultStyle,
    classNamePrefix: "TKUIMyBookingGroup"
};

const TKUIMyBookingGroup: React.FunctionComponent<IProps> = (props: IProps) => {
    const { booking, onShowTrip, requestRefresh, classes, theme, showActions, showTickets } = props;
    return (
        <div className={classes.main}>
            <TKUIMyBooking
                booking={booking}
                onShowTrip={onShowTrip}
                requestRefresh={requestRefresh}
                showActions={showActions}
                showTickets={showTickets}
            />
            {booking.relatedBookings?.map(({ confirmedBookingData, type }) =>
                confirmedBookingData &&
                <TKUIMyBooking
                    booking={confirmedBookingData}
                    type={type}
                    onShowTrip={onShowTrip}
                    requestRefresh={requestRefresh}
                    showActions={showActions}
                    showTickets={showTickets}
                    key={booking.id}
                />
            )}
        </div>
    )
};

export default connect((config: TKUIConfig) => config.TKUIMyBookingGroup, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));