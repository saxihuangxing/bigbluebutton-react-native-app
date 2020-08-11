import axios from 'axios';
import roomUtil from '../util/roomUtil';
import config from '../config/config';
import fxp from "fast-xml-parser";
//import  Meteor,{withTracker, MeteorListView} from './react-native-meteor';
import Meteor, {withTracker, MeteorListView} from './react-native-meteor/src/Meteor';
import Media from "../Rtc/media";
Meteor.connect('ws://' + config.host + '/html5client/sockjs/311/8iaejabm/websocket'); //do this only once
const test = true;
class Room {
  async join(meetingID, fullName) {
  /*  if(test){
      let url = await roomUtil.generatorApiUrl("getMeetings", {});
      let res = await axios.get(url);
      let  meetingInfos  =  fxp.parse(res.data);
      if(meetingInfos.response.returncode != "SUCCESS"){
          return false;
      }
      let meet =  meetingInfos.response.meetings.meeting.filter(iterator=>iterator.meetingName == "demomeeting");
      if(!meet && meet.length > 0){
        return false;
      }
      meetingID = meet[0].meetingID;
      console.log("meetingID = " + meetingID);
    }*/

    let url = await roomUtil.getJoinUrl(meetingID, fullName);
    try {
      let res;
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
      Meteor.call("validateAuthToken",params);
      let media = new Media(enterInfo);
      media.push();
    } catch (e) {
      console.log('join room catch error: ' + e);
    }
  }
}
let room = new Room();
export default room;
