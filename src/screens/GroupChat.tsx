import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, TextInput, Pressable, Image} from 'react-native';

import {
  ChannelRepository,
  MessageRepository,
  MessageContentType,
  observeMessages,
  runQuery,
  createQuery,
  queryMessages,
  subscribeTopic,
  getSubChannelTopic,
  SubChannelRepository,
  UserRepository,
} from '@amityco/ts-sdk';

const channelId = '64c8b59e000d6e6f381a61b5';
const disposers: Amity.Unsubscriber[] = [];
const subscribedChannels: Amity.Channel['channelId'][] = [];

const GroupChat = ({userInfo = {}}) => {
  const {userId, username} = userInfo;
  const [message, onChangeMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const [channel, setChannel] = useState<Amity.Channel>();
  const currentPage: Amity.Page = {limit: 50};

  const subscribeSubChannel = (subChannel: Amity.SubChannel) =>
    disposers.push(subscribeTopic(getSubChannelTopic(subChannel)));

  useEffect(() => {
    const unsubscribe = ChannelRepository.getChannel(
      channelId,
      ({data: channel, loading, error}) => {
        console.log('channel ', channel, loading, error);

        if (!loading) {
          // if (channel?.type === 'live' || channel?.type === 'broadcast') {
          //   disposers.push(subscribeTopic(getChannelTopic(channel)));
          //}
          console.log('channel 111 ', channel);
          if (!channel || error?.code === '400400') {
            createChannel();
          } else {
            setChannel(channel);
            console.log(
              ' channel?.defaultSubChannelId, ',
              channel?.defaultSubChannelId,
            );
            ChannelRepository.Membership.getMembers(
              {channelId},
              async response => {
                console.log('Response ', response);
                if (
                  !response?.data?.find(member => member?.userId === userId)
                ) {
                  const didJoinChannel = await ChannelRepository.joinChannel(
                    channelId,
                  );
                  console.log('didJoinChannel ', didJoinChannel);
                }
                getSubChannel(channel?.defaultSubChannelId);
              },
            );
          }
        }
      },
    );
    unsubscribe();
    return () => {
      disposers.forEach(fn => fn());
    };
  }, [channelId]);

  const getSubChannel = subChannelId => {
    SubChannelRepository.getSubChannel(
      subChannelId,
      ({data: subChannel, loading, error}) => {
        console.log('subChannel ', subChannel, loading, error);
        if (subChannel) observeMessage(subChannel);
      },
    );
  };

  const createChannel = async () => {
    try {
      const newChannel = {
        channelId: channelId,
        //avatarFileId: 'fileId',
        displayName: 'myCommunityChannel',
        tags: ['tag'],
        type: 'community' as Amity.ChannelType,
        //userIds: ['64c8b59e000d6e6f291a61b5'],
        metadata: {
          data: 'anything',
        },
      };

      const {data: channel} = await ChannelRepository.createChannel(newChannel);
      setChannel(channel);
      console.log(
        ' channel?.defaultSubChannelId, ',
        channel?.defaultSubChannelId,
      );
      const subChannelRepository = await SubChannelRepository.getSubChannel(
        channel?.defaultSubChannelId,
        ({data: subChannel, loading, error}) => {
          console.log('subChannel ', subChannel);
          if (subChannel) observeMessage(subChannel);
        },
      );
      subChannelRepository();
      console.log('new channel ', channel);
      ChannelRepository.Membership.getMembers({channelId}, async response => {
        console.log('Response ', response, isLoading, error);
        if (!response?.data?.find(member => member?.userId === userId)) {
          const didJoinChannel = await ChannelRepository.joinChannel(channelId);
          console.log('didJoinChannel ', didJoinChannel);
        }
      });
    } catch (error) {
      console.log(JSON.stringify(error));
      if (error?.code === '400900') {
      }
    }
  };

  const query = createQuery(queryMessages, {
    page: currentPage,
    channelId: channelId,
  });

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
      {subChannelId: channel?.subChannelId, limit: 100},
      ({data: messages, onNextPage, hasNextPage, loading, error}) => {
        console.log('messages MessageRepository ', messages);
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

  const sendGroupChat = async () => {
    const {data: userData} = await UserRepository.getUserByIds([userId]);

    const data1 = JSON.stringify({
      username: userData?.[0]?.displayName,
      profileUrl: userData?.[0]?.avatarCustomUrl,
    });
    console.log('data1 ', data1);
    const textMessage = {
      subChannelId: channel?.defaultSubChannelId,
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
          inverted
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
          onPress={sendGroupChat}>
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

export default GroupChat;
