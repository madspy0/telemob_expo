import {StyleSheet} from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#c8b84d',
        alignItems: 'center',
        justifyContent: 'center',
    },
    rtcContainer: {
        flex: 1,
        backgroundColor: 'gray',
        /*        alignContent: 'flex-start',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',*/
    },
    input: {
/*        height: 40,
        width: 300,*/
        display: 'flex',
        flexDirection: 'row',
        width: '40%',
        fontSize: 20,
        padding: 5,
        backgroundColor: 'white',
        marginBottom: 5,
        borderWidth: 1,
        borderColor: '#333',
    },
    /*    inputContainer: {
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: {
                width: 1,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,
            elevation: 4,
        },*/
    stream: {
        flex: 1,
        height: 'auto',
        width: '100%',
        /*        backgroundColor: 'white',
              alignContent: 'flex-start',
                 justifyContent: 'flex-start',
                 alignItems: 'flex-start',*/
    },
    buttonbar: {
        bottom: 5,
        left: 5,
        position: 'absolute',
        flex: 1,
        flexDirection: 'row',
        alignContent: 'space-between',
        /*  flexWrap: 'wrap'*/
    },
    error: {textAlign: 'center', height: 17.5},
});
