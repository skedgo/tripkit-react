import React, { ReactNode, useContext, useState } from 'react';
import { TKAccountContext } from "./TKAccountContext";
import { TKUITheme } from "../jss/TKUITheme";
import genStyles from "../css/GenStyle.css";
import { TKUIWithClasses, useStyles, withStyles } from "../jss/StyleHelper";
import { TKUIViewportUtil } from "../util/TKUIResponsiveUtil";
import TKUICard, { CardPresentation } from "../card/TKUICard";
import { TKUISlideUpPosition } from "../card/TKUISlideUp";
import TKUISettingSection from "../options/TKUISettingSection";
import TKUIRow from "../options/TKUIRow";
import { TKUIWithStyle } from '..';
import TKUserAccount from './TKUserAccount';
import { PatternFormat } from 'react-number-format';
import Util from '../util/Util';

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

interface IProps extends TKUIWithStyle<IStyle, IProps> {
    onRequestClose?: () => void;
    phoneNote?: ReactNode;
    readonly?: boolean;
}

const TKUIUserAccountView: React.FunctionComponent<IProps> = props => {
    const { readonly = true, classes, t } = useStyles(props, userAccountViewJss);
    const { userAccount: user, onUserChange } = useContext(TKAccountContext);
    const [update, setUpdate] = useState<TKUserAccount>(user!);
    if (!user) {
        return null;
    }
    const name = user.givenName ?
        user.givenName + (user.surname ? " " + user.surname : "") : user.surname;

    let phoneEntry;
    if (readonly) {
        phoneEntry = user.phone &&
            <TKUIRow
                title={t("Phone")}
                subtitle={user.phone}
            />;
    } else {
        phoneEntry =
            <PatternFormat
                type='tel'
                format="+1 (###) ###-####"
                allowEmptyFormatting
                mask="_"
                value={update.phone?.trim() || ''}
                onValueChange={(values) => {
                    setUpdate(Util.iAssign(update, { phone: values.formattedValue || undefined }));
                }}
                disabled={readonly}
            />
    }
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
                            {name &&
                                <TKUIRow
                                    title={t("Name")}
                                    subtitle={name}
                                />}
                            {phoneEntry}
                        </TKUISettingSection>
                        {user.phone && props.phoneNote &&
                            <div className={classes.phoneNote}>
                                {props.phoneNote}
                            </div>}
                    </div>
                </TKUICard>}
        </TKUIViewportUtil>
    )
};

export default TKUIUserAccountView;