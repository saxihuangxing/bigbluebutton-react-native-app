import React, {Component} from 'react';
import {
    View,
    Text,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import room from '../../../src/room/room';
export default class Room extends Component {
    static displayName = 'EventList';
    constructor(props) {
        super(props);
        this.state = {
            stream:null,
        }
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentDidMount() {
        console.log("join Room did Mount");
        room.join("demomeeting","huangxin",(stream)=>{
            console.log("stream add callback "+stream.toURL());
            this.setState({stream:stream})});
    };

    setEventSearchParam(param) {
    }

    onChangeEventPage = (currentPage) => {
    };


    render() {
        let streamid = this.state.stream == null?"":this.state.stream.toURL();
        console.log("joinRomm rendering streamid=" + streamid);
        return(
            <View>
                <Text>
                    进入房间
                </Text>
                <RTCView style={{flex:1,width:100,height:50}} streamURL={this.state.stream == null?"":this.state.stream.toURL()} objectFit={'contain'} zOrder={2} />

            </View>
        )
    }

}
