import React, {Component} from 'react';
import {
    View,
    Text,
} from 'react-native';
import room from '../../../src/room/room';
export default class Room extends Component {
    static displayName = 'EventList';
    constructor(props) {
        super(props);
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentDidMount() {
        console.log("join Room did Mount");
        room.join("demomeeting","huangxin");
    };

    setEventSearchParam(param) {
    }

    onChangeEventPage = (currentPage) => {
    };


    render() {
        return(
            <View>
                <Text>
                    进入房间
                </Text>
            </View>
        )
    }

}
