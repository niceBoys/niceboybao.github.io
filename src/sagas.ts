import { all, fork } from 'redux-saga/effects';
import saga from './containers/Team3/sagas';
import team4Saga from './containers/Team4/sagas';

export default function* rootSaga() {
    yield all([
        fork(saga),
        // fork(team4Saga)
    ]);
};
