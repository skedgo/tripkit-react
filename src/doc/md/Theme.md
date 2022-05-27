Theme can be customized through the ```theme``` property of the [SDK config](TKUIConfig), by passing a
[theme object](TKUITheme). This object is used to override the default theme, so you should just 
specify the properties you want to override.

Theme includes properties related to colors (primary, success, info, warning and error) and font type. 
It also includes style objects related to types of text (e.g. `textColorDisabled` and `textSizeCaption`),
and other general styles like card background, divider, etc. For more details 
see [theme object spec](TKUITheme).

Next is an example of customizing some theme properties:

```jsx
import {TKRoot, TKUITripPlanner} from 'tripkit-react';
import { commonConfig } from "doc-helper";
        
const config = {
    apiKey: 'TRIPGO_API_KEY',
    theme: {
        colorPrimary: '#9C27B0',
        cardBackground: {
            backgroundColor: '#f0fdff',
            borderRadius: '5px',
            border: '1px solid #9C27B0'
        },
        textColorDisabled: {
            color: '#35aba0'
        }    
    },
    ...commonConfig
};

<TKRoot config={config}>
    <div style={{height: '500px', position: 'relative'}}>
        <TKUITripPlanner/>
    </div>
</TKRoot>
```