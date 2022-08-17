import * as React from 'react';
import {View, Text, FlatList} from 'react-native'
import {useEffect, useState} from "react";
import {TouchableOpacity} from "react-native-gesture-handler";
import {AuthContext} from '../AuthContext'
import {styles} from '../assets/styles'
import {HomeScreen} from '../screens/HomeScreen'
//import {getList} from '../utils/connect'

export function ListScreen(props) {
    //console.log(props)
    const {companion} = React.useContext(AuthContext);
    const [list, setList] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetch('http://192.168.33.102:81/api/users',
                {
                    method: 'GET',
                    headers: new Headers({
                        'Authorization': 'Bearer ' + props.userToken
                    })
                })
            const json = await data.json()
            await console.log(json)
            setList(json)
        }
        fetchData().catch(console.error);
    }, [])
    //getList(props.userToken).then(r=>console.log(r))
    const Item = ({item, onPress, backgroundColor, textColor}) => (
        <TouchableOpacity onPress={onPress} style={styles.item}>
            <Text style={styles.title}>{item.title}</Text>
        </TouchableOpacity>
    );

    const renderItem = ({item}) => {
        return (<Item item={item} onPress={() => {
        companion(item.title)
        //props.navigation.navigate('Home', { userToken: props.userToken })
        }} />)
    };
    return (
        <View>
            <FlatList
                data={list}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    )
}
