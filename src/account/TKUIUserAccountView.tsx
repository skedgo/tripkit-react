import React, {useContext} from 'react';
import {TKAccountContext} from "./TKAccountContext";
import {TKUITheme} from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import {TKUIWithClasses, withStyles} from "../jss/StyleHelper";
import {TKUIViewportUtil} from "../util/TKUIResponsiveUtil";
import TKUICard, {CardPresentation} from "../card/TKUICard";
import {TKUISlideUpPosition} from "../card/TKUISlideUp";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUIRow from "../options/TKUIRow";

const userAccountViewJss = (theme: TKUITheme) => ({
    main: {
        ...genStyles.flex,
        ...genStyles.column,
        padding: '30px 0'
    }
});

type IStyle = ReturnType<typeof userAccountViewJss>

interface IProps extends TKUIWithClasses<IStyle, IProps> {
    onRequestClose?: () => void;
}

const TKUIUserAccountView: React.SFC<IProps> = (props) => {
    const {userAccount} = useContext(TKAccountContext);
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
                    title={"Your account"}
                    presentation={viewportProps.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                    onRequestClose={props.onRequestClose}
                    slideUpOptions={{
                        initPosition: TKUISlideUpPosition.UP,
                        modalUp: {top: 5, unit: 'px'},
                        draggable: false
                    }}
                >
                    <div className={classes.main}>
                    <TKUISettingSection>
                        {name &&
                        <TKUIRow
                            title={"Name"}
                            subtitle={name}
                        />}
                        <TKUIRow
                            title={"Email"}
                            subtitle={userAccount.email}
                        />
                    </TKUISettingSection>
                    </div>
                </TKUICard>}
        </TKUIViewportUtil>
    )
};

export default withStyles(TKUIUserAccountView, userAccountViewJss);