import { Component, default as React } from "react";
import "./SchoolPicker.css";
interface IProps {
    values: string[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}
declare class SchoolPicker extends Component<IProps, {}> {
    private inputRef;
    constructor(props: IProps);
    private renderInput;
    private onClearClicked;
    private onSelect;
    private setValue;
    render(): React.ReactNode;
}
export default SchoolPicker;
