import 'react-hot-loader/patch';
import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { Provider, connect } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { AppContainer } from 'react-hot-loader';
import { createBrowserHistory} from 'history';
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux';
import Es6Promise from 'es6-promise';
import './styles/app.css';

import { GlobalDefinitions } from './GlobalDefinitions';
import createReducer from  './reducers';
import { Hello } from './components/Hello/';
import { RootContainer}  from './containers/RootContainer/';
import rootSaga from './sagas';

Es6Promise.polyfill();

// create the saga middleware
const sagaMiddleware = createSagaMiddleware();
(window as GlobalDefinitions).sagaMiddleware = sagaMiddleware;

// Create a history
const history = createBrowserHistory({ basename: '/www'});

// Create react-router-redux middleware
const reduxRouterMiddleware = routerMiddleware(history);

const composeEnhancers = (window as GlobalDefinitions).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
    createReducer(undefined),
    composeEnhancers( applyMiddleware(sagaMiddleware, reduxRouterMiddleware) )
);
(window as GlobalDefinitions).store = store;
sagaMiddleware.run(rootSaga);

// init asyncReducers holder on window
(window as GlobalDefinitions).asyncReducers = {};

ReactDOM.render(
    <AppContainer>
        <Provider store={store}>
            <ConnectedRouter history={history}>
                <RootContainer/>
            </ConnectedRouter>
        </Provider>
    </AppContainer>,
    document.getElementById("rootElement")
);

// ReactDOM.render(
//         <RootLayout/>,
//     document.getElementById("rootElement")
// );

// if (module.hot) {
//     module.hot.accept('./components/RootLayout.tsx', () => {
//         const NextRootContainer = require('./components/RootLayout').default;
//         ReactDOM.render(
//             <NextRootContainer/>,
//             document.getElementById("rootElement")
//         );
//     });
// }
