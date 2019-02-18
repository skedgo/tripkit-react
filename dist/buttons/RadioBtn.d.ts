import * as React from "react";
import "./RadioBtn.css";
interface IProps {
    id?: string;
    name?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    ariaLabelledby?: string;
}
declare class RadioBtn extends React.Component<IProps, {}> {
    render(): React.ReactNode;
}
export default RadioBtn;
