import React, {useContext} from 'react';
import {TKAccountContext} from "./TKAccountProvider";
import {TKUISettingSection, CardPresentation, TKUIViewportUtil, TKUISlideUpPosition, TKUICard,
    withStyles, TKUITheme, TKUIWithClasses, genStyles, TKUIRow} from '../index';

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