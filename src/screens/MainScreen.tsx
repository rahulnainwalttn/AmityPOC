import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, TextInput, Pressable, Text, Image} from 'react-native';

import {
  Client,
  disableCache,
  API_REGIONS,
  UserRepository,
  subscribeTopic,
  getUserTopic,
} from '@amityco/ts-sdk';

import {profileImages} from '../dummydata';

// Only required to do once in the lifetime of the application
// Client.createClient(
//   'b0e8bb5268def9304c378d48545d10ded2008db3bc343d2f',
//   API_REGIONS.SG,
// ); // SG is the default
// disableCache();

// /*
//  *  Check the session handler section in session state core concept for full details
//  */
// const sessionHandler: Amity.SessionHandler = {
//   sessionWillRenewAccessToken(renewal: Amity.AccessTokenRenewal) {
//     // for details on other renewal methods check session handler
//     renewal.renew();
//   },
// };

// (async () => {
//   const isConnected = await Client.login(
//     {
//       userId: 'my-user-id',
//       displayName: 'my-display-name', // optional
//       authToken: '', // only required if using secure mode
//     },
//     sessionHandler,
//   );
// })();

const MainScreen = ({navigation}) => {
  const [username, onChangeUsername] = useState('');
  const [userId, onChangeUserId] = useState('');
  const [chatWithUserId, setChatWithUserId] = useState('');
  const profileImage = useMemo(() => {
    return profileImages[Math.round(Math.random() * 10)];
  }, []);

  // useEffect(() => {
  //   createClient();
  // }, []);

  const createClient = async () => {
    const sessionHandler: Amity.SessionHandler = {
      sessionWillRenewAccessToken(renewal: Amity.Renewal) {
        renewal.renew();
        /*
         * If using an auth token
         *
         * try {
         *  renew.renewWithAuthToken(authToken)
         * } catch() {
         *  sdk will try to renew again at a later time
         *
         *  renew.unableToRetrieveAuthToken()
         * }
         */
      },
    };
    Client.createClient(
      'b0e8bb5268def9304c378d48545d10ded2008db3bc343d2f',
      API_REGIONS.SG,
    ); // SG is the default
    //disableCache();

    let isConnected = await Client.login(
      {userId: userId, displayName: username},
      sessionHandler,
    );
    if (isConnected) {
      console.log('isConnected ', isConnected);
      const {data: updatedUser} = await UserRepository.updateUser(userId, {
        displayName: username,
        description: 'My name is John',
        metadata: {},
        avatarCustomUrl: profileImage,
      });
      console.log('updatedUser ', updatedUser);
      navigation.navigate('ChatScreenTabs', {username, userId, chatWithUserId});
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', paddingHorizontal: 20}}>
      <Image
        source={{uri: profileImage}}
        style={{height: 100, width: 100, borderRadius: 50, alignSelf: 'center'}}
      />
      <TextInput
        style={{
          height: 40,
          margin: 12,
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
        }}
        onChangeText={onChangeUsername}
        value={username}
        placeholder="Enter user name"
      />
      <TextInput
        style={{
          height: 40,
          margin: 12,
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
        }}
        onChangeText={onChangeUserId}
        value={userId}
        placeholder="Enter user id"
      />
      <TextInput
        style={{
          height: 40,
          margin: 12,
          borderWidth: 1,
          padding: 10,
          borderRadius: 5,
        }}
        onChangeText={setChatWithUserId}
        value={chatWithUserId}
        placeholder="Chat with user id"
      />
      <Pressable
        style={{
          height: 40,
          margin: 12,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'green',
          borderRadius: 5,
        }}
        onPress={createClient}>
        <Text
          style={{
            color: 'white',
            fontSize: 14,
            letterSpacing: 1,
            fontWeight: '500',
          }}>
          Create Profiler
        </Text>
      </Pressable>
    </View>
  );
};

export default MainScreen;
