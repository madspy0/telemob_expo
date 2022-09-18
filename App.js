import * as React from 'react';
import {Button, Text, TextInput, View, Alert} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import {styles} from './assets/styles'
import {HomeScreen} from './screens/HomeScreen'
import {ListScreen} from './screens/ListScreen'
import {AuthContext} from './AuthContext'
import jwt_decode from "jwt-decode";
import 'expo-dev-client';
//import {useSafeAreaInsets, SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';
import EventSource, {EventSourceListener} from "react-native-sse";
import NativeDevSettings from "react-native/Libraries/NativeModules/specs/NativeDevSettings";

import {host} from "./global";
import {answer} from "./utils/connect";
//export const AuthContext = React.createContext();

let es = null;


async function save(key, value) {
    await SecureStore.setItemAsync(key, value);
}

async function remove(key) {
    await SecureStore.deleteItemAsync(key)
}

async function getValueFor(key) {
    let result = await SecureStore.getItemAsync(key);
    if (result) {
        // alert("🔐 Here's your value 🔐 \n" + result);
        let t = jwt_decode(result)
        if (Date.now() >= t.exp * 1000) {
            return null;
        }
        return {token: result, username: t.mercure.payload.user}
    } else {
        // alert('No values stored under that key.');
        return null
    }
}

function subscribe(t) {
    {
        console.log('tt', t)
        if (t !== null) {
            let userToken = t.token
            let username = t.username
            //const url = new URL(`http://192.168.33.102/.well-known/mercure?topic=${username}`);
            //await url.searchParams.append("topic", username);
            if (es===null) {
            es = new EventSource(`${host}/.well-known/mercure?topic=${username}`, {
                /*                    headers: {
                                        Authorization: {
                                            toString: function () {
                                                return "Bearer " + userToken;
                                            },
                                        },
                                    },*/
                headers: {
                    'Authorization': `Bearer ${userToken}`,
                },
            });
            console.log(es)
            es.addEventListener("open", (event) => {
                console.log("Open SSE connection.");
            });

            es.addEventListener("message", (event) => {
                console.log("New message event:", event.data);
                let offer = JSON.parse(event.data)
                if (('desc' in offer) && (offer.desc.type === 'offer')) {
                    //Alert.alert(offer.username)
                    console.log('offer.desc ',offer.desc)
                    const ans = async () => answer(offer.desc)
                    ans().catch(console.error);
                }
            });

            es.addEventListener("error", (event) => {
                if (event.type === "error") {
                    console.error("Connection error:", event.message);
                    if (event.xhrStatus === 401) {
                        // ошибка авторизации
                        NativeDevSettings.reload;
                    }
                } else if (event.type === "exception") {
                    console.error("Error:", event.message, event.error);
                }
            });

            es.addEventListener("close", (event) => {
                console.log("Close SSE connection.");
            });
            /*                return () => {
                                es.removeAllEventListeners();
                                es.close();
                            };*/
        }
    }
    }
}

function SplashScreen() {
    return (
        <View>
            <Text>Loading...</Text>
        </View>
    );
}


function SignInScreen() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const {signIn} = React.useContext(AuthContext);
    //const insets = useSafeAreaInsets();

    return (

        <View style={{
            flex: 1,
            backgroundColor: '#338feb',
            alignItems: 'center',
            justifyContent: 'center',
            /*                paddingTop: insets.top,
                            paddingBottom: insets.bottom,*/
        }}>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <Button title="Sign in" onPress={() => signIn({username, password})}/>
            <StatusBar style="auto"/>
        </View>

    );
}

const Stack = createStackNavigator();

export default function App({navigation}) {
    const [state, dispatch] = React.useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
                    console.log(`type restore token ${action.type}`)
                    return {
                        ...prevState,
                        userToken: action.token,
                        isLoading: false,
                    };
                case 'SIGN_IN':
                    return {
                        ...prevState,
                        isSignout: false,
                        userToken: action.token,
                    };
                case 'SIGN_OUT':
                    return {
                        ...prevState,
                        isSignout: true,
                        userToken: null,
                    };
                case 'COMPANION':
                    console.log(`type restore token ${action.type}`)
                    return {
                        ...prevState,
                        isSignout: false,
                        companion: action.companion,
                    };
                case 'LIST':
                    console.log(`type restore token ${action.type}`)
                    return {
                        ...prevState,
                        isSignout: false,
                        companion: null,
                    };
            }
        },
        {
            isLoading: true,
            isSignout: false,
            userToken: null,
        }
    );

    React.useEffect(() => {
        // Fetch the token from storage then navigate to our appropriate place
        const bootstrapAsync = () => {
            let userToken = null;
            try {
                // Restore token stored in `SecureStore` or any other encrypted storage
                // userToken = await SecureStore.getItemAsync('userToken');
                getValueFor('userToken')
                    .then((t) => {
                        if (t != null) {
                            userToken = t.token;
                            subscribe(t)
                        }
                    })
                    .then(() => dispatch({type: 'RESTORE_TOKEN', token: userToken}))
            } catch (e) {
                // Restoring token failed
                console.log(e)
            }
            // After restoring token, we may need to validate it in production apps

            // This will switch to the App screen or Auth screen and this loading
            // screen will be unmounted and thrown away.
        };

        bootstrapAsync();

    }, []);

    const authContext = React.useMemo(
        () => ({
            signIn: (data) => {
                // In a production app, we need to send some data (usually username, password) to server and get a token
                // We will also need to handle errors if sign in failed
                // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
                // In the example, we'll use a dummy token
                const url = `http://192.168.1.138:8000/api/login`;
                fetch(url,
                    {
                        method: 'POST', // или 'PUT'
                        body: JSON.stringify({'username': data.username, 'password': data.password}),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                            // 'Host': '192.168.33.102'
                        }),
                    },
                )
                    .then((resp) => resp.json())
                    .then((r) => {
                        if (r.token) {
                            save('userToken', r.token).then(() => subscribe(r)).then(dispatch({
                                type: 'SIGN_IN',
                                token: r.token
                            }))
                            ;
                        } else {
                            alert(r.error)
                        }
                    })
            },
            signOut: () => {
                if (es !== null) {
                    es.close()
                }
                remove('userToken').then(() => dispatch({type: 'SIGN_OUT'}))

            },
            signUp: async (data) => {
                // In a production app, we need to send user data to server and get a token
                // We will also need to handle errors if sign up failed
                // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
                // In the example, we'll use a dummy token

                dispatch({type: 'SIGN_IN', token: 'dummy-auth-token'});
            },
            companion: async (data) => {
                console.log('in data!!', data);
                dispatch({type: 'COMPANION', companion: data})
            },
            list: async () => {
                console.log('in list!!!!!!!!!!!!!');
                //await getList(state.userToken)
                dispatch({type: 'LIST'})
            }
        }),
        []
    );

    return (
        <AuthContext.Provider value={authContext}>

            <NavigationContainer>
                <Stack.Navigator screenOptions={{
                    headerShown: false,
                    headerStatusBarHeight: 0, // Header had increased size with SafeArea for some reason (https://github.com/react-navigation/react-navigation/issues/5936)
                    headerStyle: {
                        elevation: 0, // remove shadow on Android
                        shadowOpacity: 0, // remove shadow on iOS
                    },
                    navigationOptions: {
                        header: null
                    },
                    cardStyle: {
                        backgroundColor: "transparent",
                    }
                }}>
                    {state.isLoading ? (
                        // We haven't finished checking for the token yet
                        <Stack.Screen name="Splash" component={SplashScreen}/>
                    ) : state.userToken == null ? (
                        // No token found, user isn't signed in
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{
                                title: 'Sign in',
                                // When logging out, a pop animation feels intuitive
                                animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                            }}
                        />
                    ) : state.companion == null ? (
                        // User is signed in
                        /*                            <Stack.Screen name="Home">
                                                        {props => <HomeScreen {...props} userToken={state.userToken}/>}
                                                    </Stack.Screen>*/
                        <Stack.Screen name="List">
                            {props => <ListScreen {...props} userToken={state.userToken}/>}
                        </Stack.Screen>
                        /*                                      component={HomeScreen}
                                                />*/
                    ) : (
                        <Stack.Screen name="Home">
                            {props => <HomeScreen {...props} userToken={state.userToken} companion={state.companion}/>}
                        </Stack.Screen>
                    )}
                </Stack.Navigator>
            </NavigationContainer>

        </AuthContext.Provider>
    );
}
