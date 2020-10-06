import React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISelectDefaultStyle} from "./TKUISelect.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Select from 'react-select';
import {ReactComponent as IconTriangleDown} from '../images/ic-triangle-down.svg';
import * as CSS from 'csstype';
import classNames from "classnames";

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    options: SelectOption[];
    value: any;
    onChange: (value: any) => void;
    menuIsOpen?: boolean;
    components?: any;
    className?: string;
    controlStyle?: CSS.Properties;
    menuStyle?: CSS.Properties;
    renderArrowDown?: () => JSX.Element;
    isDisabled?: boolean,
    ariaLabel?: string
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
    main: CSSProps<IProps>;
    container: CSSProps<IProps>;
    menu: CSSProps<IProps>;
    control: CSSProps<IProps>;
    option: CSSProps<IProps>;
    optionFocused: CSSProps<IProps>;
    optionSelected: CSSProps<IProps>;
}

export type TKUISelectProps = IProps;
export type TKUISelectStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUISelect {...props}/>,
    styles: tKUISelectDefaultStyle,
    classNamePrefix: "TKUISelect"
};

// TODO: Make TKUISelect to default to Dropdown btn style, as used or TKUIProfileView, and adapt other uses
// (from TKUIRoutingQueryInput and TKUIRoutingResultsView).

export interface SelectOption {
    value: any;
    label: string;
}

class TKUISelect extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const injectedStyles = this.props.injectedStyles;
        const SelectDownArrow = this.props.renderArrowDown || ((props: any) => <IconTriangleDown style={{width: '9px', height: '9px'}}/>);
        return (
            <div className={classNames(this.props.className, this.props.classes.main)}>
                <Select
                    options={this.props.options}
                    value={this.props.value}
                    onChange={this.props.onChange}
                    components={{
                        IndicatorsContainer: SelectDownArrow,
                        ...this.props.components
                    }}
                    isSearchable={false}
                    menuIsOpen={this.props.menuIsOpen}
                    styles={{
                        container: (styles: any) => ({...styles, ...injectedStyles.container}),
                        control: (styles: any) => ({...styles, ...injectedStyles.control, ...this.props.controlStyle}),
                        indicatorsContainer: (styles: any) => ({...styles, display: 'none'}),
                        menu: (styles: any) => ({...styles, ...injectedStyles.menu, ...this.props.menuStyle}),
                        option: (styles: any, state: any) => ({
                            ...styles, ...injectedStyles.option,
                            ...(state.isFocused && injectedStyles.optionFocused),
                            ...(state.isSelected && injectedStyles.optionSelected)
                        })
                    }}
                    isDisabled={this.props.isDisabled}
                    aria-label={this.props.ariaLabel}
                />
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUISelect, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

