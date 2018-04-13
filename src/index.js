import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import style from './styles/style.css';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
