import React, { Fragment, useContext } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig } from "../config/TKUIConfig";
import { default as TKUIButton, TKUIButtonType } from "../buttons/TKUIButton";
import NetworkUtil from "../util/NetworkUtil";
import TripGoApi from "../api/TripGoApi";
import { BookingAction, ConfirmationPrompt } from "../model/trip/BookingInfo";
import { tKUIBookingActionsDefaultStyle } from "./TKUIBookingActions.css";
import UIUtil from "../util/UIUtil";
import Trip from '../model/trip/Trip';
import { RoutingResultsContext } from '../trip-planner/RoutingResultsProvider';
import RoutingQuery from '../model/RoutingQuery';
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    actions: BookingAction[];
    setWaiting?: (waiting: boolean) => void;
    requestRefresh: () => Promise<void>;
    trip?: Trip;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

type IStyle = ReturnType<typeof tKUIBookingActionsDefaultStyle>

export type TKUIBookingActionsProps = IProps;
export type TKUIBookingActionsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIBookingActions {...props} />,
    styles: tKUIBookingActionsDefaultStyle,
    classNamePrefix: "TKUIBookingActions"
};

const TKUIBookingAction: React.FunctionComponent<IProps & { action: BookingAction }> = props => {
    const { action, setWaiting, requestRefresh, trip } = props;
    const { onQueryChange, onDirectionsView } = useContext(RoutingResultsContext);
    return (
        <Fragment>
            <TKUIButton
                text={action.title}
                type={TKUIButtonType.PRIMARY_LINK}
                onClick={() => {
                    if (action.type === "REQUESTANOTHER") {
                        onQueryChange(RoutingQuery.create());
                        onDirectionsView(false);
                    } else if (action.confirmation || action.confirmationMessage) {
                        const confirmationPrompt = action.confirmation
                            ?? Object.assign(new ConfirmationPrompt(), { message: action.confirmationMessage }) // To maintain backward compatibility with old BE.
                        UIUtil.confirmMsg({
                            message: confirmationPrompt.message,
                            confirmLabel: confirmationPrompt.confirmActionTitle || "Yes",
                            cancelLabel: confirmationPrompt.abortActionTitle || "No",
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
                                    .catch(UIUtil.errorMsg)
                                    .finally(() => setWaiting?.(false));
                            }
                        });
                    } else if (action.externalURL) {
                        window.open(action.externalURL, "_self");
                    }
                }}
            />
        </Fragment>
    );
};

const TKUIBookingActions: React.FunctionComponent<IProps> = (props: IProps) => {
    const { actions, classes } = props;
    return (
        <div className={classes.actions}>
            {actions.map((action, i) => <TKUIBookingAction action={action} key={i} {...props} />)}
        </div>
    );
};

export default connect(() => undefined, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));