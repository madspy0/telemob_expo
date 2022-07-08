import * as React from 'react';
import {Button, Text, TextInput, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import * as SecureStore from 'expo-secure-store';
import {styles} from './assets/styles'
const AuthContext = React.createContext();

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
        return result
    } else {
        // alert('No values stored under that key.');
        return null
    }
}

function SplashScreen() {
    return (
        <View>
            <Text>Loading...</Text>
        </View>
    );
}

function HomeScreen(props) {
    const {signOut} = React.useContext(AuthContext);
    console.log(props.userToken)
    return (
        <View style={styles.container}>
            <Text>Signed in!</Text>
            <Button title="Sign out" onPress={signOut}/>
        </View>
    );
}

function SignInScreen() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const {signIn} = React.useContext(AuthContext);

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <Button title="Sign in" onPress={() => signIn({username, password})}/>
        </View>
    );
}

const Stack = createStackNavigator();

export default function App({navigation}) {
    const [state, dispatch] = React.useReducer(
        (prevState, action) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
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
        const bootstrapAsync = async () => {
            let userToken;

            try {
                // Restore token stored in `SecureStore` or any other encrypted storage
                // userToken = await SecureStore.getItemAsync('userToken');
                userToken = await getValueFor('userToken')
            } catch (e) {
                // Restoring token failed
                console.log(e)
            }

            // After restoring token, we may need to validate it in production apps

            // This will switch to the App screen or Auth screen and this loading
            // screen will be unmounted and thrown away.
            dispatch({type: 'RESTORE_TOKEN', token: userToken});
        };

        bootstrapAsync();
    }, []);

    const authContext = React.useMemo(
        () => ({
            signIn: async (data) => {
                // In a production app, we need to send some data (usually username, password) to server and get a token
                // We will also need to handle errors if sign in failed
                // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
                // In the example, we'll use a dummy token

                const url = 'http://192.168.33.102/api/login';
                fetch(url,
                    {
                        method: 'POST', // или 'PUT'
                        body: JSON.stringify({'username': data.username, 'password': data.password}),
                        headers: new Headers({
                            'Content-Type': 'application/json',
                            // 'Host': '192.168.1.138'
                        }),
                    },
                )
                    .then((resp) => resp.json())
                    .then((r) => {
                        if (r.token) {
                            save('userToken', r.token)
                            dispatch({type: 'SIGN_IN', token: r.token});
                        } else {
                            alert(r.error)
                        }
                    })
            },
            signOut: () => {
                remove('userToken')
                dispatch({type: 'SIGN_OUT'})
            },
            signUp: async (data) => {
                // In a production app, we need to send user data to server and get a token
                // We will also need to handle errors if sign up failed
                // After getting token, we need to persist the token using `SecureStore` or any other encrypted storage
                // In the example, we'll use a dummy token

                dispatch({type: 'SIGN_IN', token: 'dummy-auth-token'});
            },
        }),
        []
    );

    return (
        <AuthContext.Provider value={authContext}>
            <NavigationContainer>
                <Stack.Navigator>
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
                    ) : (
                        // User is signed in
                        <Stack.Screen name="Home">
                            {props => <HomeScreen {...props} userToken={state.userToken}/>}
                        </Stack.Screen>
                        /*                                      component={HomeScreen}
                                                />*/
                    )}
                </Stack.Navigator>
            </NavigationContainer>
        </AuthContext.Provider>
    );
}
