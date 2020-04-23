import * as React from "react";
// import  "./Checkbox.css";

interface IProps {
    id?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    ariaLabelledby?: string;
    disabled?: boolean;
}

class Checkbox extends React.Component<IProps, {}> {
    public render(): React.ReactNode {
        return (
            <button className={"sg-checkbox-frame" + (this.props.checked ? " checked" : "")}
                    id={this.props.id}
                    onClick={(this.props.onChange) ? (e: any) => { this.props.onChange!(!this.props.checked) } : undefined}
                    aria-labelledby={this.props.ariaLabelledby}
                    role={"checkbox"}
                    aria-checked={this.props.checked}
                    disabled={this.props.disabled}
            >
                <div className="sg-checkbox">
                    <label>
                        <span>
                            <div/>
                        </span>
                    </label>
                </div>
            </button>
        );
    }
}

export default Checkbox;