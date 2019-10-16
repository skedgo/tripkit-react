import * as React from "react";
import {CSSProperties, ClassNameMap, Styles, WithSheet, StyleCreator} from 'react-jss';
import {CSSProps, TKUIStyles, TKUIWithStyle, withStyleProp} from "../jss/StyleHelper";
import classNames from "classnames";
import {tKUIButtonDefaultStyle} from "./TKUIButton.css";
import * as CSS from 'csstype';

export enum TKUIButtonType {
    PRIMARY, SECONDARY, PRIMARY_VERTICAL, SECONDARY_VERTICAL
}

export interface ITKUIButtonProps extends TKUIWithStyle<ITKUIButtonStyle, ITKUIButtonProps> {
    type?: TKUIButtonType;
    text?: string;
    icon?: JSX.Element;
    style?: CSS.Properties;
}

interface IProps extends ITKUIButtonProps {
    classes: ClassNameMap<keyof ITKUIButtonStyle>
}

export interface ITKUIButtonStyle {
    main: CSSProps<IProps>;
    primary: CSSProps<IProps>;
    secondary: CSSProps<IProps>;
    iconContainer: CSSProps<IProps>;
    verticalPanel: CSSProps<IProps>;
}

export class TKUIButtonConfig {
    public styles: TKUIStyles<ITKUIButtonStyle, ITKUIButtonProps> = tKUIButtonDefaultStyle;

    public static instance = new TKUIButtonConfig();
}

class TKUIButton extends React.Component<IProps, {}> {

    public static defaultProps: Partial<IProps> = {
        type: TKUIButtonType.PRIMARY
    };

    public render(): React.ReactNode {
        const classes = this.props.classes;
        const type = this.props.type;
        const secondary = type === TKUIButtonType.SECONDARY || type === TKUIButtonType.SECONDARY_VERTICAL;
        const vertical = type === TKUIButtonType.PRIMARY_VERTICAL || type === TKUIButtonType.SECONDARY_VERTICAL;
        return (
            vertical ?
                <div className={classes.verticalPanel}
                     style={this.props.style}
                >
                    <button className={classNames(classes.main,
                        secondary ? classes.secondary : classes.primary)}
                    >
                        {this.props.icon &&
                        <div className={classes.iconContainer}>
                            {this.props.icon}
                        </div>}
                    </button>
                    {this.props.text}
                </div>
                :
                <button className={classNames(classes.main,
                    secondary ? classes.secondary : classes.primary)}
                        style={this.props.style}
                >
                    {this.props.icon &&
                    <div className={classes.iconContainer}>
                        {this.props.icon}
                    </div>
                    }
                    {this.props.text}
                </button>
        );
    }

}

const TKUIButtonWithStyleProp = withStyleProp(TKUIButton);

export default (props: ITKUIButtonProps) => {
    const stylesToPass = props.styles || TKUIButtonConfig.instance.styles;
    return <TKUIButtonWithStyleProp {...props} styles={stylesToPass}/>
};