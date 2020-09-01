Theme can be customized through ```theme``` property of [SDK config](/#/Customization?id=tkuiconfig), by passing a
[theme object](/#/Customization?id=tkuitheme). This object is used to override the default theme, so you should just 
specify the theme properties you want to override.

Theme includes properties related to colors (primary, success, info, warning and error) and font type. 
It also includes style objects related to types of text (e.g. 'textColorDisabled' and 'textSizeCaption'),
and other general styles like card background, divider, etc. For more details 
see [theme object spec below](/#/Customization?id=tkuitheme).

Next is an example customizing some theme properties:

```jsx
import {TKRoot, TKUITripPlanner} from '../src/index.tsx';
        
const config = {
    apiKey: '790892d5eae024712cfd8616496d7317', 
    isDarkDefault: false,
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
    }
};

<TKRoot config={config}>
    <div style={{height: '500px'}}>
        <TKUITripPlanner/>
    </div>
</TKRoot>
```