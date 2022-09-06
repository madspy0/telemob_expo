import * as React from 'react';
import {View, Text, FlatList, Button} from 'react-native'
import {useEffect, useState} from "react";
import {TouchableOpacity} from "react-native-gesture-handler";
import {AuthContext} from '../AuthContext'
import {styles} from '../assets/styles'
import jwt_decode from "jwt-decode";
import {host} from "../global";

//import {getList} from '../utils/connect'

export function ListScreen(props) {
    //console.log('props in list screen ', props)
    const {companion, signOut} = React.useContext(AuthContext);
    const [list, setList] = useState([])
    const [username, setUsername] = useState(null);
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch(`${host}:8000/api/users`,
                {
                    method: 'GET',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + props.userToken
                    })
                })
            const json = await data.json()
          //  await console.log(json)
            setList(json)
        }
        fetchData().catch(console.error);
        setUsername(jwt_decode(props.userToken).mercure.payload.user)
    }, [])
    //getList(props.userToken).then(r=>console.log(r))
    const Item = ({item, onPress,}) => (
        <TouchableOpacity onPress={onPress} style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({item}) => {
        return (<Item item={item} onPress={() => {
            companion(item.title)
            //props.navigation.navigate('Home', { userToken: props.userToken })
        }}/>)
    };
    return (
        <View>
            <FlatList
                data={list.filter(item => item.title !== username)}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
            <Button title="Sign out" onPress={signOut}/>
        </View>
    )
}
