import React , {Component} from 'react';
import { SafeAreaView, Button,View,Alert, FlatList, StyleSheet, Text, StatusBar } from 'react-native';
import roomApi from '../room/room';
import VideoProvider from '../components/room/videoProvider';
import DotsLoader from '../components/loading/loader/DotsLoader';
import CommonStyle from '../style/style';

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
            this.selfId = roomApi.commonParams.requesterUserId;
            this.setState({login:'success'});
        }
    }

    renderStatus(){
        const login = this.state.login;
        if(login === 'loading'){
            return(
                <View style={CommonStyle.center}>
                 <DotsLoader/>
                </View>
            )
        }else if(login === 'success'){
            return(<VideoProvider media = {this.media} selfId = {this.selfId} />)
        }else if(login === 'failed'){
            return(
                <View style={CommonStyle.center}>
                    <Text>加入房间失败</Text>)
                </View>)
        }else{
            return(
                <View style={CommonStyle.center}>
                 <Text>错误的状态</Text>
                </View>)
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
        width: '100%',
        height: '100%',
        backgroundColor:'red'
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

