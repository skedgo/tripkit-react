import { confirmAlert } from 'react-confirm-alert';
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

    public static errorMsg(e: TKError, options?: { onClose?: () => void }) {
        confirmAlert({
            message: e.message || e.title || e.subtitle,
            buttons: [
                {
                    label: i18n.t("OK"),
                    onClick: () => { options?.onClose?.(); }

                }
            ],
            closeOnEscape: true,
            closeOnClickOutside: true
        });
    }

}

export default UIUtil;