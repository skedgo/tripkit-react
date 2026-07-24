import React, { ReactNode, useContext, useState } from 'react';
import { TKAccountContext } from "./TKAccountContext";
import { TKUITheme, white } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIWithStyle, useStyles } from "../jss/StyleHelper";
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUIRow from "../options/TKUIRow";
import TKUserAccount from './TKUserAccount';
import { PatternFormat } from 'react-number-format';
import Util from '../util/Util';
import { useI18n } from '../i18n/TKI18nProvider';
import TKUIButton, { TKUIButtonType } from '../buttons/TKUIButton';
import TKLoading from '../card/TKLoading';
import UIUtil from '../util/UIUtil';

const userAccountViewJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '30px 0',
        height: '100%',
        position: 'relative'
    },
    entry: {
        display: 'flex',
        '& div:first-child': {
            flexGrow: 1,
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    phoneEntry: {
        '& > div:first-child': {         
            paddingTop: 0,
            paddingBottom: 0
        }
    },
    required: {
        background: theme.colorError,
        borderRadius: '6px',
        color: white(),
        alignSelf: 'flex-start',
        padding: '0 5px'
    },
    phoneNote: {
        padding: '0 20px',
        marginTop: '10px',
        ...theme.textColorGray,
        ...theme.textSizeCaption,
        '& a': {
            color: theme.colorPrimary
        }
    },
    phoneInput: {
        border: 'none'
    },
    footer: {
        ...genStyles.flex,
        ...genStyles.justifyEnd,
        gap: '30px',
        margin: 'auto 30px 0 30px'
    },
    loadingPanel: {
        ...genStyles.flex,
        ...genStyles.grow,
        ...genStyles.center,
        position: 'absolute',
        top: '0',
        backgroundColor: '#ffffffbf',
        height: '100%',
        width: '100%',
        zIndex: 5
    }
});

type IStyle = ReturnType<typeof userAccountViewJss>

export type UserAccountViewMode = "readonly" | "editOnly" | "both";
export interface RenderMoreAccountSettingsProps {
    user: TKUserAccount;
    onUserChange?: (user: TKUserAccount) => void;
    readonly: boolean;
}

interface IProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    phoneNote?: ReactNode;
    mode?: UserAccountViewMode;
    renderMoreAccountSettings?: (props: RenderMoreAccountSettingsProps) => ReactNode;
}

const digitsOnly = (s: string) => s.replace(/\D/g, "");
function isFormValid(update: TKUserAccount) {
    if (!update.phone) {
        return false;
    }
    const digits = digitsOnly(update.phone);
    if (digits.length !== 11) {
        return false;
    }
    if (!update.name || update.name.trim().length === 0) {
        return false;
    }
    return true;
}

const TKUIUserAccountView: React.FunctionComponent<IProps> = props => {
    const { mode = "readonly", onRequestClose, classes } = useStyles(props, userAccountViewJss);
    const { t } = useI18n();
    const { userAccount: user, onUserChange } = useContext(TKAccountContext);
    const [update, setUpdate] = useState<TKUserAccount>(user!);
    const [editing, setEditing] = useState<boolean>(mode === "editOnly");
    const [waiting, setWaiting] = useState<boolean>(false);

    if (!user) {
        return null;
    }

    let nameEntry;
    if (!editing) {
        nameEntry = user.name &&
            <TKUIRow
                title={t("Name")}
                subtitle={user.name} />;
    } else {
        const nameInput =
            <input
                type='text'
                value={update.name || ''}
                onChange={(e) => {
                    setUpdate(Util.iAssign(update, { name: e.target.value || undefined }));
                }}
                className={classes.phoneInput}
            />
        nameEntry =
            <div className={classes.entry}>
                <TKUIRow
                    title={t("Name")}
                    subtitle={nameInput}
                />
                <div className={classes.required}>
                    Required
                </div>
            </div>;
    }

    let phoneEntry;
    if (!editing) {
        phoneEntry = user.phone &&
            <TKUIRow
                title={t("Phone")}
                subtitle={user.phone}
            />;
    } else {
        // Remove the +1, if present, since the mask already includes it.
        let phoneNumber = update.phone?.trim() || "";
        if (phoneNumber.startsWith("+1")) {
            phoneNumber = phoneNumber.substring(2).trim();
        }
        const phoneInput =
            <PatternFormat
                type='tel'
                format="+1 (###) ###-####"
                allowEmptyFormatting
                mask="_"
                value={phoneNumber}
                onValueChange={(values) => {
                    setUpdate(Util.iAssign(update, { phone: values.formattedValue || undefined }));
                }}
                className={classes.phoneInput}
            />
        phoneEntry =
            <div className={classes.entry}>
                <TKUIRow
                    title={t("Phone")}
                    subtitle={phoneInput}
                />
                <div className={classes.required}>
                    Required
                </div>
            </div>;
    }

    if (phoneEntry && props.phoneNote) {
        phoneEntry =
            <div className={classes.phoneEntry}>
                {phoneEntry}
                <div className={classes.phoneNote}>
                    {props.phoneNote}
                </div>
            </div>
    }

    async function handleSave() {
        if (!isFormValid(update)) {
            return;
        }
        try {
            setWaiting(true);
            await onUserChange?.(update);
            setWaiting(false);
            if (mode === "editOnly" && onRequestClose) {
                onRequestClose();
            } else {
                setEditing(false);
            }
        } catch (error) {
            UIUtil.errorMsg(error as Error);
        } finally {
            setWaiting?.(false);
        }
    }

    function handleCancel() {
        setUpdate(user!);
        if (mode === "editOnly" && onRequestClose) {
            onRequestClose();
        } else {
            setEditing(false);
        }
    }

    const footer = editing ?
        <div className={classes.footer}>
            <TKUIButton
                text={t("Cancel")}
                onClick={() => handleCancel()}
                type={TKUIButtonType.SECONDARY}
            />
            <TKUIButton
                text={t("save")}
                disabled={!isFormValid(update)}
                onClick={() => handleSave()}
            />
        </div> :
        mode === "both" &&
        <div className={classes.footer}>
            <TKUIButton
                text={t("edit")}
                onClick={() => setEditing(true)}
            />
        </div>;

    return (
        <TKUIViewportUtil>
            {(viewportProps) =>
                <TKUICard
                    title={t("My.Account")}
                    presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    onRequestClose={onRequestClose}
                    slideUpOptions={{
                        initPosition: TKUISlideUpPosition.UP,
                        modalUp: { top: 5, unit: 'px' },
                        draggable: false
                    }}
                >
                    <div className={classes.main}>
                        <TKUISettingSection>
                            <TKUIRow
                                title={t("Email")}
                                subtitle={user.email}
                            />
                            {nameEntry}
                            {phoneEntry}
                        </TKUISettingSection>
                        {props.renderMoreAccountSettings?.({ user: update, onUserChange: setUpdate, readonly: !editing })}
                        {footer}
                        {waiting &&
                            <div className={classes.loadingPanel}>
                                <TKLoading />
                            </div>}
                    </div>
                </TKUICard>}
        </TKUIViewportUtil>
    )
};

export default TKUIUserAccountView;
