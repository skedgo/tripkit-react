import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import {tKUITransportOptionsRowStyle} from "./TKUITransportOptionsRow.css";
import {DisplayConf} from "../model/options/TKTransportOptions";
import ModeIdentifier from "../model/region/ModeIdentifier";
import TransportUtil from "../trip/TransportUtil";
// import Checkbox from "../buttons/Checkbox";
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Checkbox, { CheckboxProps } from '@material-ui/core/Checkbox';
import { withStyles } from '@material-ui/core/styles';
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {withTheme} from "react-jss";
import {tKUIColors, tKUIDeaultTheme, TKUITheme} from "../jss/TKUITheme";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    value: DisplayConf;
    onChange: (value: DisplayConf) => void;
    mode: ModeIdentifier;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    iconExpand: CSSProps<IProps>;
}

export type TKUITransportOptionsRowProps = IProps;
export type TKUITransportOptionsRowStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportOptionsRow {...props}/>,
    styles: tKUITransportOptionsRowStyle,
    classNamePrefix: "TKUITransportOptionsRow"
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


class TKUITransportOptionsRow extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const value = this.props.value;
        const mode = this.props.mode;
        const classes = this.props.classes;
        return (
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<IconAngleDown className={classes.iconExpand}/>}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <div className={classes.main}>
                        {/*<Checkbox id="ss-wa"*/}
                                  {/*checked={value !== DisplayConf.HIDDEN}*/}
                                  {/*onChange={(checked: boolean) => this.props.onChange(checked ? DisplayConf.NORMAL : DisplayConf.HIDDEN)}*/}
                                  {/*ariaLabelledby={"labe-ss-wa"}/>*/}
                        <GreenCheckbox
                            checked={value !== DisplayConf.HIDDEN}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                const checked = event.target.checked;
                                return this.props.onChange(checked ? DisplayConf.NORMAL : DisplayConf.HIDDEN);
                            }}
                            onClick={event => event.stopPropagation()}
                            onFocus={event => event.stopPropagation()}
                            value="primary"
                            inputProps={{ 'aria-label': 'primary checkbox' }}
                            // icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                            // checkedIcon={<CheckBoxIcon fontSize="small" />}
                        />
                        <img src={TransportUtil.getTransportIconModeId(mode, false, false)}/>
                    </div>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <div>
                        lalala
                    </div>
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );

    }

}

export default connect((config: TKUIConfig) => config.TKUITransportOptionsRow, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));