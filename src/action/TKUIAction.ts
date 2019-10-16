import {Observable} from 'rxjs';

interface TKUIAction {
    render: () => JSX.Element,
    handler: () => boolean,
    actionUpdate?: Observable<void>
}

export default TKUIAction;