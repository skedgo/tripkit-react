import * as React from "react";
import {CSSProps, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import {ClassNameMap} from "react-jss";
import {tKUITransportOptionsViewDefaultStyle} from "./TKUITransportOptionsView.css";
import {IOptionsContext, OptionsContext} from "./OptionsProvider";
import {IRoutingResultsContext, RoutingResultsContext} from "../trip-planner/RoutingResultsProvider";
import Region from "../model/region/Region";
import TKTransportOptions, {DisplayConf} from "../model/options/TKTransportOptions";
import RegionsData from "../data/RegionsData";
import TransportUtil from "../trip/TransportUtil";
import classNames from "classnames";
import Tooltip from "rc-tooltip";
import "../trip/TripAltBtn.css";
import Util from "../util/Util";
import TKUIButton, {TKUIButtonType} from "../buttons/TKUIButton";
import genStyles from "../css/GenStyle.css";

export interface ITKUITransportOptionsViewProps extends TKUIWithStyle<ITKUITransportOptionsViewStyle, ITKUITransportOptionsViewProps> {
    onMoreOptions: () => void;
}

interface IConsumedProps {
    region?: Region;
    value: TKTransportOptions,
    onChange: (value: TKTransportOptions) => void
}

export interface ITKUITransportOptionsViewStyle {
    main: CSSProps<ITKUITransportOptionsViewProps>;
    modeSelector: CSSProps<ITKUITransportOptionsViewProps>;
    modeIcon: CSSProps<ITKUITransportOptionsViewProps>;
    modeIconDisabled: CSSProps<ITKUITransportOptionsViewProps>;
    tooltip: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipContent: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipDisabled: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipRight: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipTitle: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipStateEnabled: CSSProps<ITKUITransportOptionsViewProps>;
    tooltipStateDisabled: CSSProps<ITKUITransportOptionsViewProps>;
}

interface IProps extends ITKUITransportOptionsViewProps, IConsumedProps {
    classes: ClassNameMap<keyof ITKUITransportOptionsViewStyle>;
}

class TKUITransportOptionsView extends React.Component<IProps, {}> {

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
                            return (
                                <Tooltip placement="top"
                                         overlay={tooltip}
                                         overlayClassName={classNames("app-style", "TripRow-altTooltip", classes.tooltip)}
                                         mouseEnterDelay={.5}
                                         arrowContent={null}
                                         key={index}
                                >
                                    <button
                                        className={classNames(classes.modeIcon,
                                            modeOption === DisplayConf.HIDDEN && classes.modeIconDisabled)}
                                        onClick={() => this.onChange(mode)}
                                    >
                                        <img src={TransportUtil.getTransportIconModeId(modeIdentifier, false, false)}/>
                                    </button>
                                </Tooltip>
                            );
                        }
                    )}
                </div>
                <TKUIButton type={TKUIButtonType.PRIMARY_LINK}
                            text={"More options"}
                            style={{
                                marginLeft: '10px',
                                ...genStyles.fontS
                            }}
                            onClick={this.props.onMoreOptions}
                />
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

export const Connect = (RawComponent: React.ComponentType<IProps>) => {
    const RawComponentStyled = withStyleProp(RawComponent, "TKUITransportOptionsView");
    return (addProps: ITKUITransportOptionsViewProps) => {
        const stylesToPass = addProps.styles || tKUITransportOptionsViewDefaultStyle;
        const randomizeClassNamesToPass = addProps.randomizeClassNames;
        return (
            <Consumer>
                {(props: IConsumedProps) => {
                    return <RawComponentStyled {...props} {...addProps} styles={stylesToPass}
                                               randomizeClassNames={randomizeClassNamesToPass}/>
                }}
            </Consumer>
        );
    };
};

export default Connect(TKUITransportOptionsView);