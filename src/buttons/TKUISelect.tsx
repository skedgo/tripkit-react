import React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISelectDefaultStyle} from "./TKUISelect.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Select from 'react-select';
import {ReactComponent as IconTriangleDown} from '../images/ic-triangle-down.svg';
import * as CSS from 'csstype';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    options: any[];
    value: any;
    onChange: (value: any) => void;
    menuIsOpen?: boolean;
    components?: any;
    className?: string;
    controlStyle?: CSS.Properties;
    menuStyle?: CSS.Properties;
}

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> {}

interface IStyle {
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

class TKUISelect extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        const injectedStyles = this.props.injectedStyles;
        const SelectDownArrow = (props: any) => <IconTriangleDown style={{width: '9px', height: '9px'}}/>;
        return (
            <div className={this.props.className}>
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
                />
            </div>
        );
    }

}

export default connect((config: TKUIConfig) => config.TKUISelect, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

