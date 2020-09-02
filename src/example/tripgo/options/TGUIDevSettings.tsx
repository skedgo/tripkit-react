import * as React from "react";
import {ClassNameMap} from "react-jss";
import TKUserProfile from "../../../model/options/TKUserProfile";
import {ReactComponent as IconRightArrow} from "../../../images/ic-angle-right.svg";
import classNames from "classnames";
import {cardSpacing} from "../../../jss/TKUITheme";
import {TKUISlideUpPosition} from "../../../card/TKUISlideUp";
import TGUIDevSettingsView from "./TGUIDevSettingsView";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../../../jss/StyleHelper";
import {TKUIViewportUtil, TKUIViewportUtilProps} from "../../../util/TKUIResponsiveUtil";
import {connect, PropsMapper} from "../../../config/TKConfigHelper";
import {TKComponentDefaultConfig} from "../../../config/TKUIConfig";
import {tGUIDevSettingsDefaultStyle} from "./TGUIDevSettings.css";
import {Subtract} from "utility-types";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: TKUserProfile,
    onChange: (value: TKUserProfile) => void;
}

interface IConsumedProps extends TKUIViewportUtilProps {}

export interface IStyle {
    section: CSSProps<IProps>;
    sectionTitle: CSSProps<IProps>;
    sectionBody: CSSProps<IProps>;
    optionRow: CSSProps<IProps>;
    optionLink: CSSProps<IProps>;
}

interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

export type TGUIDevSettingsProps = IProps;
export type TGUIDevSettingsStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TGUIDevSettings {...props}/>,
    styles: tGUIDevSettingsDefaultStyle,
    classNamePrefix: "TGUIDevSettings"
};

interface IState {
    showDevSettings: boolean;
}

class TGUIDevSettings extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            showDevSettings: false
        };
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const devSettings = this.state.showDevSettings &&
            <TGUIDevSettingsView
                value={this.props.value}
                onChange={this.props.onChange}
                onRequestClose={() => this.setState({showDevSettings: false})}
                slideUpOptions={{
                    position: TKUISlideUpPosition.UP,
                    modalUp: {top: cardSpacing(this.props.landscape), unit: 'px'},
                    draggable: false
                }}
            />;
        return ([
            <div className={classes.section}>
                <div className={classes.sectionBody}>
                    <div className={classNames(classes.optionRow, classes.optionLink)}
                         onClick={() => this.setState({showDevSettings: true})}
                    >
                        Beta Testing
                        <IconRightArrow/>
                    </div>
                </div>
            </div>,
            devSettings
        ]);
    }

}

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <TKUIViewportUtil>
            {(viewportProps: TKUIViewportUtilProps) =>
                children!({...inputProps, ...viewportProps})}
        </TKUIViewportUtil>;

export default connect(() => undefined, config, Mapper);