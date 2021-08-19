import React, {useContext, useState} from 'react';
import {TKAccountContext} from "./TKAccountProvider";
import {TKUISettingLink, withStyles, TKUITheme, TKUIWithClasses, genStyles} from '../index';
import TKUIUserAccountView from "./TKUIUserAccountView";

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

interface IProps extends TKUIWithClasses<IStyle, IProps> {}

const TKUIUserAccountSetting: React.SFC<IProps> = (props) => {
    const {userAccount} = useContext(TKAccountContext);
    const [showAccountView, setShowAccountView] = useState<boolean>(false);
    if (!userAccount) {
        return null;
    }
    const classes = props.classes;
    const title = userAccount.givenName ?
        userAccount.givenName + (userAccount.surname ? " " + userAccount.surname : "") :
        userAccount.email;
    const subtitle = "Your account";
    return (
        <React.Fragment>
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
            {showAccountView &&
            <TKUIUserAccountView onRequestClose={() => setShowAccountView(false)}/>}
        </React.Fragment>
    )
};

export default withStyles(TKUIUserAccountSetting, userAccountSettingJss);