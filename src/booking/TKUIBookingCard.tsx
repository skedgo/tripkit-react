import React from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { tKUIBookingCardDefaultStyle } from "./TKUIBookingCard.css";
import Segment from '../model/trip/Segment';
import Trip from '../model/trip/Trip';
import TKUICard, { CardPresentation } from '../card/TKUICard';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    segment: Segment;
    refreshSelectedTrip: () => Promise<boolean>;
    onSuccess?: (bookingTripUpdateURL: string) => void;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingCardDefaultStyle>

export type TKUIBookingCardProps = IProps;
export type TKUIBookingCardStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingCard {...props} />,
    styles: tKUIBookingCardDefaultStyle,
    classNamePrefix: "TKUIBookingCard"
};

const TKUIBookingCard: React.FunctionComponent<IProps> = (props: IProps) => {
    return (
        <TKUICard
            title={"Add booking details"}   // Define title based on screen
            presentation={CardPresentation.MODAL}
            focusTrap={false}
        >
            <div>

            </div>
        </TKUICard>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingCard, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));