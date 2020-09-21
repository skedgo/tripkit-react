import * as React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Tooltip from "rc-tooltip";
import {RCTooltip} from "rc-tooltip";
import {tKUITooltipDefaultStyle} from "./TKUITooltip.css";
import classNames from "classnames";
import {ReactComponent as IconRemove} from '../images/ic-cross2.svg';
import {genClassNames} from "../css/GenStyle.css";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    placement?: string;
    // To set the overlay
    overlay?: React.ReactNode;
    // To set just the overlay content, that is, default overlay style applies in this case.
    overlayContent?: React.ReactNode;
    mouseEnterDelay?: number;
    trigger?: string[];
    arrowContent?: React.ReactNode;
    className?: string;
    arrowColor?: string;
    children?: any;
    visible?: boolean;
    onVisibleChange?: (visible?: boolean) => void;
    reference?: (ref: TKUITooltip) => void;
    onRequestClose?: () => void;
    destroyTooltipOnHide?: boolean;
}

export interface IStyle {
    main: CSSProps<IProps>;
    overlayContent: CSSProps<IProps>;
    btnClear: CSSProps<IProps>;
    iconClear: CSSProps<IProps>;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

export type TKUITooltipProps = IProps;
export type TKUITooltipStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUITooltip {...props}/>,
    styles: tKUITooltipDefaultStyle,
    classNamePrefix: "TKUITooltip"
};

interface IState {
    temporaryVisible: boolean;
}

class TKUITooltip extends React.Component<IProps, IState> {

    constructor(props: IProps) {
        super(props);
        this.state = {
            temporaryVisible: false
        };
        this.isVisible = this.isVisible.bind(this);
        this.setVisibleFor = this.setVisibleFor.bind(this);
        if (props.reference) {
            props.reference(this);
        }
    }

    private isVisible(): boolean | undefined {
        return this.state.temporaryVisible ? this.state.temporaryVisible : this.props.visible;
    }

    private visibleForTimeout: any;

    public setVisibleFor(duration?: number) {
        this.setState({temporaryVisible: duration !== undefined && duration > 0});
        if (this.visibleForTimeout) {
            clearTimeout(this.visibleForTimeout);
            this.visibleForTimeout = undefined;
        }
        if (duration !== undefined && duration > 0) {
            this.visibleForTimeout = setTimeout(() => {
                this.setState({temporaryVisible: false});
            }, duration);
        }
    }

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const overlay = this.props.overlay ? this.props.overlay :
            <div className={classes.overlayContent}>
                {this.props.overlayContent}
                {this.props.onRequestClose &&
                <button onClick={this.props.onRequestClose} className={classNames(classes.btnClear)}
                        aria-hidden={true}>
                    <IconRemove aria-hidden={true}
                                className={classes.iconClear}
                                focusable="false"/>
                </button>}
            </div>;
        return (
            <Tooltip
                {...this.props as RCTooltip.Props}
                overlay={overlay}
                // Have to do the following because passing visible={undefined} is not the same as not passing visible property.
                {...this.isVisible() ? {visible: this.isVisible()} : undefined}
                overlayClassName={classNames(classes.main, this.props.className, genClassNames.root)}
                arrowContent={this.props.arrowContent}
                destroyTooltipOnHide={this.props.destroyTooltipOnHide}
            >
                {this.props.children}
            </Tooltip>
        );
    }
}

export default connect((config: TKUIConfig) => config.TKUITooltip, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

