import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

import GroupChat from '../screens/GroupChat';
import PrivateChatList from '../screens/PrivateChatList';

const Tab = createMaterialTopTabNavigator();

const ChatScreenTabs = ({route}) => {
  console.log('route ChatScreenTabs ', route);
  return (
    <Tab.Navigator screenOptions={{lazy: true}}>
      <Tab.Screen
        name="GroupChat"
        children={props => <GroupChat {...props} userInfo={route?.params} />}
      />
      <Tab.Screen
        name="PrivateChatList"
        children={props => (
          <PrivateChatList {...props} userInfo={route?.params} />
        )}
      />
    </Tab.Navigator>
  );
};

export default ChatScreenTabs;
