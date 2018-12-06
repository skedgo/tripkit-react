import * as React from "react";
import  "./RadioBtn.css";

interface IProps {
    id?: string;
    name?: string;
    checked?: boolean;
    onChange?: (checked: boolean) => void;
    ariaLabelledby?: string;
}

class RadioBtn extends React.Component<IProps, {}> {

    public render(): React.ReactNode {
        return (
            <button className={"sg-radio-frame" + (this.props.checked ? " checked" : "")}
                    id={this.props.id}
                    onClick={(this.props.onChange) ? (e: any) => { this.props.onChange!(!this.props.checked) } : undefined}
                    aria-labelledby={this.props.ariaLabelledby}
                    aria-checked={this.props.checked}
            >
                <div className="sg-radio">
                    <input type='radio'
                           name={this.props.name}
                           checked={this.props.checked}
                           // onChange={(this.props.onChange) ? (e: any) => { this.props.onChange!(!this.props.checked) } : undefined}
                           readOnly={true}
                           style={{display: "none"}}
                    />
                    <label>
                        <span/>
                    </label>
                </div>
            </button>
        );
    }
}

export default RadioBtn;