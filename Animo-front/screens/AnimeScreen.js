import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
  Image,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  ChevronLeftIcon,
  StarIcon,
  ClockIcon,
  EyeIcon,
  PlayIcon,
  PlusIcon,   // <<-- Ensure these two icons exist in your heroicons library
  XMarkIcon   // <<-- or rename to XIcon if that's what your library provides
} from 'react-native-heroicons/outline';
import { HeartIcon } from 'react-native-heroicons/mini';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Loading from './loading';
import { fetchAnimeById, fetchAnimeCharecters } from './api/AnimeDB';
import Cast from '../components/cast';

const { width, height } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Optional top margin offset for iOS or Android
const topMargin = isIOS ? 20 : 25;

// Define status options for "My List"
const STATUS_OPTIONS = [
  { label: 'Want to Watch', value: 'want_to_watch' },
  { label: 'Watching Now', value: 'watching_now' },
  { label: 'Done Watching', value: 'done_watching' },
  { label: 'Complete it Later', value: 'complete_later' },
  { label: "I Don't Want to Complete It", value: 'dont_want' }
];

export default function AnimeScreen() {
  const { params: item } = useRoute();
  const navigation = useNavigation();

  // Favorite animation
  const [isFavourite, setIsFavourite] = useState(false);
  const [heartScale] = useState(new Animated.Value(1));

  // Basic data
  const [animeDetails, setAnimeDetails] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState('Description');
  const [showAll, setShowAll] = useState(false);

  // Completed-episodes state
  const [completedEpisodes, setCompletedEpisodes] = useState(new Set());

  // "My List" feature
  const [myListStatus, setMyListStatus] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
    loadCompletedEpisodes();
    loadMyListStatus();

    // Simple timeout to show a Retry button if load is stuck
    const timer = setTimeout(() => {
      if (loading) {
        setRetry(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // Save episodes and list status whenever they change
  useEffect(() => {
    saveCompletedEpisodes();
  }, [completedEpisodes]);

  useEffect(() => {
    saveMyListStatus();
  }, [myListStatus]);

  // ------------------------------------------
  // Data fetching and storing
  // ------------------------------------------
  const fetchData = async () => {
    setLoading(true);
    setRetry(false);
    try {
      const displayItem = item?.approved
        ? item
        : await fetchAnimeById(item?.mal_id).then((res) => res.data);

      setAnimeDetails(displayItem);

      const characterData = await fetchAnimeCharecters(displayItem.mal_id);
      if (characterData && characterData.data) {
        setCast(characterData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch anime details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Completed episodes logic
  const loadCompletedEpisodes = async () => {
    try {
      const storedEpisodes = await AsyncStorage.getItem('completedEpisodes');
      if (storedEpisodes) {
        setCompletedEpisodes(new Set(JSON.parse(storedEpisodes)));
      }
    } catch (error) {
      console.error('Failed to load completed episodes:', error);
    }
  };

  const saveCompletedEpisodes = async () => {
    try {
      await AsyncStorage.setItem(
        'completedEpisodes',
        JSON.stringify([...completedEpisodes])
      );
    } catch (error) {
      console.error('Failed to save completed episodes:', error);
    }
  };

  const toggleEpisodeCompletion = (episodeNumber) => {
    setCompletedEpisodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(episodeNumber)) {
        newSet.delete(episodeNumber);
      } else {
        newSet.add(episodeNumber);
      }
      return newSet;
    });
  };

  // "My List" logic
  const loadMyListStatus = async () => {
    try {
      if (item?.mal_id) {
        const storedStatus = await AsyncStorage.getItem(
          `myListStatus_${item.mal_id}`
        );
        if (storedStatus) {
          setMyListStatus(storedStatus);
        }
      }
    } catch (error) {
      console.error('Failed to load My List status:', error);
    }
  };

  const saveMyListStatus = async () => {
    try {
      if (animeDetails?.mal_id) {
        await AsyncStorage.setItem(
          `myListStatus_${animeDetails.mal_id}`,
          myListStatus || ''
        );
      }
    } catch (error) {
      console.error('Failed to save My List status:', error);
    }
  };

  const handleStatusSelection = (status) => {
    setMyListStatus(status);
    setIsModalVisible(false);
  };

  const getMyListLabel = () => {
    const statusOption = STATUS_OPTIONS.find(
      (option) => option.value === myListStatus
    );
    return statusOption ? statusOption.label : 'Add to My List';
  };

  const getStatusColor = () => {
    switch (myListStatus) {
      case 'want_to_watch':
        return '#fbc02d'; // Yellow
      case 'watching_now':
        return '#42a5f5'; // Blue
      case 'done_watching':
        return '#66bb6a'; // Green
      case 'complete_later':
        return '#ab47bc'; // Purple
      case 'dont_want':
        return '#ef5350'; // Red
      default:
        return '#ffffff'; // Default white
    }
  };

  // Favorite icon animation
  const toggleFavorite = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start();
    setIsFavourite(!isFavourite);
  };

  // ------------------------------------------
  // Rendering logic
  // ------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {retry ? (
          <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : (
          <Loading />
        )}
      </View>
    );
  }

  if (!animeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Anime details not available.</Text>
      </View>
    );
  }

  // De-structure data from animeDetails safely
  const {
    title,
    images,
    aired,
    duration,
    genres = [],
    episodes,
    synopsis,
    trailer,
    score,
    scored_by
  } = animeDetails;

  const AnimeProp = {
    name: title,
    background: images?.jpg?.large_image_url,
    Airing: {
      status: aired ? 'Aired' : 'Not released',
      Time: aired?.from?.slice(0, 4) || ''
    },
    duration,
    genres,
    ep: episodes || 0,
    story: synopsis
  };

  // Create an array of episode numbers for FlatList
  const episodesArray = Array.from({ length: AnimeProp.ep }, (_, i) => i + 1);

  // Renders each episode row
  const renderEpisodeItem = ({ item: episodeNumber }) => {
    const isCompleted = completedEpisodes.has(episodeNumber);

    return (
      <TouchableOpacity
        style={[
          styles.episodeCard,
          isCompleted && styles.episodeCardCompleted
        ]}
        onPress={() => toggleEpisodeCompletion(episodeNumber)}
        activeOpacity={0.7}
      >
        <View style={styles.episodeInfo}>
          <EyeIcon
            size={24}
            color={isCompleted ? '#4caf50' : '#ffffff'}
            style={{ marginRight: 10 }}
          />
          <Text
            style={[
              styles.episodeText,
              isCompleted && styles.episodeTextCompleted
            ]}
          >
            Episode {episodeNumber}
          </Text>
        </View>
        <View style={styles.playIconContainer}>
          <PlayIcon size={20} color="#ffffff" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#171717"
        translucent={false}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          style={{ backgroundColor: '#171717' }}
        >
          {/* Top Image */}
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: AnimeProp.background }}
              style={{ width, height: height * 0.55 }}
            />
            <LinearGradient
              colors={['transparent', 'rgba(23,23,23,0.8)', 'rgba(23,23,23,1)']}
              style={{
                width,
                height: height * 0.4,
                position: 'absolute',
                bottom: 0
              }}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
            />

            {/* Back & Favorite Buttons */}
            <View
              style={{
                position: 'absolute',
                zIndex: 20,
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 20,
                top: topMargin
              }}
            >
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <ChevronLeftIcon size={28} strokeWidth={2.5} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleFavorite}>
                <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                  <HeartIcon
                    size={35}
                    color={isFavourite ? '#5abf75' : '#ffffff'}
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Anime Title + Info */}
          <View style={styles.infoContainer}>
            <View style={styles.titleContainer}>
              {/* Anime Title */}
              <Text style={styles.titleText}>{AnimeProp.name}</Text>

              {/* MY LIST BUTTON (Right below the name) */}
              <View style={styles.myListContainer}>
                <TouchableOpacity
                  onPress={() => setIsModalVisible(true)}
                  style={[
                    styles.myListButton,
                    myListStatus && { backgroundColor: getStatusColor() }
                  ]}
                >
                  <PlusIcon
                    size={20}
                    color={myListStatus ? '#ffffff' : '#000000'}
                  />
                  <Text
                    style={[
                      styles.myListText,
                      myListStatus && { color: '#ffffff' }
                    ]}
                  >
                    {myListStatus ? getMyListLabel() : 'Add to My List'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.subInfoText}>
                {AnimeProp.Airing.status} • {AnimeProp.Airing.Time} •{' '}
                {AnimeProp.ep} episodes
              </Text>

              {/* Genres */}
              <View style={styles.genresContainer}>
                {AnimeProp.genres.map((genre, index) => (
                  <View key={index} style={styles.genreBadge}>
                    <Text style={styles.genreText}>{genre.name}</Text>
                  </View>
                ))}
              </View>

              {/* Score + Duration */}
              <View style={styles.scoreDurationContainer}>
                <StarIcon size={22} color="#FFD700" />
                <Text style={styles.scoreText}>
                  {score == null ? '?' : score} ({scored_by} ratings)
                </Text>
              </View>
              <View style={styles.scoreDurationContainer}>
                <ClockIcon size={22} color="#90ee90" />
                <Text style={styles.durationText}>{duration || 'N/A'}</Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Description' && styles.activeTab
                ]}
                onPress={() => setActiveTab('Description')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Description' && styles.activeTabText
                  ]}
                >
                  Description
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'Watch' && styles.activeTab
                ]}
                onPress={() => setActiveTab('Watch')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'Watch' && styles.activeTabText
                  ]}
                >
                  Watch
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            {activeTab === 'Description' ? (
              <View style={{ paddingHorizontal: 10 }}>
                {/* Synopsis */}
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                  <Text style={styles.synopsisText}>
                    {showAll
                      ? AnimeProp.story
                      : AnimeProp.story?.length > 450
                      ? AnimeProp.story.slice(0, 450) + '...'
                      : AnimeProp.story}
                  </Text>
                  {AnimeProp.story?.length > 450 && (
                    <Text style={styles.showMoreText}>
                      {showAll ? 'Show Less' : 'Show More'}
                    </Text>
                  )}
                </TouchableOpacity>

                {/* Trailer */}
                {trailer?.embed_url ? (
                  <View style={styles.trailerContainer}>
                    <Text style={styles.sectionTitle}>Trailer</Text>
                    <WebView
                      source={{ uri: trailer.embed_url }}
                      style={styles.webView}
                      javaScriptEnabled
                      domStorageEnabled
                    />
                  </View>
                ) : null}

                {/* Cast */}
                <Cast cast={cast} navigation={navigation} />
              </View>
            ) : (
              <View style={{ paddingHorizontal: 10 }}>
                <Text style={styles.sectionTitle}>Episodes</Text>
                <FlatList
                  data={episodesArray}
                  renderItem={renderEpisodeItem}
                  keyExtractor={(epNum) => epNum.toString()}
                  contentContainerStyle={styles.episodesList}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>
        </ScrollView>

        {/* Modal for My List Selection */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
            <View style={styles.modalOverlay} />
          </TouchableWithoutFeedback>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Status</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <XMarkIcon size={24} color="#000000" />
                </TouchableOpacity>
              </View>
              <FlatList
                data={STATUS_OPTIONS}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.statusOption}
                    onPress={() => handleStatusSelection(item.value)}
                  >
                    <Text style={styles.statusText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(option) => option.value}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  loadingContainer: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#262626',
    width: '100%',
    height: '100%'
  },
  retryButton: {
    padding: 15,
    backgroundColor: '#5abf75',
    borderRadius: 30
  },
  retryText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    color: '#ffffff',
    fontSize: 18,
    textAlign: 'center'
  },
  backButton: {
    borderRadius: 25,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingTop: 10
  },
  titleContainer: {
    marginTop: -height * 0.09,
    marginBottom: 20
  },
  titleText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5
  },
  myListContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  myListButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20
  },
  myListText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#000000'
  },
  subInfoText: {
    color: '#b0b0b0',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10
  },
  genresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 15
  },
  genreBadge: {
    backgroundColor: '#333333',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginHorizontal: 5,
    marginVertical: 3
  },
  genreText: {
    color: '#b0b0b0',
    fontSize: 14,
    fontWeight: '600'
  },
  scoreDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 5
  },
  durationText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 5
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20
  },
  tabButton: {
    marginHorizontal: 20,
    paddingBottom: 5
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#5abf75'
  },
  tabText: {
    color: '#ffffff',
    fontSize: 18
  },
  activeTabText: {
    opacity: 1
  },
  synopsisText: {
    color: '#b0b0b0',
    fontSize: 16,
    lineHeight: 22
  },
  showMoreText: {
    color: '#5abf75',
    marginTop: 5,
    fontSize: 16,
    fontWeight: '600'
  },
  trailerContainer: {
    marginTop: 20
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10
  },
  webView: {
    width: '100%',
    height: 200,
    borderRadius: 10
  },
  episodesList: {
    paddingBottom: 20
  },
  episodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10
  },
  episodeCardCompleted: {
    backgroundColor: '#3a3a3a'
  },
  episodeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  episodeText: {
    color: '#ffffff',
    fontSize: 16
  },
  episodeTextCompleted: {
    color: '#4caf50',
    textDecorationLine: 'line-through'
  },
  playIconContainer: {
    backgroundColor: '#5abf75',
    borderRadius: 20,
    padding: 5
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  modalContainer: {
    position: 'absolute',
    top: height / 3,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    elevation: 5
  },
  modalContent: {},
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000'
  },
  statusOption: {
    paddingVertical: 12,
    paddingHorizontal: 10
  },
  statusText: {
    fontSize: 16,
    color: '#000000'
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0'
  }
});
