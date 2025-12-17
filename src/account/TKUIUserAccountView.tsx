import React, { ReactNode, useContext, useState } from 'react';
import { TKAccountContext } from "./TKAccountContext";
import { TKUITheme } from "../jss/TKUITheme";
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
import TKUIButton from '../buttons/TKUIButton';
import TKLoading from '../card/TKLoading';

const userAccountViewJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '30px 0',
        height: '100%',
        position: 'relative'
    },
    phoneNote: {
        padding: '0 30px',
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

interface IProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    phoneNote?: ReactNode;
    readonly?: boolean;
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
    const { readonly = true, classes } = useStyles(props, userAccountViewJss);
    const { t } = useI18n();
    const { userAccount: user, onUserChange } = useContext(TKAccountContext);
    const [update, setUpdate] = useState<TKUserAccount>(user!);
    const [waiting, setWaiting] = useState<boolean>(false);

    if (!user) {
        return null;
    }

    let nameEntry;
    if (readonly) {
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
                disabled={readonly}
                className={classes.phoneInput}
            />
        nameEntry =
            <TKUIRow
                title={t("Name")}
                subtitle={nameInput}
            />;
    }

    let phoneEntry;
    if (readonly) {
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
                disabled={readonly}
                className={classes.phoneInput}
            />
        phoneEntry =
            <TKUIRow
                title={t("Phone")}
                subtitle={phoneInput}
            />;
    }

    async function handleSave() {
        if (!isFormValid(update)) {
            return;
        }
        setWaiting(true);
        await onUserChange?.(update);
        setWaiting(false);
    }
    const footer = !readonly &&
        <div className={classes.footer}>
            <TKUIButton
                text={t("save")}
                disabled={!isFormValid(update)}
                onClick={() => handleSave()}
            />
        </div>;

    return (
        <TKUIViewportUtil>
            {(viewportProps) =>
                <TKUICard
                    title={t("My.Account")}
                    presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    onRequestClose={props.onRequestClose}
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
                        {user.phone && props.phoneNote &&
                            <div className={classes.phoneNote}>
                                {props.phoneNote}
                            </div>}
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