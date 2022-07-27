import * as React from 'react';
import {Button, Text, TextInput, View} from "react-native";
import {styles} from "../assets/styles";
import {AuthContext} from '../AuthContext'
import EventSource from "react-native-sse";
import {useEffect, useState} from "react";

import {mediaDevices, RTCView, registerGlobals, Permissions} from 'react-native-webrtc';

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

    const start = async () => {
        console.log('start');
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
                        setStream(stream)
                    })
                    .catch(error => {
                        // Log error
                        console.log(error)
                    });
            });

        }
    };
    const stop = () => {
        console.log('stop');
        if (stream) {
            stream.release();
            setStream(null);
        }
    };
    return (
        <View style={styles.container}>
            <Text>Signed in!</Text>
            <Button title="Sign out" onPress={signOut}/>
            {
                stream &&
                <RTCView
                    streamURL={stream.toURL()}
                    style={styles.stream}/>
            }
            <Button
                title="Start"
                onPress={start}/>
            <Button
                title="Stop"
                onPress={stop}/>
            <TextInput
                placeholder="message"
                value={message}
                onChangeText={setMessage}
            />
            <Button title="Send" onPress={publish}/>
        </View>
    );
}
