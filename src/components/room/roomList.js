import React , {Component} from 'react';
import { SafeAreaView, Button,View,Alert, FlatList, StyleSheet, Text, StatusBar } from 'react-native';
import roomApi from '../../room/room';
import { Navigation } from "react-native-navigation";



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
    static displayName = 'EventList';

    constructor(props) {
        super(props);
        this.componentId =  props.componentId;
        this.state = {
            meetings: [],
        }
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentWillUpdate() {

    }
    async updateRoomData(){
        let meetings =  await roomApi.getAllMeetingInfos();
        this.setState({meetings:meetings})
    }
    async componentDidMount() {
        this.updateRoomData();
      // console.log("meetings ===== " + JSON.stringify(meetings));
    }




    render() {

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
        let meetings = this.state.meetings;
        //console.log("meetings == " + JSON.stringify(meetings));
        return (
            <SafeAreaView style={styles.container}>
                <Button
                    onPress={() => {
                        this.updateRoomData();
                    }}
                    title="刷新房间"
                />
                <FlatList
                    data={meetings}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                />
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

