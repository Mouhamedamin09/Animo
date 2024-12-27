import { View, Text, SafeAreaView, TouchableOpacity, TextInput, ScrollView, Image, TouchableWithoutFeedback, Dimensions, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { fetchAnimeSearch } from './api/AnimeDB';

var { width, height } = Dimensions.get('window');

export default function SearchScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const searchResults = await fetchAnimeSearch(query);
        setResult(searchResults.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setResult([]);
    }
  };

  return (
    <SafeAreaView className="bg-neutral-800 flex-1">
      <View className="mx-4 mb-3 flex-row justify-between items-center border border-neutral-500 rounded-full">
        <TextInput 
          placeholder='Search Anime'
          placeholderTextColor={"lightgray"}
          className="pb-1 pl-6 flex-1 text-base font-semibold text-white tracking-wider"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="rounded-full p-3 m-1 bg-neutral-500"
        >
          <XMarkIcon size="25" color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#5abf75" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          className="space-y-3"
        >
          {result.length > 0 ? (
            <>
              <Text className="text-white font-semibold ml-1">Results ({result.length})</Text>
              <View className="flex-row justify-between flex-wrap">
                {result.map((item, index) => {
                  const animeTitle = item.title.length > 17 ? item.title.slice(0, 17) + "..." : item.title;
                  return (
                    <TouchableWithoutFeedback
                      key={index}
                      onPress={() => navigation.push("Anime", { mal_id: item.mal_id })}
                    >
                      <View className="space-y-2 mb-4">
                        <Image
                          className="rounded-3xl"
                          source={{ uri: item.images.jpg.large_image_url }}
                          style={{ width: width * 0.44, height: height * 0.3 }}
                        />
                        <Text className="text-neutral-400 ml-1">{animeTitle}</Text>
                      </View>
                    </TouchableWithoutFeedback>
                  );
                })}
              </View>
            </>
          ) : (
            <View className="flex-row justify-center">
              <Text className="text-neutral-400">No results found</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
