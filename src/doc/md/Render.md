The ```render``` property of component config allows to replace component implementation with a custom one.
Each component has a specific props interface, so the render property allows to specify a function mapping from 
component's properties to a JSX.Element.

For instance, you can replace the implementation of [](TKUITripRow), that is used at some point below 
[](TKUITripPlanner) in the components hierarchy, as shown in the following example:

```jsx
import {TKRoot, TKUITripPlanner} from 'tripkit-react';
import {multiTripsMockConfig} from '../components/TKDocHelper';

const config = {
    apiKey: 'TRIPGO_API_KEY', 
    TKUITripRow: {
        render: (props) =>
            <div style={{ 
                        padding: '10px 20px', 
                        borderTop: '1px solid lightgray', 
                        background: props.selected ? '#f3f2f2' : 'white'
                 }}
                 onClick={props.onClick}
                 onDoubleClick={props.onDetailClick}
            >
                {props.value.segments.map((segment, i) => segment.getAction() + " ")}
            </div>
    },
    ...multiTripsMockConfig
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <TKUITripPlanner/>
    </div>
</TKRoot>
```