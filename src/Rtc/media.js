import Signal from './signal';
import config from '../config/config';
import {
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals,
} from 'react-native-webrtc';
import roomManage from '../room/room';

let media;
export default class Media {
    constructor(enterInfo) {
        this.enterInfo = enterInfo;
        let endpoint = 'ws://' + config.host + '/bbb-webrtc-sfu?sessionToken=' + enterInfo.sessionToken;
        this.videoSignal = new Signal({endpoint});
        this.pcs = {};
        this.pushCallbcak = null;
        this.localStream = null;
        this.videoSignal.on('signalMessage',(msg)=>{
            let query = `${msg.type}-${msg.role}-${msg.cameraId}`;
            let pc = this.pcs[query];
            if(!pc){
                console.error("error:can't find peerconnection for query:" + query);
                return;
            }
            switch (msg.id) {
                case 'startResponse':
                    console.log(`${query} set remote  sdp ` + msg.sdpAnswer);
                    pc.setRemoteDescription({"sdp":msg.sdpAnswer,"type":"answer"});
                    break;
                case 'iceCandidate':
                    console.log(`${query} add iceCandidate`);
                    pc.addIceCandidate(msg.candidate);
                    break;
                case 'playStart':
                    console.log(`${query} playstart!!!!!!`);
                    if(msg.role == "share"){
                        roomManage.method('userShareWebcam',msg.cameraId);
                        if(this.pushCallbcak){
                            this.pushCallbcak(this.localStream);
                        }
                    }
                    break;
                default:
                    break;
            }
        })
    }

    static getInstance(enterInfo){
        if(!media){
            media = new Media(enterInfo);;
        }else{
            media.enterInfo = enterInfo;
        }
        return media;
    }

    _generatorStartMsg(cameraId,sdpOffer,role,type){
        let enterInfo = this.enterInfo;
        return{
            cameraId,
            id:"start",
            meetingId:enterInfo.meetingID,
            role,
            type,
            sdpOffer,
            selfCameraId:enterInfo.internalUserID,
            voiceBridge:enterInfo.voicebridge,
        }
    }

    _generatorStopMsg(cameraId,role){
        return{ "type":"video",
                 role,
                "id":"stop",
                 cameraId}
    }

    _generatorCandidateMsg(cameraId,candidate,role,type){
        return{
            cameraId,
            id:"onIceCandidate",
            role,
            type,
            candidate,
        }
    }

    async push(callback) {
        try {
            const cameraId = this.enterInfo.internalUserID;
            const configuration = {'iceServers': [{'url': 'stun:139.159.203.208:3478'}]};
            const pc = new RTCPeerConnection(configuration);
            this.pushCallbcak = callback;
            console.log('start createOffer  === ');
            pc.onicecandidate = (event) => {
                console.log("onicecandidate event = " + event);
                if(event.candidate){
                    let msg = this._generatorCandidateMsg(cameraId,event.candidate,"share","video");
                    this.videoSignal.send(msg);
                }
            }
            pc.oniceconnectionstatechange = (state)=>{
                console.log("push niceconnectionstatechange state:" +state.currentTarget.iceConnectionState);
            }
            let isFront = true;
            await new Promise((resolve,reject)=>{
                mediaDevices.enumerateDevices().then(sourceInfos => {
                    console.log(sourceInfos);
                    let videoSourceId;
                    for (let i = 0; i < sourceInfos.length; i++) {
                        const sourceInfo = sourceInfos[i];
                        if (sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
                            videoSourceId = sourceInfo.deviceId;
                        }
                    }
                    mediaDevices.getUserMedia({
                        audio: true,
                        video: {
                            mandatory: {
                                minWidth: 500, // Provide your own width, height and frame rate here
                                minHeight: 300,
                                minFrameRate: 30
                            },
                            facingMode: (isFront ? "user" : "environment"),
                            optional: (videoSourceId ? [{sourceId: videoSourceId}] : [])
                        }
                    })
                        .then(stream => {
                            // Got stream!
                            console.log(' Got stream!  === stream = ' + stream);
                            pc.addStream(stream);
                            this.localStream = stream;
                            //this.pushCallbcak(this.localStream);
                            resolve();
                        })
                        .catch(error => {
                            console.log(' Got stream!  error === ' + JSON.stringify(error));
                            reject(error);
                            // Log error
                        });
                });
            })


            let option = {
                'OfferToSendAudio': 'true',
                'OfferToReceiveAudio': 'false',
                'OfferToSendVideo': 'true',
                'OfferToReceiveVideo': 'false',
                'DtlsSrtpKeyAgreement': 'true'
            }
            let desc = await pc.createOffer(option);
            //desc.sdp = desc.sdp.replace(/recvonly/g, 'sendonly');
            await pc.setLocalDescription(desc);
            let startMsg = this._generatorStartMsg(cameraId, desc.sdp, "share", "video");
            this.pcs[`video-share-${cameraId}`] = pc;
            console.log("pcs add pc " + `video-share-${cameraId}`);
            this.videoSignal.send(startMsg);
        }catch (e) {
            console.error("media push error:" + e);
        }

    }

    async pull(cameraId,callback){
        const configuration = {'iceServers': [{'url': 'stun:139.159.203.208:3478'}]};
        const pc = new RTCPeerConnection(configuration);
        pc.onicecandidate = (event)=>{
           // console.log("onicecandidate event = " + JSON.stringify(event.candidate));
            if(event.candidate){
                let msg = this._generatorCandidateMsg(cameraId,event.candidate,"viewer","video");
                this.videoSignal.send(msg);
            }
        }

        let option = {
            'OfferToSendAudio': 'false',
            'OfferToReceiveAudio': 'true',
            'OfferToSendVideo': 'false',
            'OfferToReceiveVideo': 'true',
            'DtlsSrtpKeyAgreement': 'true'
        }
        let desc = await  pc.createOffer(option);
        await   pc.setLocalDescription(desc);
        pc.oniceconnectionstatechange = (state)=>{
            console.log("oniceconnectionstatechange state:" +state.currentTarget.iceConnectionState);
        }

        pc.onaddstream = (event)=>{
            console.log("pullvideo on add remote stream url = " + event.stream.toURL() );
            callback(event.stream);
        }

        let startMsg = this._generatorStartMsg(cameraId,desc.sdp,"viewer","video");
        this.pcs[`video-viewer-${cameraId}`] = pc;
        console.log("pcs add pc " + `video-viewer-${cameraId}`);
        this.videoSignal.send(startMsg);
    }

    stop(cameraId){
        let key = Object.keys(this.pcs).forEach(key=>{return (key.split('-')[2] == cameraId)});
        if(key){
            let pc = this.pcs[key];
            let cameraId = key.split('-')[2];
            let role = key.split('-')[1];
            let msg = this._generatorStopMsg(cameraId,role);
            this.videoSignal.send(msg);
            roomManage.method('userUnshareWebcam',cameraId);
            pc.close();
            delete this.pcs[key];
        }
    }
}
