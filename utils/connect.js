import {
    ScreenCapturePickerView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStream,
    MediaStreamTrack,
    mediaDevices,
    registerGlobals
} from 'react-native-webrtc';
import {useState} from "react";

async function call(localStream) {
    const configuration = {
        "iceServers": [{"url": "stun:stun.l.google.com:19302"}]
    };
    const pc = new RTCPeerConnection(configuration);
    pc.createOffer(undefined).then(desc => {
        pc.setLocalDescription(desc).then(() => {
            // Send pc.localDescription to peer
            console.log(desc)
        });
    });

    pc.onicecandidate = function (event) {
        // send event.candidate to peer
    };

// also support setRemoteDescription, createAnswer, addIceCandidate, onnegotiationneeded, oniceconnectionstatechange, onsignalingstatechange, onaddstream
}

export async function getList(userToken) {
    const [list, setList] = useState([])
    await fetch('http://192.168.33.102:81/api/users',
        {
            method: 'GET',
            headers: new Headers({
                'Authorization': 'Bearer ' + userToken
            })
        })
        .then((resp) => resp.json())
        .then(r => {
            setList(r);
        })
    return list
}

