import React, { ReactNode, useContext } from 'react';
import { TKAccountContext } from "./TKAccountContext";
import { TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIWithClasses, withStyles } from "../jss/StyleHelper";
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUIRow from "../options/TKUIRow";
import { TKI18nContext } from '../i18n/TKI18nProvider';

const userAccountViewJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '30px 0'
    },
    phoneNote: {
        padding: '0 30px',
        ...theme.textColorGray,
        ...theme.textSizeCaption,
        '& a': {
            color: theme.colorPrimary
        }
    }
});

type IStyle = ReturnType<typeof userAccountViewJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    onRequestClose?: () => void;
    phoneNote?: ReactNode;
}

const TKUIUserAccountView: React.FunctionComponent<IProps> = props => {
    const { userAccount } = useContext(TKAccountContext);
    const { t } = useContext(TKI18nContext);
    if (!userAccount) {
        return null;
    }
    const classes = props.classes;
    const name = userAccount.givenName ?
        userAccount.givenName + (userAccount.surname ? " " + userAccount.surname : "") : userAccount.surname;
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
                            {name &&
                                <TKUIRow
                                    title={t("Name")}
                                    subtitle={name}
                                />}
                            <TKUIRow
                                title={t("Email")}
                                subtitle={userAccount.email}
                            />
                            {userAccount.phone &&
                                <TKUIRow
                                    title={t("Phone")}
                                    subtitle={userAccount.phone}
                                />}
                        </TKUISettingSection>
                        {userAccount.phone && props.phoneNote &&
                            <div className={classes.phoneNote}>
                                {props.phoneNote}
                            </div>}
                    </div>
                </TKUICard>}
        </TKUIViewportUtil>
    )
};

export default withStyles(TKUIUserAccountView, userAccountViewJss);