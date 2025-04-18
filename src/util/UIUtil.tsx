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

    public static customConfirmAlert(options: ReactConfirmAlertProps) {
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
                                                (button.onClick as any)();
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
        UIUtil.customConfirmAlert({
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
        const messageElems = (e.title && e.subtitle) ? [e.title, e.subtitle] : [e.message];
        UIUtil.customConfirmAlert({
            buttons,
            message: messageElems.join(". "),
            closeOnEscape: true,
            closeOnClickOutside: true,
            //     customUI: ({ title, message, onClose }) =>
            //         <div className={classNames(genClassNames.flex, genClassNames.column)}>
            //             <div>
            //                 {title}
            //             </div>
            //             <div>
            //                 {message}
            //             </div>
            //             {e.response &&
            //                 <div>
            //                     {"Response url: " + e.response.url}
            //                 </div>}
            //             <div>
            //                 <button onClick={onClose}>{i18n.t("OK")}</button>
            //             </div>
            //         </div>
        });
    }

}

export default UIUtil;