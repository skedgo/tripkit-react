import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUITransportSwitchesViewDefaultStyle} from "./TKUITransportSwitchesView.css";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import TKTransportOptions, {DisplayConf} from "../model/options/TKTransportOptions";
import RegionsData from "../data/RegionsData";
import TransportUtil from "../trip/TransportUtil";
import classNames from "classnames";
import "../trip/TripAltBtn.css";
import Util from "../util/Util";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import genStyles from "../css/GenStyle.css";
import TKUITooltip from "../card/TKUITooltip";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, PropsMapper} from "../config/TKConfigHelper";
import Region from "../model/region/Region";
import {Subtract} from "utility-types";
import DeviceUtil from "../util/DeviceUtil";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    onMoreOptions?: () => void;
}

interface IConsumedProps {
    region?: Region;
    value: TKTransportOptions,
    onChange: (value: TKTransportOptions) => void
}


interface IProps extends IClientProps, IConsumedProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    modeSelector: CSSProps<IProps>;
    modeIcon: CSSProps<IProps>;
    modeIconDisabled: CSSProps<IProps>;
    tooltip: CSSProps<IProps>;
    tooltipContent: CSSProps<IProps>;
    tooltipDisabled: CSSProps<IProps>;
    tooltipRight: CSSProps<IProps>;
    tooltipTitle: CSSProps<IProps>;
    tooltipStateEnabled: CSSProps<IProps>;
    tooltipStateDisabled: CSSProps<IProps>;
}

export type TKUITransportSwitchesViewProps = IProps;
export type TKUITransportSwitchesViewStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITransportSwitchesView {...props}/>,
    styles: tKUITransportSwitchesViewDefaultStyle,
    classNamePrefix: "TKUITransportSwitchesView"
};

class TKUITransportSwitchesView extends React.Component<IProps, {}> {

    private onChange(mode: string) {
        const transOptions = Util.deepClone(this.props.value);
        const modeOption = transOptions.getTransportOption(mode);
        transOptions.setTransportOption(mode, modeOption !== DisplayConf.HIDDEN ? DisplayConf.HIDDEN : DisplayConf.NORMAL);
        this.props.onChange(transOptions);
    }

    public render(): React.ReactNode {
        const region = this.props.region;
        if (!region) {
            return null;
        }
        const transOptions = this.props.value;
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <div className={classes.modeSelector}>
                    {region.modes.map((mode: string, index: number) => {
                            const modeOption = transOptions.getTransportOption(mode);
                            const modeIdentifier = RegionsData.instance.getModeIdentifier(mode)!;
                            const tooltip =
                                <div className={classNames(classes.tooltipContent, modeOption === DisplayConf.HIDDEN && classes.tooltipDisabled)}>
                                    <img src={TransportUtil.getTransportIconModeId(modeIdentifier, false, false)}/>
                                    <div className={classes.tooltipRight}>
                                        <div className={classes.tooltipTitle}>{modeIdentifier.title}</div>
                                        <div className={modeOption === DisplayConf.HIDDEN ?
                                            classes.tooltipStateDisabled : classes.tooltipStateEnabled}>
                                            {modeOption === DisplayConf.HIDDEN ? "Disabled" : "Enabled"}
                                        </div>
                                    </div>
                                </div>;
                            const transBtn = <button
                                className={classNames(classes.modeIcon,
                                    modeOption === DisplayConf.HIDDEN && classes.modeIconDisabled)}
                                onClick={() => this.onChange(mode)}
                            >
                                <img src={TransportUtil.getTransportIconModeId(modeIdentifier, false, false)}/>
                            </button>;
                            return ( DeviceUtil.isTouch() ?
                                    transBtn :
                                    <TKUITooltip placement="top"
                                                 overlay={tooltip}
                                                 overlayClassName={classes.tooltip}
                                                 mouseEnterDelay={.5}
                                                 arrowContent={null}
                                                 key={index}
                                    >
                                        {transBtn}
                                    </TKUITooltip>
                            );
                        }
                    )}
                </div>
                {this.props.onMoreOptions &&
                <TKUIButton type={TKUIButtonType.PRIMARY_LINK}
                            text={"More options"}
                            style={{
                                marginLeft: '10px',
                                ...genStyles.fontS
                            }}
                            onClick={this.props.onMoreOptions}
                />}
            </div>
        )
    }

}

const Consumer: React.SFC<{children: (props: IConsumedProps) => React.ReactNode}> = (props: {children: (props: IConsumedProps) => React.ReactNode}) => {
    return (
        <OptionsContext.Consumer>
            {(optionsContext: IOptionsContext) =>
                <RoutingResultsContext.Consumer>
                    {(routingContext: IRoutingResultsContext) =>
                        props.children!({
                            value: optionsContext.value.transportOptions,
                            onChange: (value: TKTransportOptions) => {
                                const newValue = Util.iAssign(optionsContext.value, {transportOptions: value});
                                optionsContext.onChange(newValue);
                            },
                            region: routingContext.region
                        })}
                </RoutingResultsContext.Consumer>
            }
        </OptionsContext.Consumer>
    );
};

const Mapper: PropsMapper<IClientProps, Subtract<IProps, TKUIWithClasses<IStyle, IProps>>> =
    ({inputProps, children}) =>
        <Consumer>
            {(consumedProps: IConsumedProps) =>
                children!({...inputProps, ...consumedProps})}
        </Consumer>;

export default connect((config: TKUIConfig) => config.TKUITransportSwitchesView, config, Mapper);