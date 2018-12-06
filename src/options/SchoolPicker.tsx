import {Component, default as React} from "react";
import Autocomplete from 'react-autocomplete';
import "./SchoolPicker.css";
import IconRemove from '-!svg-react-loader!../images/ic-cross.svg';

interface IProps {
    values: string[];
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
}

class SchoolPicker extends Component<IProps, {}> {

    private inputRef: any;

    constructor(props: IProps) {
        super(props);
        this.renderInput = this.renderInput.bind(this);
        this.onSelect = this.onSelect.bind(this);
        this.onClearClicked = this.onClearClicked.bind(this);
        this.setValue = this.setValue.bind(this);
    }

    private renderInput(props: any) {
        return (
            <div className={"SchoolPicker-inputWrapper" + (this.props.disabled ? " disabled" : "")}>
                <input {...props}/>
                <IconRemove className={"SchoolPicker-iconClear gl-no-shrink" + (!this.props.value ? " gl-hidden" : "")}
                            onClick={this.onClearClicked} focusable="false"/>
            </div>
        );
    }

    private onClearClicked() {
        if (!this.props.disabled) {
            // focus() must be called after completion of setState()
            this.setValue('', () => this.inputRef.focus());
        }
    }

    private onSelect(value: string) {
        this.setValue(value);
        this.inputRef.blur();   // Lose focus on selection (e.g. user hits enter on highligthed result)
    }

    private setValue(value: string, callback?: () => void) {
        if (this.props.onChange) {
            this.props.onChange(value);
        }
        if (callback) {
            callback();
        }
    }

    public render(): React.ReactNode {
        return (
            <Autocomplete
                getItemValue={(item) => item}
                items={this.props.values}
                shouldItemRender={(item, value) => item.toLowerCase().indexOf(value.toLowerCase()) > -1}
                renderInput={this.renderInput}
                renderItem={(item, isHighlighted) =>
                    <div style={
                        {
                            background: isHighlighted ? 'lightgray' : 'white',
                            padding: "3px 6px"
                        }
                    }
                         key={item}
                    >
                        {item}
                    </div>
                }
                value={this.props.value}
                onChange={e => this.setValue(e.target.value)}
                onSelect={this.onSelect}
                inputProps={{
                    style: {
                        fontSize: "16px",
                        lineHeight: "30px",
                    },
                    placeholder: this.props.disabled ? "School services" : "Select your school",
                    disabled: this.props.disabled
                }}
                wrapperStyle = {{
                    position: "relative"
                }}
                menuStyle={{
                    position: "absolute",
                    overflow: "auto",
                    maxHeight: "130px",
                    width: "100%",
                    left: "0",
                    top: "36px",
                    minWidth: "152px",
                    zIndex: 1
                }}
                ref={el => this.inputRef = el}
                // open={true}
            />
        )
    }
}

export default SchoolPicker;