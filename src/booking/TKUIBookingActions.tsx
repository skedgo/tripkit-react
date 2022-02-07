import React, {} from 'react';
import {TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../config/TKUIConfig";
import {default as TKUIButton, TKUIButtonType} from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import TripGoApi from "../api/TripGoApi";
import {BookingAction} from "../model/trip/BookingInfo";
import {tKUIBookingActionsDefaultStyle} from "./TKUIBookingActions.css";
import UIUtil from "../util/UIUtil";
import Trip from '../model/trip/Trip';

interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    actions: BookingAction[];
    setWaiting?: (waiting: boolean) => void;
    setError?: (error: any) => void;
    requestRefresh: () => Promise<void>;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

type IStyle = ReturnType<typeof tKUIBookingActionsDefaultStyle>

export type TKUIBookingActionsProps = IProps;
export type TKUIBookingActionsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingActions {...props}/>,
    styles: tKUIBookingActionsDefaultStyle,
    classNamePrefix: "TKUIBookingActions"
};

const TKUIBookingAction: React.SFC<IProps & {action: BookingAction}> = props => {
    const {action, setWaiting, setError, requestRefresh, trip} = props;
    return (
        <TKUIButton
            text={action.title}
            type={TKUIButtonType.PRIMARY_LINK}
            onClick={() => {
                if (action.internalURL) {
                    UIUtil.confirmMsg({
                        message: "Do you want to cancel the booking?",
                        onConfirm: () => {
                            setWaiting?.(true);
                            TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                            // NetworkUtil.delayPromise(10)({})     // For testing
                                .then(bookingForm => {
                                    // Workaround for (selected) trip with empty ("") updateUrl.
                                    if (trip && !trip.updateURL 
                                        && bookingForm?.refreshURLForSourceObject) {    // Not sure if it always came a booking form.
                                        trip.updateURL = bookingForm.refreshURLForSourceObject;
                                    }
                                    return requestRefresh();
                                })
                                .catch((e) => setError?.(e))
                                .finally(() => setWaiting?.(false));
                        }
                    })
                } else if (action.externalURL) {
                    window.open(action.externalURL, "_self");
                }
            }}
        />
    );
};

const TKUIBookingActions: React.SFC<IProps> = (props: IProps) => {
    const {actions, classes} = props;
    return (
        <div className={classes.actions}>
            {actions.map((action, i) => <TKUIBookingAction action={action} key={i} {...props}/>)}
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));