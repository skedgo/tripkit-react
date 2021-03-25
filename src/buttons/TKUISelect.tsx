import React from "react";
import {CSSProps, TKUIWithClasses, TKUIWithStyle} from "../jss/StyleHelper";
import {TKComponentDefaultConfig, TKUIConfig} from "../config/TKUIConfig";
import {tKUISelectDefaultStyle} from "./TKUISelect.css";
import {connect, mapperFromFunction} from "../config/TKConfigHelper";
import Select from 'react-select';
import {ReactComponent as IconTriangleDown} from '../images/ic-triangle-down.svg';

export interface IClientProps extends TKUIWithStyle<IStyle, IProps> {
    /**
     * Where:
     *
     * ```
     * type SelectOption = {
     *      value: any;
     *      label: string;
     * }
     * ```
     *
     * @ctype
     */
    options: SelectOption[];

    /**
     * The selected option.
     * @ctype
     */
    value?: SelectOption;

    /**
     * Option selection change callback.
     */
    onChange?: (value: SelectOption) => void;

    /**
     * States if menu is shown. Specify this property to manage menu visibility on a controlled way.
     * @ignore Since probably need to expose an onBlur callback prop.
     */
    menuIsOpen?: boolean;

    /**
     * Forwarded to 'react-select' base component. For more details see
     * [Replacing Components](https://react-select.com/props#replacing-components).
     */
    components?: any;

    /**
     * Stating if select control is disabled.
     */
    isDisabled?: boolean,

    /**
     * Forwarded to 'react-select' base component.
     */
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
    singleValue: CSSProps<IProps>;
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
        const SelectDownArrow = (props: any) => <IconTriangleDown style={{width: '9px', height: '9px'}}/>;
        const classes = this.props.classes;
        return (
            <div className={classes.main}>
                <Select
                    options={this.props.options}
                    value={this.props.value}
                    onChange={this.props.onChange as any}
                    components={{
                        IndicatorsContainer: SelectDownArrow,
                        ...this.props.components
                    }}
                    isSearchable={false}
                    menuIsOpen={this.props.menuIsOpen}
                    styles={{
                        container: (styles: any) => ({...styles, ...injectedStyles.container}),
                        control: (styles: any) => ({...styles, ...injectedStyles.control}),
                        indicatorsContainer: (styles: any) => ({...styles, display: 'none'}),
                        menu: (styles: any) => ({...styles, ...injectedStyles.menu}),
                        option: (styles: any, state: any) => ({
                            ...styles, ...injectedStyles.option,
                            ...(state.isFocused && injectedStyles.optionFocused),
                            ...(state.isSelected && injectedStyles.optionSelected)
                        }),
                        singleValue: (styles: any) => ({...styles, ...injectedStyles.singleValue})
                    }}
                    isDisabled={this.props.isDisabled}
                    aria-label={this.props.ariaLabel}
                />
            </div>
        );
    }

}

/**
 * Select input control based on [react-select](https://react-select.com/).
 */

export default connect((config: TKUIConfig) => config.TKUISelect, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));

