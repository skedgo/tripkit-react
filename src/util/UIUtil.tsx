import FocusTrap from 'focus-trap-react';
import React from 'react';
import { confirmAlert, ReactConfirmAlertProps } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { TKError } from "../error/TKError";
import { i18n } from "../i18n/TKI18nConstants";

export interface MsgOptions {
    title?: string,
    message?: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmLabel?: string,
    cancelLabel?: string,
    closeOnEscape?: boolean,
    closeOnClickOutside?: boolean
}

class UIUtil {

    private static customConfirmAlert(options: ReactConfirmAlertProps) {
        const { title, message, buttons, ...otherOptions } = options;        
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <FocusTrap>
                        <div className='react-confirm-alert-body'>
                            {title && <h1>{title}</h1>}
                            {message}
                            <div className='react-confirm-alert-button-group'>
                                {buttons?.map((button, i) => (
                                    <button
                                        key={i}                                        
                                        {...button}
                                        onClick={() => {
                                            if (button.onClick) {
                                                button.onClick();
                                            }
                                            onClose();
                                        }}
                                    >
                                        {button.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </FocusTrap>
                )
            },            
            ...otherOptions
        });
    }

    public static confirmMsg(options: MsgOptions) {
        // noinspection PointlessBooleanExpressionJS
        const { confirmLabel, onConfirm, cancelLabel, onCancel, ...otherOptions } = options;
        const buttons = [
            {
                label: confirmLabel ? confirmLabel : 'Confirm',
                onClick: () => {
                    onConfirm();
                }
            },
            {
                label: cancelLabel ? cancelLabel : 'Cancel',
                onClick: () => {
                    if (!onCancel) {
                        return;
                    }
                    onCancel();
                }
            }
        ];
        this.customConfirmAlert({
            buttons,
            ...otherOptions
        });
    }

    public static errorMsg(e: TKError, options?: { onClose?: () => void }) {
        const buttons = [
            {
                label: i18n.t("OK"),
                onClick: () => { options?.onClose?.(); }

            }
        ];
        this.customConfirmAlert({
            message: e.message || e.title || e.subtitle,            
            closeOnEscape: true,
            closeOnClickOutside: true,
            buttons
        });
    }

}

export default UIUtil;