import * as React from 'react';
import {Button, PermissionsAndroid, Text, TextInput, View} from "react-native";
import {styles} from "../assets/styles";
import {AuthContext} from '../AuthContext'
import {useEffect, useState} from "react";
import {StatusBar} from 'expo-status-bar';
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
import jwt_decode from "jwt-decode";
import {host} from "../global";


export function HomeScreen(props) {

    const {signOut, list} = React.useContext(AuthContext);
    const [message, setMessage] = React.useState('');
    const [localStream, setLocalStream] = useState(null);


    async function publish(companion, desc) {
        let params = {
            'data': JSON.stringify({'desc':desc, 'username':jwt_decode(props.userToken).mercure.payload.user}),
            'topic': companion
        }
        let formBody = [];
        for (const property in params) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(params[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        await fetch(`${host}/.well-known/mercure`,
            {
                method: 'POST', // или 'PUT'
                body: formBody,
                headers: new Headers({
                    'Authorization': 'Bearer ' + props.userToken,
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                }),
            },
            //  opt
        )
            .then(data => {
                setMessage('')
            })
            .catch(e => console.log(e));
    }

    async function call(localStream) {
        const configuration = {
            "iceServers": [{"url": "stun:stun.l.google.com:19302"}]
        };
        const pc = new RTCPeerConnection(configuration);
        pc.createOffer(undefined).then(desc => {
            pc.setLocalDescription(desc).then(() => {
                // Send pc.localDescription to peer
                console.log(desc)
                publish(props.companion, desc)
            });
        });

        pc.onicecandidate = function (event) {
            // send event.candidate to peer
        };

// also support setRemoteDescription, createAnswer, addIceCandidate, onnegotiationneeded, oniceconnectionstatechange, onsignalingstatechange, onaddstream
    }

    const requestCameraPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Cool Photo App Camera Permission",
                    message:
                        "Cool Photo App needs access to your camera " +
                        "so you can take awesome pictures.",
                    buttonNeutral: "Ask Me Later",
                    buttonNegative: "Cancel",
                    buttonPositive: "OK"
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log("You can use the camera");
            } else {
                console.log("Camera permission denied");
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const start = async () => {
        console.log('start');
        await requestCameraPermission()
        if (!localStream) {
            const isFrontCamera = true;
            const devices = await mediaDevices.enumerateDevices();

            const facing = isFrontCamera ? 'front' : 'environment';
            const videoSourceId = devices.find(
                (device) => device.kind === 'videoinput' && device.facing === facing,
            );
            const facingMode = isFrontCamera ? 'user' : 'environment';
            const constraints = {
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 500,
                        minHeight: 300,
                        minFrameRate: 30,
                    },
                    facingMode,
                    optional: videoSourceId ? [{sourceId: videoSourceId}] : [],
                },
            };
            const newStream = await mediaDevices.getUserMedia(constraints);
            await setLocalStream(newStream)
            // console.log(newStream)
            await call(newStream)
        }
    }
    const stop = () => {
        console.log('stop');
        if (localStream) {
            localStream.release();
            setLocalStream(null);
        }
    };

    const toggleLocalStream = () => {
        if (localStream) {
            stop();
        } else {
            start()

        }
    }

    return (
        <>
            <View style={styles.rtcContainer}>
                {
                    localStream ?
                        <RTCView
                            streamURL={localStream.toURL()}
                            objectFit="cover"
                            style={{
                                flex: 1,
                                alignItems: 'stretch',
                                justifyContent: 'center',
                            }}/>
                        : <Text style={styles.title}>Call to {props.companion}</Text>
                }
                {/* use light text instead of dark text in the status bar to provide more contrast with a dark background */}
                <StatusBar style="auto"/>
            </View>
            <View style={styles.buttonbar}>
                <Button title="Sign out" onPress={signOut}/>
                <TextInput
                    placeholder="message"
                    value={message}
                    onChangeText={setMessage}
                />
                <Button title="Send" onPress={publish}/>
                <Button
                    title={localStream ? "OFF" : 'ON'}
                    color={localStream ? "red" : 'blue'}
                    onPress={toggleLocalStream}/>
                <Button title="List" onPress={list}/>
            </View>

        </>

    );
}
