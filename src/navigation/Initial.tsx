import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import ChatScreenTabs from './ChatScreenTabs';
import MainScreen from '../screens/MainScreen';
import PrivateChat from '../screens/PrivateChat';

const Stack = createNativeStackNavigator();

const Initial = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainScreen"
          component={MainScreen}
          options={{title: 'Create Profile'}}
        />
        <Stack.Screen
          name="ChatScreenTabs"
          component={ChatScreenTabs}
          options={{title: 'Chats', headerBackTitleVisible: false}}
        />
        <Stack.Screen
          name="PrivateChat"
          component={PrivateChat}
          options={{title: 'Private Chat', headerBackTitleVisible: false}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Initial;
