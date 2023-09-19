import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TextInput, Pressable, Image} from 'react-native';

import {
  MessageRepository,
  MessageContentType,
  UserRepository,
  subscribeTopic,
  getSubChannelTopic,
  SubChannelRepository,
} from '@amityco/ts-sdk';

const disposers: Amity.Unsubscriber[] = [];

const subscribeSubChannel = (subChannel: Amity.SubChannel) =>
  disposers.push(subscribeTopic(getSubChannelTopic(subChannel)));

const PrivateChat = ({navigation, route}) => {
  const {item, userId} = route?.params || {};
  const [message, onChangeMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getSubChannel();
    return () => {
      disposers.forEach(fn => fn());
    };
  }, []);

  const getSubChannel = async () => {
    const _subChannelRepository = await SubChannelRepository.getSubChannel(
      item?.defaultSubChannelId,
      ({data: subChannel, loading, error}) => {
        console.log('subChannel ', subChannel);
        if (subChannel) observeMessage(subChannel);
      },
    );
    _subChannelRepository();
  };

  const observeMessage = channel => {
    console.log('observeMessage subChannelId  ', channel);
    // observeMessages(channelId, result => {
    //   runQuery(query, result => {
    //     if (result.data != undefined) {
    //       messageArray = [];
    //       for (let data of result.data) {
    //         messageArray.push({
    //           _id: data?.messageId,
    //           text: data.data['text'],
    //           createdAt: new Date(),
    //           user: {
    //             _id: data?.userId,
    //             name: data?.userId,
    //             avatar: 'https://placeimg.com/140/140/any',
    //           },
    //         });
    //       }
    //     }
    //     messageArray.reverse();

    //     console.log('messageArray ', messageArray);
    //   });
    // });

    const unsubscribe = MessageRepository.getMessages(
      {subChannelId: channel?.subChannelId},
      ({data: messages, onNextPage, hasNextPage, loading, error}) => {
        console.log('messages ', messages);
        setMessages(messages);
        //setMessages(messages);
        /*
         * this is only required if you want real time updates for messages
         * in the collection
         *
         */
        subscribeSubChannel(channel as Amity.SubChannel);
      },
    );

    /*
     * if you only wish to get a collection or list of paginated messages without
     * any real time updates you can unsubscribe immediately after you call the
     * collection.
     * ex: unsubscribe()
     */
    disposers.push(unsubscribe);
  };

  const sendPrivateChat = async () => {
    const {data: userData} = await UserRepository.getUserByIds([userId]);

    const data1 = JSON.stringify({
      username: userData?.[0]?.displayName,
      profileUrl: userData?.[0]?.avatarCustomUrl,
    });
    console.log('data1 ', data1);
    const textMessage = {
      subChannelId: item?.defaultSubChannelId,
      dataType: MessageContentType.TEXT,
      data: {
        text: message,
      },
      tags: ['tag1', 'tag2'],
      metadata: {
        data: data1,
      },
    };
    console.log('Send ');
    const {data} = await MessageRepository.createMessage(textMessage);
    console.log('Send done');
    onChangeMessage('');
  };

  return (
    <View style={{flex: 1, paddingHorizontal: 20}}>
      <View style={{flex: 1, marginTop: 12}}>
        <FlatList
          data={messages}
          renderItem={({item, index}) => {
            const metaData =
              item?.metadata?.data && JSON.parse(item.metadata.data);
            return (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginVertical: 10,
                }}>
                <Image
                  source={{uri: metaData?.profileUrl}}
                  style={{height: 30, width: 30, borderRadius: 15}}
                />
                <View style={{marginLeft: 20}}>
                  <Text>{metaData?.username}</Text>
                  <Text>{item?.data?.text}</Text>
                </View>
              </View>
            );
          }}
          keyExtractor={(item, index) => String(index)}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginVertical: 12,
        }}>
        <TextInput
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
          }}
          onChangeText={onChangeMessage}
          value={message}
          placeholder="Message ........."
        />
        <Pressable
          style={{
            height: 40,
            marginLeft: 12,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'green',
            borderRadius: 5,
            paddingHorizontal: 10,
          }}
          onPress={sendPrivateChat}>
          <Text
            style={{
              color: 'white',
              fontSize: 14,
              letterSpacing: 1,
              fontWeight: '500',
            }}>
            Send
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default PrivateChat;
