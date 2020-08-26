import React , {Component} from 'react';
import { SafeAreaView, Button,View,Alert, FlatList, StyleSheet, Text, StatusBar } from 'react-native';
import roomApi from '../room/room';
import VideoProvider from '../components/room/videoProvider';

export default class LiveRoom extends Component {
    static displayName = 'LiveRoom';

    constructor(props) {
        super(props);
        this.meeting = props.meeting;
        this.state = {
            login:'loading', //loading,success,failed
        }
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentWillUpdate() {

    }

    async componentDidMount() {
        if(this.state.login == 'loading'){
            this.media = await roomApi.join(this.meeting.meetingID,"huangxin");
            this.selfId = roomApi.commonParams.internalUserID;
            this.setState({login:'success'});
        }
    }

    renderStatus(){
        const login = this.state.login;
        if(login === 'loading'){
            return(
                <Text>正在登录</Text>
            )
        }else if(login === 'success'){
            console.log("videoProvider == " + VideoProvider);
            return(<VideoProvider media = {this.media} selfId = {this.selfId} />)
        }else if(login === 'failed'){
            return(<Text>加入房间失败</Text>)
        }else{
            return(<Text>错误的状态</Text>)
        }
    }

    render() {

        return (
            <SafeAreaView style={styles.container}>
                {this.renderStatus()}
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
    },
    item: {
        backgroundColor: '#f9c2ff',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        fontSize: 24,
    },
});

