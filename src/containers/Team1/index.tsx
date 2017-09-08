import React from "react";
import { Breadcrumb } from 'antd';

import { CounterDisplay } from '../../components/CounterDisplay/';
import { CounterControl } from '../../components/CounterControl/';

import { connect } from 'react-redux';
import { increment, decrement } from './actions';
import { RouteComponentProps } from 'react-router-dom';

import style from './style.scss';

interface Team1OwnProps extends RouteComponentProps<any> { }  // properties directed pass in throw react tag

interface Team1StateProps  { dispatch?: any, counter?: number}  // properties from redux store

interface Team1DispatchProps { counterPlusOne?: Function, counterMinusOne?: Function }  // dispatch functions from redux store

interface Team1State { }  // component own properties

@(connect<Team1StateProps, Team1DispatchProps & Team1OwnProps, Team1State>  (
    (state: any) => (
        {
            counter: state.teamCounter.count as number
        }
    ),
    (dispatch: any) => (
        {
            counterPlusOne: () => {
                console.log("call from 'mapDispatchToProps'");
                dispatch(increment(1));
            },
            counterMinusOne: () => {
                console.log("call from 'mapDispatchToProps'");
                dispatch(decrement(1));
            }
        }
    )
) as any)
export default class Team1 extends React.Component<Team1StateProps & Team1DispatchProps & Team1OwnProps, Team1State> {

    constructor() {
        super();
    }

    componentDidMount() {
        document.getElementById('content_display_area').style.height = ((document.getElementsByClassName('ant-layout-content')[0] as HTMLElement).offsetHeight - 42).toString() + "px";
    }

    render() {
        const { dispatch, counter, counterPlusOne, counterMinusOne } = this.props;
        return (
            <div>
                <Breadcrumb style={{ margin: '12px 0' }}>
                    <Breadcrumb.Item>Team</Breadcrumb.Item>
                    <Breadcrumb.Item>Team 1</Breadcrumb.Item>
                </Breadcrumb>
                <div id="content_display_area" style={{ padding: 24, background: '#fff', minHeight: 360 }} className={style.test}>
                    <CounterDisplay counter={counter}/>
                    <CounterControl onPlusClick={counterPlusOne} onMinusClick={counterMinusOne}/>
                </div>
            </div>

        );
    }
}
