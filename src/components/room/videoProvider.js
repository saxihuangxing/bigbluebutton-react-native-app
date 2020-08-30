import React, {Component} from 'react';
import {
    View,
    Text,
} from 'react-native';
import {RTCView} from 'react-native-webrtc';
import room from '../../../src/room/room';
import Meteor, {  MeteorListView } from '../../room/react-native-meteor/src/Meteor';
import config from '../../config/config';
import COLLECTION from '../../room/constant';

Meteor.connect('ws://' + config.host + '/html5client/sockjs/311/8iaejabm/websocket'); //do this only once


export  class VideoProvider extends Component {
    static displayName = 'EventList';
    constructor(props) {
        console.log("VideoProvider construct");
        super(props);
        this.media = props.media;
        this.selfId = props.selfId;
        this.subUserIds = [];
        this.state = {
            rtcViews:Array(4).fill({streamUrl:"",userId:null,use:false}),
        }
    }

    onClose = () => {
    };

    componentWillMount() {
    }

    componentWillUpdate({users}) {
       // console.log("componentWillUpdate usres = " + JSON.stringify(users));
        if(!users || !this.media){
            return;
        }
        const usersSharingIds = users.map(u => u.userId);
        const usersConnected = this.subUserIds;

        const usersToConnect = usersSharingIds.filter(id => !usersConnected.includes(id) && id != this.selfId);
        const usersToDisconnect = usersConnected.filter(id => !usersSharingIds.includes(id));

        usersToDisconnect.forEach(id => {
            this.media.stop(id);
            for(let i =0;i<this.subUserIds.length;i++){
                if(this.subUserIds[i] === id){
                    this.subUserIds.splice(i,1);
                }
            }
            this._releaseRtcView(id);
        });
        usersToConnect.forEach(id => {
            let rtcView = this._getValidRtcView();
            if(!rtcView){
                console.info(`can't find display area,don't pull ${id}`)
                return;
            }
            rtcView.userId = id;
            rtcView.use = true;
            this.subUserIds.push(id);
            this.media.pull(id,(stream)=>{
                rtcView.streamUrl = stream.toURL();
                console.log("add streamUrl == " + JSON.stringify(rtcView));
                this.setState({rtcViews:this.state.rtcViews});
            })
        });
    }

    componentWillUnmount(){
        let workingIds = this.state.rtcViews.map(rtcView => {
            if(rtcView.use) {
                return rtcView.userId;
            }else{
                return false;
            }
        });
        workingIds.forEach((id)=>{
            this._releaseRtcView(id);
            if(this.media) {
                this.media.stop(id);
            }
        })
    }

    _getRtcViewById(userId){
        let rtcViews =   this.state.rtcViews;
        for(let key in rtcViews){
            if(rtcViews[key].userId == userId){
                return rtcViews[key];
            }
        }
        return null;
    }

    _getValidRtcView(){
        let rtcViews =   this.state.rtcViews;
        for(let key in rtcViews){
            if(!rtcViews[key].use){
                return rtcViews[key];
            }
        }
        return null;
       // return  this.state.rtcViews.filter( (rtcView)=> !rtcView.use);
    }

    _releaseRtcView(userId){
        let rtcView =   this._getRtcViewById(userId);
        if(rtcView) {
            rtcView.userId = "";
            rtcView.streamUrl = "";
            rtcView.use = false;
        }
    }

    async componentDidMount() {
        //this.media = await room.join("demomeeting","huangxin");
        //this.selfId = room.commonParams.internalUserID;
        let userId = this.selfId;
        let rtcView = this._getValidRtcView();
        rtcView.userId = userId;
        rtcView.use = true;
        this.media.push((stream) =>{
            rtcView.streamUrl = stream.toURL();
            console.log("add streamUrl == " + JSON.stringify(rtcView));
            this.setState({rtcViews:this.state.rtcViews});
        });

        //,(stream)=>{
        //             console.log("stream add callback "+stream.toURL());
        //             this.setState({stream:stream})}

    };

    setEventSearchParam(param) {
    }

    onChangeEventPage = (currentPage) => {
    };


    render() {
        let rtcViews =  this.state.rtcViews;
        console.log(`render rtcViews === ${JSON.stringify(rtcViews)}`);
        return(
            <View  style = {{flexDirection: 'column',backgroundColor:'green',width:'100%',height:'100%',}}>
                <View style = {{flexDirection: 'row',flex:1,backgroundColor:'yellow',width:'100%',height:'50%'}}>
                    <RTCView style={{flex:1,width:'50%',height:'100%'}} streamURL={rtcViews[0].streamUrl} objectFit={'cover'} zOrder={2} />
                    <RTCView style={{flex:1,width:'50%',height:'100%'}} streamURL={rtcViews[1].streamUrl} objectFit={'cover'} zOrder={2} />
                </View>
                <View style = {{flexDirection: 'row',flex:1,backgroundColor:'blue',width:'100%',height:'50%'}}>
                    <RTCView style={{flex:1,width:'50%',height:'100%'}} streamURL={rtcViews[2].streamUrl} objectFit={'cover'} zOrder={2} />
                    <RTCView style={{flex:1,width:'50%',height:'100%'}} streamURL={rtcViews[3].streamUrl} objectFit={'cover'} zOrder={2} />
                </View>
            </View>
        )
    }

}

export default Meteor.withTracker(params => {
    return {
        users: Meteor.collection(COLLECTION.USERS).find({has_stream:true,connectionStatus:'online'}),
    };
})(VideoProvider);
