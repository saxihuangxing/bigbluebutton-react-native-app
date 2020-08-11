import {sha1} from 'react-native-sha1';
import config from '../config/config';


const checkSumUrl =  async (url) =>{
    let encryptData =  url.split(config.app)[1].replace("?","")+config.secret;
    let checkum = await sha1(encryptData);
    checkum = checkum.toLowerCase();
    let newUrl;
    if(url.indexOf("?")>0)
       newUrl= url + `&checksum=${checkum}`;
    else
        newUrl= url + `?checksum=${checkum}`;
    return newUrl;
};

export default checkSumUrl;
