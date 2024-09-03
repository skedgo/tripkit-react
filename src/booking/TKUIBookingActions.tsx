import React, { Fragment } from 'react';
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { default as TKUIButton, TKUIButtonType } from "../buttons/TKUIButton";
import { BookingAction, ConfirmationPrompt } from "../model/trip/BookingInfo";
import { tKUIBookingActionsDefaultStyle } from "./TKUIBookingActions.css";
import { Subtract } from 'utility-types';
import UIUtil from '../util/UIUtil';
import TripGoApi from '../api/TripGoApi';
import NetworkUtil from '../util/NetworkUtil';

export function bookingActionToHandler(action: BookingAction, helpers: {
    requestRefresh?: () => Promise<void>,
    onRequestAnother?: () => void,
    onShowRelatedTrip?: () => void,
    setWaitingFor?: (action?: BookingAction) => void;
} = {}): (() => void) | undefined {
    const { requestRefresh, onRequestAnother, onShowRelatedTrip, setWaitingFor } = helpers;
    if (action.type === "REQUESTANOTHER") {
        return onRequestAnother;
    } else if (action.type === "SHOW_RELATED_TRIP") {
        return onShowRelatedTrip;
    } else if (action.confirmation || action.confirmationMessage) {
        return () => {
            // let resultResolve;
            // let resultReject;
            // const resultPromise = new Promise((resolve, reject) => {
            //     resultResolve = resolve;
            //     resultReject = reject;
            // })
            const confirmationPrompt = action.confirmation
                ?? Object.assign(new ConfirmationPrompt(), { message: action.confirmationMessage }) // To maintain backward compatibility with old BE.
            UIUtil.confirmMsg({
                message: confirmationPrompt.message,
                confirmLabel: confirmationPrompt.confirmActionTitle || "Yes",
                cancelLabel: confirmationPrompt.abortActionTitle || "No",
                onConfirm: () => {
                    setWaitingFor?.(action);
                    TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                        // NetworkUtil.delayPromise(10)({})     // For testing
                        .then(bookingForm => {
                            // Workaround for (selected) trip with empty ("") updateUrl.
                            // if (trip && !trip.updateURL
                            //     && bookingForm?.refreshURLForSourceObject) {    // Not sure if it always came a booking form.
                            //     trip.updateURL = bookingForm.refreshURLForSourceObject;
                            // }
                            return requestRefresh?.();
                        })
                        .catch(UIUtil.errorMsg)
                        .finally(() => setWaitingFor?.(undefined));
                }
            });
        }
    } else if (action.externalURL) {
        return () => {
            window.open(action.externalURL, "_self");
        }
    }
};
interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    actions: BookingAction[];
    actionToHandler?: (action: BookingAction) => (() => void) | undefined;
    onRequestRefresh?: () => Promise<void>;
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

type TKUIBookingActionProps = Subtract<IClientProps, { actions: BookingAction[], actionToHandler?: (action: BookingAction, onRequestRefresh?: () => Promise<void>) => void }> & { action: BookingAction; onAction?: () => void; }

const TKUIBookingAction: React.FunctionComponent<TKUIBookingActionProps> = props => {
    const { action, onAction } = props;
    return (
        <Fragment>
            <TKUIButton
                text={action.title}
                type={TKUIButtonType.PRIMARY_LINK}
                onClick={() => {
                    onAction?.();
                }}
            />
        </Fragment>
    );
};

const TKUIBookingActions: React.FunctionComponent<IProps> = (props: IProps) => {
    const { actions, actionToHandler, onRequestRefresh, ...otherProps } = props;
    const { classes } = props;
    return (
        <div className={classes.actions}>
            {actions.map((action, i) => {
                const handleAction = actionToHandler?.(action);
                if (!handleAction) {
                    return null;    // Skip actions that are not handled
                }
                return <TKUIBookingAction action={action} onAction={handleAction} key={i} {...otherProps} />;
            })}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUIBookingActions, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));