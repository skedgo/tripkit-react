import React from "react";
import {confirmAlert} from 'react-confirm-alert';

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

    public static confirmMsg(options: MsgOptions) {
        // noinspection PointlessBooleanExpressionJS
        confirmAlert({
            title: options.title,
            message: options.message,
            buttons: [
                {
                    label: options.confirmLabel ? options.confirmLabel : 'Confirm',
                    onClick: () => {
                        options.onConfirm();
                    }
                },
                {
                    label: options.cancelLabel ? options.cancelLabel : 'Cancel',
                    onClick: () => {
                        if (!options.onCancel) {
                            return;
                        }
                        options.onCancel();
                    }
                }
            ],
            closeOnEscape: options.closeOnEscape,
            closeOnClickOutside: options.closeOnClickOutside
        });
    }

}

export default UIUtil;