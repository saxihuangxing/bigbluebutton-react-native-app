import React , {Component} from 'react';
import { SafeAreaView, Button,View,Alert, FlatList, StyleSheet, Text, StatusBar } from 'react-native';
import roomApi from '../../room/room';
import { Navigation } from "react-native-navigation";
/*import {CirclesLoader, PulseLoader, TextLoader, DotsLoader} from 'react-native-indicator';*/
//import { aaaaaaa } from 'react-native-indicator';
import CirclesLoader from '../loading/loader/CirclesLoader';
import TextLoader from '../loading/loader/TextLoader';
import CommonStyle from '../../style/style';

const enterMeeting = (componentId,meeting) => {
    Navigation.push(componentId, {
        component: {
            name: 'LiveRoom',
            options: {
                topBar: {
                    title: {
                        text: meeting.meetingName
                    }
                }
            },
            passProps: {
                meeting,
            }
        },
    });
}

export default class RoomList extends Component {
    static displayName = 'RoomList';
    constructor(props) {
        super(props);
        this.componentId =  props.componentId;
        this.state = {
            meetings: [],
            isLoading:true,
        }
       // console.log("aaaaaaadd = " + aaaaaaa);
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentWillUpdate() {

    }
    async updateRoomData(){
        this.setState({isLoading:true})
        let meetings =  await roomApi.getAllMeetingInfos();
        this.setState({meetings:meetings,isLoading:false})
    }
    async componentDidMount() {
        this.updateRoomData();
      // console.log("meetings ===== " + JSON.stringify(meetings));
    }


    renderRoomList(meetings){
        const Item = ({meeting}) => (
            <View style={styles.item}>
                <Text style={styles.title}>{meeting.meetingName}</Text>
                <Button
                    onPress={()=>{enterMeeting(this.componentId,meeting)}}
                    title="进入"
                    color="#841584"
                />

            </View>
        );

        const renderItem = ({item}) => {
            return (
                <Item meeting={item}/>
            )
        };
        return(
            <FlatList
                data={meetings}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        )
    }

    renderLoading() {
        return (
            <View style={CommonStyle.center}>
                <CirclesLoader/>
                <TextLoader text="获取中"/>
            </View>
        );
    }


        render() {

        let meetings = this.state.meetings;
        let isLoading = this.state.isLoading;
        //console.log("meetings == " + JSON.stringify(meetings));
        return (
            <SafeAreaView style={styles.container}>
                <Button
                    onPress={() => {
                        this.updateRoomData();
                    }}
                    title="刷新房间"
                />
                {isLoading && this.renderLoading()}
                {!isLoading && this.renderRoomList(meetings)}

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

