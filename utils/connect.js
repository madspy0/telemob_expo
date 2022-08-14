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

export async function call(localStream) {
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
