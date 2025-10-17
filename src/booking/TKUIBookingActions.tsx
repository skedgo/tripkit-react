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

export function cancelActionHandlerBuilder(action: BookingAction, helpers: {
    setWaitingFor?: (action?: BookingAction) => void;
    requestRefresh?: (refreshURLForSourceObject?: string) => Promise<any>,
    onActionDone?: () => void;
} = {}) {
    return () => {
        const { requestRefresh, setWaitingFor, onActionDone } = helpers;
        const confirmationPrompt = action.confirmation
            ?? Object.assign(new ConfirmationPrompt(), { message: action.confirmationMessage }) // To maintain backward compatibility with old BE.
        UIUtil.confirmMsg({
            message: confirmationPrompt.message ?? ("Are you sure you want to proceed?"),
            confirmLabel: confirmationPrompt.confirmActionTitle || "Yes",
            cancelLabel: confirmationPrompt.abortActionTitle || "No",
            onConfirm: () => {
                setWaitingFor?.(action);
                TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
                    .then(bookingForm => {
                        return requestRefresh?.(bookingForm.refreshURLForSourceObject ?? bookingForm.updateURL);
                    })
                    .catch(UIUtil.errorMsg)
                    .finally(() => {
                        setWaitingFor?.(undefined);
                        onActionDone?.();
                    });
            }
        });
    }
}

// export function bookingActionToHandler(action: BookingAction, helpers: {
//     setWaitingFor?: (action?: BookingAction) => void;
//     requestRefresh?: (refreshURLForSourceObject?: string) => Promise<any>,
//     onActionDone?: () => void,
//     onRequestAnother?: () => void,
//     onShowRelatedTrip?: () => void,
//     onReview?: () => void;
//     onConfirm?: () => void;
// } = {}): (() => void) | undefined {
//     const { requestRefresh, onRequestAnother, onShowRelatedTrip, setWaitingFor, onReview, onConfirm, onActionDone } = helpers;
//     if (action.type === "REQUESTANOTHER") {
//         return onRequestAnother;
//     } else if (action.type === "SHOW_RELATED_TRIP") {
//         return onShowRelatedTrip;
//     } else if (action.confirmation || action.confirmationMessage) {
//         return () => {
//             const confirmationPrompt = action.confirmation
//                 ?? Object.assign(new ConfirmationPrompt(), { message: action.confirmationMessage }) // To maintain backward compatibility with old BE.
//             UIUtil.confirmMsg({
//                 message: confirmationPrompt.message,
//                 confirmLabel: confirmationPrompt.confirmActionTitle || "Yes",
//                 cancelLabel: confirmationPrompt.abortActionTitle || "No",
//                 onConfirm: () => {
//                     setWaitingFor?.(action);
//                     TripGoApi.apiCallUrl(action.internalURL, NetworkUtil.MethodType.GET)
//                         // NetworkUtil.delayPromise(10)({})     // For testing
//                         .then(bookingForm => {
//                             return requestRefresh?.(bookingForm.refreshURLForSourceObject ?? bookingForm.updateURL);
//                         })
//                         .catch(UIUtil.errorMsg)
//                         .finally(() => {
//                             setWaitingFor?.(undefined);
//                             onActionDone?.();
//                         });
//                 }
//             });
//         }
//     } else if (action.externalURL) {
//         return () => {
//             window.open(action.externalURL, "_self");
//         }
//     } else if (action.type === "CONFIRM") {
//         return () => {
//             onConfirm?.();
//         };
//     } else if (action.type === "REVIEW") {
//         return () => {
//             onReview?.();
//         };
//     }
// };
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