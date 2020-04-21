import * as React from "react";
import "./Checkbox.css";
interface IProps {
    id?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    ariaLabelledby?: string;
    disabled?: boolean;
}
declare class Checkbox extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default Checkbox;
