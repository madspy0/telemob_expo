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
import jwt_decode from "jwt-decode";
import {host} from "../global";

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
    const fetchData = async () => {
        const data = await fetch(`${host}:8000/api/users`,
            {
                method: 'GET',
                headers: new Headers({
                    'Authorization': 'Bearer ' + userToken
                })
            })
        const json = await data.json()
        await console.log('from getlist', json)
    }
    fetchData().catch(console.error);
}

export function subscribe(userToken) {

    let token = jwt_decode(userToken)
    console.log(token)
    const es = new EventSource(`${global.host}/.well-known/mercure?topic=${encodeURIComponent(token.mercure.payload.user)}`, {
        headers: {
            'Authorization': 'Bearer ' + userToken,
        },
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

export async function answer(offerDescription) {
    let peerConnection = new RTCPeerConnection();
    try {
        let sessionConstraints = {
            mandatory: {
                OfferToReceiveAudio: true,
                OfferToReceiveVideo: true,
                VoiceActivityDetection: true
            }
        }
        console.log('offer',offerDescription)
        offerDescription=JSON.parse(offerDescription)

        // Use the received offerDescription
        const offerDescription = new RTCSessionDescription();
        await peerConnection.setRemoteDescription(offerDescription);

        const answerDescription = await peerConnection.createAnswer(sessionConstraints);
        await peerConnection.setLocalDescription(answerDescription);

        // Send the answerDescription back as a response to the offerDescription.
    } catch (err) {
        // Handle Errors
    }
}
