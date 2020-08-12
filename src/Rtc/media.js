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

export default class Media {
    constructor(enterInfo) {
        this.enterInfo = enterInfo;
        let endpoint = 'ws://' + config.host + '/bbb-webrtc-sfu?sessionToken=' + enterInfo.sessionToken;
        this.videoSignal = new Signal({endpoint});
        this.pcs = {};
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
                    break;
                default:
                    break;
            }
        })
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

    _generatorCandidateMsg(cameraId,candidate,role,type){
        return{
            cameraId,
            id:"onIceCandidate",
            role,
            type,
            candidate,
        }
    }

    async push() {
        const configuration = {'iceServers': [{'url': 'stun:139.159.203.208:3478'}]};
        const pc = new RTCPeerConnection(configuration);
        console.log('start createOffer  === ');
        pc.onicecandidate = (event)=>{
            console.log("onicecandidate event = " + event);
        }
        let isFront = true;
        mediaDevices.enumerateDevices().then(sourceInfos => {
            console.log(sourceInfos);
            let videoSourceId;
            for (let i = 0; i < sourceInfos.length; i++) {
                const sourceInfo = sourceInfos[i];
                if(sourceInfo.kind == "videoinput" && sourceInfo.facing == (isFront ? "front" : "environment")) {
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
                })
                .catch(error => {
                    console.log(' Got stream!  error === ' + JSON.stringify(error));
                    // Log error
                });
        });

        let option = {
            'OfferToSendAudio': 'true',
            'OfferToReceiveAudio': 'false',
            'OfferToSendVideo': 'true',
            'OfferToReceiveVideo': 'false',
            'DtlsSrtpKeyAgreement': 'true'
            }
        let desc = await  pc.createOffer(option);
        await   pc.setLocalDescription(desc);
        let startMsg = this._generatorStartMsg(this.enterInfo.internalUserID,desc.sdp,"share","video");
        this.pcs[`video-share-${this.enterInfo.internalUserID}`] = pc;
        console.log("pcs add pc " + `video-share-${this.enterInfo.internalUserID}`);
       this.videoSignal.send(startMsg);

    }

    async pull(cameraId,callback){
        cameraId = "w_l3cqvbmuex6s";
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
            console.log("oniceconnectionstatechange state:" + JSON.stringify(state));
        }

        pc.onaddstream = (event)=>{
            console.log("pullvideo on add remote stream " );
            callback(event.stream);
        }

        let startMsg = this._generatorStartMsg(cameraId,desc.sdp,"viewer","video");
        this.pcs[`video-viewer-${cameraId}`] = pc;
        console.log("pcs add pc " + `video-viewer-${cameraId}`);
        this.videoSignal.send(startMsg);
    }
}
