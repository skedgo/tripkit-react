import * as React from 'react';
import * as ReactDOM from 'react-dom';
import QueryWidget from './QueryWidget';
it('renders without crashing', function () {
    var div = document.createElement('div');
    ReactDOM.render(React.createElement(QueryWidget, null), div);
    ReactDOM.unmountComponentAtNode(div);
});
//# sourceMappingURL=QueryWidget.test.js.map