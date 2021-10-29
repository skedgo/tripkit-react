import React, {useContext} from 'react';
import TKUISignInBtn from "./TKUISignInBtn";
import {SignInStatus, TKAccountContext} from "./TKAccountProvider";
import {ReactComponent as IconProfile} from "../images/ic-profile.svg";
import {resetStyles} from "../css/ResetStyle.css";
import {colorWithOpacity, TKUITheme, white} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {TKUIWithClasses, withStyles} from "../jss/StyleHelper";
import {OptionsContext} from "../options/OptionsProvider";

const accountBtnJss = (theme: TKUITheme) => ({
    main: {
        ...resetStyles.button,
        width: '45px',
        height: '45px',
        cursor: 'pointer',
        backgroundColor: colorWithOpacity(white(0, theme.isDark), .8),
        ...genStyles.borderRadius(50, "%"),
        padding: '10px',
        '& svg path': {
            fill: theme.colorPrimary
        }
    }
});

type IStyle = ReturnType<typeof accountBtnJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {}

const TKUIAccountBtn: React.SFC<IProps> = (props: IProps) => {
    const {status} = useContext(TKAccountContext);
    const {setShowUserProfile} = useContext(OptionsContext);
    const classes = props.classes;
    return (
        status === SignInStatus.signedIn ?
            <button className={classes.main} onClick={() => setShowUserProfile(true)}>
                <IconProfile/>
            </button>
            : <TKUISignInBtn/>
    )
};

export default withStyles(TKUIAccountBtn, accountBtnJss);