import React from "react";
import {overrideClass} from "../jss/StyleHelper";
import TKUISelect, {IClientProps} from "./TKUISelect";
import {ReactComponent as IconAngleDown} from "../images/ic-angle-down.svg";
import {tKUIProfileViewDefaultStyle} from "../options/TKUIProfileView.css";

const TKUIProfileSelect = (props: IClientProps) => {
    return <TKUISelect
        {...props}
        styles={theme => {
            const profileViewStyle = (tKUIProfileViewDefaultStyle as any)(theme);
            return {
                ...props.styles,
                main: overrideClass(profileViewStyle.optionSelect),
                menu: overrideClass({marginTop: '2px'})
            };
        }}
        components={{
            IndicatorsContainer: () => <IconAngleDown style={{width: '11px', height: '11px', marginRight: '5px'}}/>
        }}
    />;
}

export default TKUIProfileSelect;