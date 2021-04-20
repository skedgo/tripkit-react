import * as React from "react";
import {CSSProps, overrideClass, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKUIViewportUtilProps, TKUIViewportUtil} from "../util/TKUIResponsiveUtil";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import {Subtract} from "utility-types";
import {tKUIPrivacyOptionsViewDefaultStyle} from "./TKUIPrivacyOptionsView.css";
import {CardPresentation, default as TKUICard} from "../card/TKUICard";
import TKUserProfile from "../model/options/TKUserProfile";
import classNames from "classnames";
import {black} from "../jss/TKUITheme";
import { withStyles } from '@material-ui/core/styles';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import {TKUIButton, TKUIButtonType} from "../index";
import Util from "../util/Util";
import {TKUISlideUpOptions} from "../card/TKUISlideUp";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void;
    onShowTransportOptions: () => void;
    onRequestClose?: () => void;
    slideUpOptions?: TKUISlideUpOptions;
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

class TKUIPrivacyOptionsView extends React.Component<IProps, {}> {

    private GreenCheckbox;

    constructor(props: IProps) {
        super(props);
        this.state = {};
        this.GreenCheckbox = withStyles({
            root: {
                color: black(1, props.theme.isDark),
                '&$checked': {
                    color: props.theme.colorPrimary,
                },
            },
            checked: {},
        })((props: CheckboxProps) => <Checkbox color="default" {...props} />)
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const t = this.props.t;
        return (
            <TKUICard
                title={t("My.Personal.Data")}
                presentation={this.props.landscape ? CardPresentation.MODAL : CardPresentation.SLIDE_UP}
                onRequestClose={this.props.onRequestClose}
                slideUpOptions={this.props.slideUpOptions}
            >
                <div className={classes.main}>
                    <div className={classes.section}>
                        <div className={classes.sectionBody}>
                            <div className={classes.optionRow} tabIndex={0}>
                                <div>
                                    <div className={classes.optionTitle}>
                                        {t("Real-time.information.for.transport.options")}
                                    </div>
                                    <div className={classes.optionDescription}>
                                        {t("To.show.transport.options,.we.may.share.per-query.information.of.start.location,.end.location,.and.query.time.with.transport.providers..You.can.disable.each.mode.individually,.where.you.dont.want.to.share.this.data.")}
                                    </div>
                                    <TKUIButton text={t("Edit.transport.modes")}
                                                type={TKUIButtonType.PRIMARY_LINK}
                                                styles={{
                                                    main: overrideClass(this.props.injectedStyles.optionLink)
                                                }}
                                                onClick={this.props.onShowTransportOptions}
                                    />
                                </div>
                            </div>
                            <div className={classNames(classes.optionRow, classes.checkboxRow)} tabIndex={0}>
                                <div>
                                    <div className={classes.optionTitle}>
                                        {t("Trip.selections")}
                                    </div>
                                    <div className={classes.optionDescription}>
                                        {t("Help.improve.transport.services.in.your.area.by.allowing.us.to.collect.information.about.which.trips.you.select.in.the.app.\nWe.aggregate.the.anomymised.data.and.provide.it.to.researchers,.regulators,.and.transport.providers.")}
                                    </div>
                                </div>
                                <this.GreenCheckbox
                                    checked={this.props.value.trackTripSelections}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                        const checked = event.target.checked;
                                        const update = Util.deepClone(this.props.value);
                                        update.trackTripSelections = checked;
                                        this.props.onChange(update);
                                    }}
                                    inputProps={{'aria-label': 'Trip selections'}}
                                />
                            </div>
                        </div>
                        <div className={classes.sectionFooter} tabIndex={0}>
                            {t("We.keep.this.data.on.servers.in.Australia,.Europe,.or.the.US..We.retain.this.data.forever.to.be.able.to.create.long-term.trends..For.more.details,.see.our.Privacy.Policy.")}
                        </div>
                    </div>
                    <div style={this.props.theme.divider as any}/>
                    <div className={classes.section}>
                        <div className={classes.sectionBody}>
                            <div className={classes.optionRow}>
                                <TKUIButton text={t("Show.our.Privacy.Policy")}
                                            type={TKUIButtonType.PRIMARY_LINK}
                                            styles={{
                                                main: overrideClass(this.props.injectedStyles.optionLink)
                                            }}
                                            onClick={() => window.open("https://skedgo.com/privacy-policy",'_blank')}
                                />
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