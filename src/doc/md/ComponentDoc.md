```jsx noeditor
import TKDocComponent from "../components/TKDocComponent";
import {tKDocConfig} from "../TKDocConfig";
const compDocConfig = tKDocConfig["__COMPONENT__"];
compDocConfig ? <TKDocComponent compName={"__COMPONENT__"} docConfig={compDocConfig}/> : null
```