import React, { ReactNode, useContext, useState } from 'react';
import { TKAccountContext } from "./TKAccountContext";
import TKUIUserAccountView from "./TKUIUserAccountView";
import { TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIWithClasses, withStyles } from "../jss/StyleHelper";
import TKUISettingLink from "../options/TKUISettingLink";
import { TKI18nContext } from '../i18n/TKI18nProvider';

const userAccountSettingJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        ...genStyles.alignStart
    },
    title: {
        ...theme.textWeightBold,
        textAlign: 'left'
    },
    subtitle: {
        ...theme.textColorGray
    }
});

type IStyle = ReturnType<typeof userAccountSettingJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    phoneNote?: ReactNode;
    moreSettings?: ReactNode;
}

const TKUIUserAccountSetting: React.FunctionComponent<IProps> = props => {
    const { moreSettings, classes } = props;
    const { userAccount } = useContext(TKAccountContext);
    const { t } = useContext(TKI18nContext);
    const [showAccountView, setShowAccountView] = useState<boolean>(false);
    if (!userAccount) {
        return null;
    }
    const title = userAccount.givenName ?
        userAccount.givenName + (userAccount.surname ? " " + userAccount.surname : "") :
        userAccount.email;
    const subtitle = t("My.Account");
    return (
        <>
            <TKUISettingLink
                text={
                    <div className={classes.main}>
                        <div className={classes.title}>{title || subtitle}</div>
                        {title !== undefined &&
                            <div className={classes.subtitle}>{subtitle}</div>}
                    </div>
                }
                onClick={() => setShowAccountView(true)}
            />
            {moreSettings}
            {showAccountView &&
                <TKUIUserAccountView onRequestClose={() => setShowAccountView(false)} phoneNote={props.phoneNote} />}
        </>
    )
};

export default withStyles(TKUIUserAccountSetting, userAccountSettingJss);