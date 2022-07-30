import * as React from 'react';
import {Button, PermissionsAndroid, Text, TextInput, View} from "react-native";
import {styles} from "../assets/styles";
import {AuthContext} from '../AuthContext'
import EventSource from "react-native-sse";
import {useEffect, useState} from "react";

import {
    RTCView,
    mediaDevices,
    MediaStream,
} from 'react-native-webrtc';
import SafeAreaView from "react-native/Libraries/Components/SafeAreaView/SafeAreaView";

export function HomeScreen(props) {

    const {signOut} = React.useContext(AuthContext);
    const [message, setMessage] = React.useState('');
    const [stream, setStream] = useState(null);

    /*    useEffect(() => {
            const es = new EventSource("http://192.168.33.102/.well-known/mercure?topic=madspy0", {
                headers: new Headers({
                    'Authorization': 'Bearer ' + props.userToken,
                }),
            });

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

        }, [])*/

    async function publish() {
        let params = {
            'data': message,
            'topic': 'madspy0'
        }
        let formBody = [];
        for (const property in params) {
            const encodedKey = encodeURIComponent(property);
            const encodedValue = encodeURIComponent(params[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        await fetch('http://192.168.33.102/.well-known/mercure',
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
            if (!stream) {
                /*            let s;
                            try {
                                s = await mediaDevices.getUserMedia(
                                    {
                                        video: true
                                    }
                                );
                                console.log(s)
                                const devices = await mediaDevices.enumerateDevices();

                                const videoSourceId = devices.find(
                                    (device) => device.kind === 'videoinput' && device.facing === "front",
                                );
                                console.log(videoSourceId)
                                setStream(s);
                            } catch (e) {
                                console.error(e);
                            }*/
                const isFrontCamera = true;
                const devices = await mediaDevices.enumerateDevices();

                const facing = isFrontCamera ? 'front' : 'environment';
                const videoSourceId = devices.find(
                    (device) => device.kind === 'videoinput' && device.facing === facing,
                );
                const facingMode = isFrontCamera ? 'user' : 'environment';
                const constraints = {
                    // audio: true,
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
                setStream(newStream)
                console.log(newStream.toURL())
            }
        }
    ;
    const stop = () => {
        console.log('stop');
        if (stream) {
            stream.release();
            setStream(null);
        }
    };
    return (
        <SafeAreaView style={styles.rtcContainer}>
                {
                    stream &&
                    <RTCView
                        streamURL={stream.toURL()}
                        objectFit="cover"
                        zOrder={3}
                        style={styles.stream}/>
                }

            <View zOrder={2} style={styles.buttonbar}>
                <Button title="Sign out" onPress={signOut}/>
                <TextInput
                    placeholder="message"
                    value={message}
                    onChangeText={setMessage}

                />
                <Button title="Send" onPress={publish}/>
                <Button
                    title="Start"
                    onPress={start}/>
                <Button
                    title="Stop"
                    onPress={stop}/>
            </View>

        </SafeAreaView>
    );
}
