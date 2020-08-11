import config from '../config/config';
import encript  from './encript';
import axios from "axios";

class RoomUtil  {
    async getJoinUrl(meetingID,fullName){
        let url = `${config.serverUrl}api/join?meetingID=${meetingID}&fullName=${fullName}&redirect=false&password=mp`;
        url = await encript(url);
        return url;
    }

     async generatorApiUrl(method,paramObj){
        let queryStr = "";
        if(paramObj){
            Object.keys(paramObj).forEach((key)=>{
                if(queryStr === ""){
                    queryStr = `?${key}=${paramObj[key]}`;
                }else{
                    queryStr += `&${key}=${paramObj[key]}`;
                }
            });
        }
        let url = config.serverUrl +  "api/" + method + queryStr;
        url =  await encript(url);
        return url;
    }
}

let roomUtil = new RoomUtil()

export default roomUtil;
