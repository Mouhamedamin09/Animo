import React from 'react';
import { View, Text, Image, Dimensions } from 'react-native';
import { TouchableOpacity, GestureHandlerRootView, ScrollView, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

var { width, height } = Dimensions.get('window');
export default function AnimeList({ title, data, hideSeeAll }) {
  const navigation = useNavigation(); // Initialize navigation

  return (
    <GestureHandlerRootView>
      <View className="mb-8 space-y-4">
        <View className="mx-4 flex-row justify-between items-center">
          <Text className="text-white text-xl">{title}</Text>
          <TouchableOpacity onPress={() => !hideSeeAll && navigation.push('SeeAll', { title, data })}>
            {!hideSeeAll && <Text style={{ color: '#5abf75' }} className="text-lg">See All</Text>}
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}>
          {
            data.slice(0, 10).map((item, index) => {

              const isEntry = !!item.entry;
              
              const displayItem = isEntry ? item.entry[0] : item;
              return (
                <TouchableWithoutFeedback key={index} onPress={() => { navigation.push('Anime', displayItem); }}>
                  <View className="space-y-1 mr-4">
                    <Image
                      source={{ uri: displayItem.images ? displayItem.images.jpg.large_image_url : null }}

                      className="rounded-3xl"
                      style={{ width: width * 0.33, height: height * 0.22 }}
                    />
                    <Text className="text-neutral-300 ml-1 mt-2">{displayItem.title?.length > 14 ? displayItem.title.slice(0, 14) + '...' : displayItem.title}</Text>
                  </View>
                </TouchableWithoutFeedback>
              );
            })

          }
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
}
