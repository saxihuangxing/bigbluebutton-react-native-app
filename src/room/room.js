import axios from 'axios';
import roomUtil from '../util/roomUtil';
import config from '../config/config';
import fxp from "fast-xml-parser";
//import  Meteor,{withTracker, MeteorListView} from './react-native-meteor';
import Meteor, {withTracker, MeteorListView} from './react-native-meteor/src/Meteor';
import Media from "../Rtc/media";
import COLLECTION from "./constant";
class Room {
    constructor(){
        this.commonParams = null;
        this.joined = false;
        this.enterInfo = null;

    }

    async getAllMeetingInfos(){
      let url = await roomUtil.generatorApiUrl('getMeetings');
      let res = await axios.get(url);
      let  meetingInfos  =  fxp.parse(res.data);
      if(meetingInfos.response.returncode != "SUCCESS" || meetingInfos.response.messageKey == 'noMeetings'){
        return [];
      }
      let meetings =  meetingInfos.response.meetings.meeting;
      return meetings;
    }

  async join(meetingID, fullName) {
    let url = await roomUtil.getJoinUrl(meetingID, fullName);
    try {
      let res;
      console.log('join room url: ' + url);
      res = await axios.get(url);
      let meetingInfo;
      if(typeof res.data == 'object'){
        meetingInfo = res.data;
      }else{
        meetingInfo  =  fxp.parse(res.data);
      }
      let sessionToken = meetingInfo.response.session_token;
      let enterUrl  = await roomUtil.generatorApiUrl("enter", {sessionToken});
      res = await axios.get(enterUrl);
      let enterInfo  = res.data.response;
      enterInfo.sessionToken = sessionToken;
      let params = {"meetingId":enterInfo.meetingID,"requesterUserId":enterInfo.internalUserID,"requesterToken":enterInfo.authToken,
        "logoutURL":"https://106.52.36.117",sessionToken,"fullname":enterInfo.fullname,"externUserID":enterInfo.externUserID,
        "confname":enterInfo.confname};
      this.enterInfo = enterInfo;
      Meteor.call("validateAuthToken",params);
        Meteor.subscribe(COLLECTION.CURRENT_USER,params);
        Meteor.subscribe(COLLECTION.USERS,params);
        Meteor.subscribe(COLLECTION.VOICEUSERS,params);
      this.commonParams = params;
      this.joined = true;
      let media =  Media.getInstance(enterInfo);
      return media;
     // media.pull("",callback);

    } catch (e) {
      console.log('join room catch error: ' + e);
    }
  }

  method(name,param){
      Meteor.call(name,this.commonParams,param);
  }
}
let room = new Room();
export default room;
