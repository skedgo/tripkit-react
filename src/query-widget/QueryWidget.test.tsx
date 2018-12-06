import * as React from 'react';
import * as ReactDOM from 'react-dom';
import QueryWidget from './QueryWidget';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<QueryWidget />, div);
  ReactDOM.unmountComponentAtNode(div);
});
