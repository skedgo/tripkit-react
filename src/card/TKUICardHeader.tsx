import * as React from "react";
import { TKUIWithClasses, TKUIWithStyle } from "../jss/StyleHelper";
import { ReactComponent as IconRemove } from '../images/ic-cross2.svg';
import { tKUICardHeaderJss } from "./TKUICardHeader.css";
import { TKComponentDefaultConfig, TKUIConfig } from "../config/TKUIConfig";
import { connect, mapperFromFunction } from "../config/TKConfigHelper";

type IStyle = ReturnType<typeof tKUICardHeaderJss>

export interface TKUICardHeaderClientProps {
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    onRequestClose?: () => void;
    closeAriaLabel?: string;
    noPaddingTop?: boolean;
}

interface IClientProps extends TKUICardHeaderClientProps, TKUIWithStyle<IStyle, IProps> { }

interface IProps extends IClientProps, TKUIWithClasses<IStyle, IProps> { }

export type TKUICardHeaderProps = IProps;
export type TKUICardHeaderStyle = IStyle;

const config: TKComponentDefaultConfig<IProps, IStyle> = {
    render: props => <TKUICardHeader {...props} />,
    styles: tKUICardHeaderJss,
    classNamePrefix: "TKUICardHeader"
};


const TKUICardHeader: React.FunctionComponent<IProps> = (props: IProps) => {
    const { title, subtitle, onRequestClose, classes, closeAriaLabel } = props;
    return (
        <div className={classes.main}>
            <div className={classes.headerTop}>
                {title &&
                    <div className={classes.title} id={"tkui-card-title"}>
                        {title}
                    </div>}
                {onRequestClose &&
                    <button onClick={onRequestClose} className={classes.btnClear}
                        aria-label={closeAriaLabel || "Close"}>
                        <IconRemove aria-hidden={true}
                            className={classes.iconClear}
                            focusable="false" />
                    </button>}
            </div>
            {subtitle &&
                <div className={classes.subtitle}>
                    {subtitle}
                </div>}
        </div>
    );
};

export default connect((config: TKUIConfig) => config.TKUICardHeader, config,
    mapperFromFunction((clientProps: IClientProps) => clientProps));