import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Modal,
  View,
  Image,
  Dimensions,
  TextInput,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView
} from 'react-native';

import Reflux from 'reflux';

import { Button } from 'react-native-elements'

const { width, height } = Dimensions.get("window");

import { NavigationActions } from 'react-navigation'

// const homeReset = NavigationActions.reset({
//   index: 0,
//   actions: [
//     NavigationActions.navigate({ routeName: 'Home'})
//   ]
// })

import RNFetchBlob from 'react-native-fetch-blob'
// android
const FilePickerManager = require('NativeModules').FilePickerManager;
// ios
const DocumentPicker = require('react-native').NativeModules.RNDocumentPicker;


export default class LoginScreen extends Reflux.Component {

  static navigationOptions = {
    header:{
      visible: false
    }
  }

  constructor(props) {
    super(props);
    this.state = {}
    this.handleUsernamePassword = this.handleUsernamePassword.bind(this);
  }

  handleUsernamePassword(){
    
    this.props.navigation.dispatch( NavigationActions.navigate( { routeName: 'LoginUsernamePassword' }) );

    return;



    // RNFetchBlob.fs.readFile(RNFetchBlob.fs.asset("blank.pdf"),'base64')
    // .then((base64Str) => {
    //   alert('GOT FILE');
    //   // this.sendEnvelope(account, base64Str);
    // })
    // .catch((error)=>{
    //   alert('Failed: ' + error)
    // })


    // return;



    var url = 'https://bphc.hrsa.gov/archive/technicalassistance/resourcecenter/managementandfinance/samplepaymentagreementform.pdf';

    url = RNFetchBlob.fs.asset('blank.pdf');
    // alert(url);



      // send http request in a new thread (using native code)
    // RNFetchBlob.fetch('GET', RNFetchBlob.wrap(response.uri), {
    RNFetchBlob.fs.readFile(RNFetchBlob.fs.asset('blank.pdf'),'base64')
    .then((base64Str) => {
      this.sendEnvelope(account, base64Str);
    });

    return;

      DocumentPicker.show({
          filetype: ['public.content','public.data','public.image'],
        },(error,url) => {
          alert(url);
        });



    return;


      RNFetchBlob.fs.readFile(RNFetchBlob.wrap(RNFetchBlob.fs.asset('blank.pdf')))

      .then((res) => {

        alert('data ok');
        return;

        let base64Str = res.base64()

        if(base64Str && base64Str.length){
          alert('GOT IT! ' + base64Str.length)

        } else {
          alert("failed base64Str");
        }

      })

      .catch((errorMessage, statusCode) => {
        
        alert('Failed fetching: ' + errorMessage);
      })

  }

  render() {


    console.log('-----LOGIN RENDER!----');
    return (
      <View style={styles.outerContainer}>
        <View style={styles.markWrap}>
          <Image source={require('./../../../resources/KDV8iF7koYBi4iIiEgwPvZAREREJBgDFhEREZFgDFhEREREgjFgEREREQnGgEVEREQkGAMWERERkWAMWERERESCMWARERERCcaARURERCQYAxYRERGRYAxYRERERIIxYBEREREJxoBFREREJBgDFhEREZFgDFhEREREgjFgEREREQnGgEVEREQkGAMWERERkWAMWERERESCMWARERERCcaARURERCQYAxYRERGRYAxYRERERIIxYBERERE.png')} style={styles.mark} resizeMode="contain" />
        </View>
        <View style={styles.container}>
          <Text style={styles.title}>eSigning on Mobile</Text>
          <Text></Text>
          <Button color="#000000" backgroundColor="#ffc820" title="Log In" onPress={this.handleUsernamePassword} />
          <Text></Text>
          <Text></Text>
          <Text></Text>
          <Text style={styles.subtitle}>Powered by DocuSign</Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1
  },
  markWrap: {
    flex: 1,
    paddingVertical: 30,
  },
  mark: {
    width: null,
    height: null,
    flex: 1,
  },
  background: {
    width,
    height,
  },
  title: {
    fontSize: 18,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center'
  },
  wrapper: {
    paddingVertical: 30,
  },
  inputWrap: {
    flexDirection: "row",
    marginVertical: 10,
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#CCC"
  },
  iconWrap: {
    paddingHorizontal: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    height: 20,
    width: 20,
  },
  input: {
    color: '#111',
    flex: 1,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#448aff",
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
  },
  forgotPasswordText: {
    color: "#D8D8D8",
    backgroundColor: "transparent",
    textAlign: "right",
    paddingRight: 15,
  },
  signupWrap: {
    backgroundColor: "transparent",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  accountText: {
    color: "#D8D8D8"
  },
  signupLinkText: {
    color: "#555",
    marginLeft: 5,
  }
});