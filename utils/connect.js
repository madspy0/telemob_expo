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
import EventSource from "react-native-sse";

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

export function subscribe(props) {

    const es = new EventSource("http://192.168.33.102/.well-known/mercure?topic="+encodeURIComponent(props.username), {
        headers: new Headers({
            'Authorization': 'Bearer ' + props.userToken,
        }),
    });
    console.log('props!!!', es)
    es.addEventListener("open", (event) => {
        console.log("Open SSE connection.");
    });

    es.addEventListener("message", (event) => {
        console.log("New message event:", event.data, event);
    });

    es.addEventListener("error", (event) => {
        if (event.type === "error") {
            console.error("Connection error:", event.message);
        } else if (event.type === "exception") {
            console.error("Error:", event.message, event.error);
        }
    });

    es.addEventListener("close", (event) => {
        console.log("Close SSE connection.");
    });
}
