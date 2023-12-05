import React from "react";
import { ReactComponent as IconSpin } from '../images/ic-loading2.svg';
import { black, TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIWithClasses, withStyles } from "../jss/StyleHelper";

const loadingViewJss = (theme: TKUITheme) => ({
    main: {
        margin: '0 5px',
        width: '20px',
        height: '20px',
        color: black(1, theme.isDark),
        ...genStyles.alignSelfCenter,
        ...genStyles.animateSpin,
        ...genStyles.svgFillCurrColor
    }
});

type IStyle = ReturnType<typeof loadingViewJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {

}

const TKLoading: React.FunctionComponent<IProps> = (props: IProps) => <IconSpin className={props.classes.main} focusable="false" />;

export default withStyles(TKLoading, loadingViewJss);