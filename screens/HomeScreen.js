import * as React from 'react';
import {Button, Text, TextInput, View} from "react-native";
import {styles} from "../assets/styles";
import {AuthContext} from '../AuthContext'
import EventSource from "react-native-sse";
import {useEffect} from "react";

export function HomeScreen(props) {

    const {signOut} = React.useContext(AuthContext);
    const [message, setMessage] = React.useState('');

    useEffect(()=>{
        const es = new EventSource("http://192.168.33.102/.well-known/mercure?topic=madspy0",{
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
    },[])

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

    return (
        <View style={styles.container}>
            <Text>Signed in!</Text>
            <Button title="Sign out" onPress={signOut}/>
            <TextInput
                placeholder="message"
                value={message}
                onChangeText={setMessage}
            />
            <Button title="Send" onPress={publish}/>
        </View>
    );
}
