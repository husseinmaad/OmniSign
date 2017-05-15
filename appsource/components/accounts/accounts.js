import React, { Component } from 'react';
import {
  Platform,
  ActionSheetIOS,
  StyleSheet,
  Text,
  Switch,
  Image,
  View,
} from 'react-native';

import { List, ListItem } from 'react-native-elements'

import { NavigationActions } from 'react-navigation'

import Toast from 'react-native-root-toast';




import ActionSheet from 'react-native-actionsheet'

import RNFetchBlob from 'react-native-fetch-blob'

const FilePickerManager = require('NativeModules').FilePickerManager;

const DocumentPicker = require('react-native').NativeModules.RNDocumentPicker;


const CANCEL_INDEX = 0

const options = [ 'Cancel', 'Medical Agreement']

const title = 'Select Your File'

export default class AccountsScreen extends React.Component {
  static navigationOptions = {
    title: 'Accounts'
  }

  constructor(props) {
    super(props);
    this.state = {
      accounts: []
    }
    this.handlePress = this.handlePress.bind(this);
    this.handleASPress = this.handleASPress.bind(this)
    this.sendEnvelope = this.sendEnvelope.bind(this);

  }

  componentDidMount(){


    var authApi = new docusign.AuthenticationApi();

    var loginOps = {};
    loginOps.api_password = 'true';
    loginOps.include_account_id_guid = 'true';


    this.setState({
      trying: true
    });

    authApi.login(loginOps, (err, loginInfo, response) => {
      if(err){
        alert('ERROR! ' + JSON.stringify(response.status));
        return;
      }

      this.setState({
        accounts: loginInfo.loginAccounts
      });

    });
  }

  handlePress(account, i, event){
      
    this.setState({account});  
    this.ActionSheet.show()

  }

  handleASPress(i){

    switch(i){
      case 1:

        this.useRemoteUrlFile(this.state.account);
        break;
    }

  }

  useRemoteUrlFile(account){

    var url = 'https://bphc.hrsa.gov/archive/technicalassistance/resourcecenter/managementandfinance/samplepaymentagreementform.pdf';
    RNFetchBlob.fetch('GET', url, {
      })

      .then((res) => {

        let base64Str = res.base64();

        if(base64Str && base64Str.length){
          this.sendEnvelope(account, base64Str);
        } else {
          alert("failed base64Str");
        }

      })

      .catch((errorMessage, statusCode) => {
        
        alert('Failed fetching: ' + errorMessage);
      })

  }

  useAssetFile(account, assetPath){

    RNFetchBlob.fs.readFile(RNFetchBlob.fs.asset(assetPath),'base64')
    .then((base64Str) => {
      this.sendEnvelope(account, base64Str);
    });

  }

  useChooseFile(account){

 
      DocumentPicker.show({
          filetype: ['public.content','public.data','public.image'],
        },(error, data) => {
          if(error){
            return;
          }
          var uri = data.uri;
          if(uri.indexOf('file://') === 0){
            uri = uri.substr(7);
          }
          this.fetchLocalFile(account, uri);
        });

  }

  fetchLocalFile(account, filePath){

    setTimeout(() => {
      RNFetchBlob.fs.readFile(filePath,'base64')
      .then((base64Str) => {
        this.sendEnvelope(account, base64Str);
      })
      .catch((errorMessage, statusCode) => {

        alert('Failed fetching: ' + errorMessage);
      })

    },250);

  }

  sendEnvelope(account, base64Data){

 

    var accountId = account.accountId;
    var baseUrl = account.baseUrl;
    var accountDomain = baseUrl.split("/v2");

    var apiClient = docusign.Configuration.default.getDefaultApiClient();
    apiClient.setBasePath(__config.esign_api_host);

    var envDef = {};
    envDef.emailSubject = "Medical agreement signed";
    envDef.status = "sent";
    envDef.recipients = {};

    var signers = [];
    var signer1 = {};
    var signer1tabs = {};
    var signer1SignhereTabs = [];
    var signer1signHereTab = {};
    signer1.email = account.email;
    signer1.name = "RN User";
    signer1.recipientId = "1";
    signer1.clientUserId = "1";
    signer1signHereTab.xPosition = "160";
    signer1signHereTab.yPosition = "445";
    signer1signHereTab.documentId = "1";
    signer1signHereTab.pageNumber = "1";

    signer1SignhereTabs.push(signer1signHereTab);
    signer1tabs.signHereTabs = signer1SignhereTabs;

    signer1.tabs = signer1tabs;
    signers.push(signer1);

    envDef.recipients.signers = signers;

    var documents = [];
    var document1 = {};
    document1.documentId = "1";
    document1.name = "blank1.pdf";
    document1.documentBase64 = base64Data;
    documents.push(document1);

    envDef.documents = documents;

    var params = {
      cdseMode: 'false',
      mergeRolesOnDraft: 'false'
    }


    Toast.show('Sending');


    var envelopesApi = new docusign.EnvelopesApi();

    envelopesApi.createEnvelope(accountId, {'envelopeDefinition': envDef}, (err, envelopeInfo, response) => {
      if (err) {
        return next(err);
      }
      console.log('EnvelopeSummary: ' + JSON.stringify(envelopeInfo));

      var envelopeId = envelopeInfo.envelopeId;

      var returnUrl = {};
      returnUrl.returnUrl = 'https://www.docusign.com/devcenter';
      returnUrl.authenticationMethod = 'email';
      returnUrl.email = account.email;
      returnUrl.userName = 'RN User';
      returnUrl.clientUserId = '1';
      returnUrl.recipientId = '1';

      Toast.show('Getting Signing View');

      var envelopesApi = new docusign.EnvelopesApi();
      envelopesApi.createRecipientView(accountId, envelopeId, {recipientViewRequest:returnUrl}, (err, returnUrlResponse, response) => {
        if(err){
          alert('Error: ' + response.status);
          console.error(err);
          return;
        }


        this.props.navigation.dispatch( NavigationActions.navigate({ routeName: 'EmbeddedSigning', params: {
          url: returnUrlResponse.url, // this is the url we need to browse for pdf local view
          returnUrl: returnUrl.returnUrl
        }}) );

        console.log(returnUrlResponse.url);

      });

    })

  }

  render() {
    var self = this;

    return (
      <View>
        <List>
          {
            this.state.accounts.map((item, i) => (
              <ListItem
                key={i}
                onPress={(event) => self.handlePress(item,i,event)}
                title={item.name}
                subtitle={`${item.userName}: (${item.email})`}
                leftIcon={(item.isDefault == 'true') ? {
                  name: 'star'
                }:{
                  name: 'star-border'
                }}
                value={i}
              />
            ))
          }
        </List>
        <ActionSheet
          ref={o => this.ActionSheet = o}
          title={title}
          options={options}
          cancelButtonIndex={CANCEL_INDEX}
          onPress={this.handleASPress}
        />
      </View>
    )
 }

}

