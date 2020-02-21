import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../util/TKUIResponsiveUtil";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {tKUIPrivacyOptionsViewDefaultStyle} from "./TKUIPrivacyOptionsView.css";
import {CardPresentation, default as TKUICard} from "../card/TKUICard";
import TKUserProfile from "../model/options/TKUserProfile";
import classNames from "classnames";
import {tKUIColors, tKUIDeaultTheme} from "../jss/TKUITheme";
import { withStyles } from '@material-ui/core/styles';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import {TKUIButton, TKUIButtonType} from "../index";
import Util from "../util/Util";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void;
    onShowTransportOptions: () => void;
    onRequestClose?: () => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle {
    main: CSSProps<IProps>;
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    sectionFooter: CSSProps<IProps>;
    optionRow: CSSProps<IProps>;
    optionTitle: CSSProps<IProps>;
    optionDescription: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
    checkboxRow: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUIPrivacyOptionsViewProps = IProps;
export type TKUIPrivacyOptionsViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUIPrivacyOptionsView {...props}/>,
    styles: tKUIPrivacyOptionsViewDefaultStyle,
    classNamePrefix: "TKUIPrivacyOptionsView"
};

const GreenCheckbox = withStyles({
    root: {
        color: tKUIColors.black1,
        '&$checked': {
            color: tKUIDeaultTheme.colorPrimary,    // TODO: avoid hardcoding
        },
    },
    checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

class TKUIPrivacyOptionsView extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const classes = this.props.classes;
        return (
            <TKUICard
                title={"My Personal Data"}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
            >
                <div className={classes.main}>
                    <div className={classes.section}>
                        <div className={classes.sectionBody}>
                            <div className={classes.optionRow}>
                                <div>
                                    <div className={classes.optionTitle}>
                                        Real-time information for transport options
                                    </div>
                                    <div className={classes.optionDescription}>
                                        To show transport options, we may share per-query information of start location,
                                        end location, and query time with transport providers. You can disable each module
                                        individually, where you don't want to share this data.
                                    </div>
                                    <TKUIButton text={"Edit transport modes"}
                                                type={TKUIButtonType.PRIMARY_LINK}
                                                className={classes.optionLink}
                                                onClick={this.props.onShowTransportOptions}
                                    />
                                </div>
                            </div>
                            <div className={classNames(classes.optionRow, classes.checkboxRow)}>
                                <div>
                                    <div className={classes.optionTitle}>
                                        Trip selections
                                    </div>
                                    <div className={classes.optionDescription}>
                                        Help improve transport services in your area by allowing us to collect information about which trips you select in the app.
                                        We aggregate the anonymised data and provide it to researchers, regulators, and transport providers.
                                    </div>
                                </div>
                                <GreenCheckbox
                                    checked={this.props.value.trackTripSelections}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const checked = event.target.checked;
                                        const update = Util.deepClone(this.props.value);
                                        update.trackTripSelections = checked;
                                        this.props.onChange(update);
                                    }}
                                    value="primary"
                                    inputProps={{'aria-label': 'primary checkbox'}}
                                />
                            </div>
                        </div>
                        <div className={classes.sectionFooter}>
                            We keep this data on servers in Australia, Europe, or the US.
                            We retain this data forever to be able to create long-term trends. For more details,
                            see our Privacy Policy.
                        </div>
                        <div className={classes.section}>
                            <div className={classes.sectionBody}>
                                <div className={classes.optionRow}>
                                    <TKUIButton text={"Show our Privacy Policy"}
                                                type={TKUIButtonType.PRIMARY_LINK}
                                                className={classes.optionLink}
                                                onClick={() => window.open("https://skedgo.com/privacy-policy",'_blank')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </TKUICard>
        )
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) => children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect((config: TKUIConfig) => config.TKUIPrivacyOptionsView, config, Mapper);