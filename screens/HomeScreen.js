import * as React from 'react';
import {Button, Text, TextInput, View} from "react-native";
//import {URL, URLSearchParams} from 'react-native-url-polyfill';
import 'react-native-url-polyfill/auto';
import {styles} from "../assets/styles";
import {AuthContext} from '../AuthContext'

export function HomeScreen(props) {
    const {signOut} = React.useContext(AuthContext);
    const [message, setMesssage] = React.useState('');

    async function publish() {
        const url = `http://192.168.33.102/.well-known/mercure` //?data=${encodeURIComponent(message)}&topic=${encodeURIComponent('madspy0')}`
        const body = new URLSearchParams({data: message})
        body.append("topic", 'madspy0')
        let formData = new FormData();
        formData.append("data", message);
        formData.append("topic", 'madspy0')
        const opt = {method: "POST", body};
        opt.headers = {
            Authorization: `Bearer ${props.userToken}`,
            //    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        };
        // console.log(opt.body.get('topic'))
        await fetch(url,
            {
                method: 'POST', // или 'PUT'
                body,
                headers: new Headers({
                    'Authorization': 'Bearer ' + props.userToken,
                    //'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    //'Content-Length': 69,
                    //'Accept': 'application/json',
                    // 'Host': '192.168.1.138'
                }),
            },
            //  opt
        )
            .then(data => {
                console.log(data)
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
                onChangeText={setMesssage}
            />
            <Button title="Send" onPress={publish}/>
        </View>
    );
}
