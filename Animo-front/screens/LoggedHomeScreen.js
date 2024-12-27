// LoggedHomeScreen.js

import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    StatusBar,
    Platform,
    TouchableOpacity,
    ScrollView,
    Image,
    BackHandler,
    Alert,
    Dimensions,
} from 'react-native';
import { Bars3CenterLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import TrendingAnime from '../components/trendingAnime.js'; // Ensure correct path
import AnimeList from '../components/AnimeList'; // Ensure correct path
import Loading from './loading.js'; // Ensure correct path
import { fetchTrendingAnimes, fetchUpcomingAnimes, fetchTopAnimes, fetchRecommendation } from './api/AnimeDB'; // Ensure correct path
import { Drawer } from 'react-native-drawer-layout';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ios = Platform.OS === 'ios';
const { width, height } = Dimensions.get('window'); // Correctly destructured

export default function LoggedHomeScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { userName, userId } = route.params || {};

    // State variables for anime lists
    const [Trending, setTrending] = useState([]);
    const [upComing, setUpcoming] = useState([]);
    const [TopRated, setTopRated] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    // User state with avatar
  

    // Generate a random avatar URL
    function getRandomAvatar() {
        const randomSeed = Math.floor(Math.random() * 1000);
        return `https://robohash.org/${randomSeed}.png?set=set5`;
    }

    const [user, setUser] = useState({
        isLoggedIn: true,
        name: userName || 'Guest',
        avatar: getRandomAvatar(),
    });

    // Fetch anime data on component mount
    useEffect(() => {
        fetchAllAnimeData();
        updateUserAvatar(user.avatar); // Update avatar in backend
    }, []);

    // Function to fetch all anime lists
    const fetchAllAnimeData = async () => {
        setLoading(true);
        try {
            const trendingData = await fetchTrendingAnimes();
            if (trendingData && trendingData.data) setTrending(trendingData.data);

            const upcomingData = await fetchUpcomingAnimes();
            if (upcomingData && upcomingData.data) setUpcoming(upcomingData.data);

            const topRatedData = await fetchTopAnimes();
            if (topRatedData && topRatedData.data) setTopRated(topRatedData.data);

            const recommendationData = await fetchRecommendation();
            if (recommendationData && recommendationData.data) setRecommendations(recommendationData.data);
        } catch (error) {
            console.error('Error fetching anime data:', error);
            Alert.alert('Error', 'Failed to fetch anime data.');
        } finally {
            setLoading(false);
        }
    };

    // Handle Android back button to confirm exit
    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                Alert.alert('Exit App', 'Are you sure you want to exit?', [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                    {
                        text: 'Yes',
                        onPress: () => BackHandler.exitApp(),
                    },
                ]);
                return true; // Prevent default back action
            };

            BackHandler.addEventListener('hardwareBackPress', onBackPress);

            return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        }, [])
    );

    // Function to update user avatar in backend
    const updateUserAvatar = async (avatarUrl) => {
        try {
            const token = await AsyncStorage.getItem('token'); // Ensure token is stored during login

            if (!token) {
                Alert.alert('Error', 'User not authenticated.');
                return;
            }

            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            };
            console.log('userId:',userId , 'avatar:', avatarUrl);

            const response = await axios.put(
                'http://192.168.43.44/avatar', // Replace with your backend URL
                { userId: userId ,avatar: avatarUrl},
                config
            );

            console.log('Avatar updated:', response.data);
            // Update local user state with the new avatar
            setUser(prevState => ({
                ...prevState,
                avatar: response.data.avatar,
            }));
            
        } catch (error) {
            console.error('Error updating avatar:', error.response?.data?.message || error.message);
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
    };

    // Function to render the navigation drawer content
    const renderNavigationView = () => (
        <View style={styles.drawerContainer}>
            {/* User Profile Section */}
            <TouchableOpacity
                style={styles.userSection}
                onPress={() => navigation.navigate('Profile', { userId: userId })}
            >
                <Image source={{ uri: user.avatar }} style={styles.userAvatar} />
                <Text style={styles.userName}>{user.name}</Text>
            </TouchableOpacity>

            {/* First Section */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={styles.sectionItem}
                    onPress={() => navigation.navigate('Seasons')}
                >
                    <Icon name="calendar-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Seasons</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="people-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Top Characters</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="list-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>My List</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {/* Second Section */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="clipboard-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Daily Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="bulb-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Anime IQ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="help-circle-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Quizzes</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {/* Third Section */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="clipboard-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Character AI</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => {}}>
                    <Icon name="settings-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Drawer
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            drawerPosition="left"
            drawerType="front"
            drawerStyle={{ width: 300 }}
            renderDrawerContent={renderNavigationView}
        >
            <View style={styles.container}>
                {/* Header Section */}
                <SafeAreaView style={ios ? styles.safeAreaIOS : styles.safeAreaAndroid}>
                    <StatusBar style="light" backgroundColor="#262626" />
                    <View style={styles.header}>
                        {/* Open Drawer Button */}
                        <TouchableOpacity onPress={() => setOpen(true)}>
                            <Bars3CenterLeftIcon size={30} strokeWidth={2} color="white" />
                        </TouchableOpacity>

                        {/* App Title */}
                        <Text style={styles.title}>
                            <Text style={{ color: '#5abf75' }}>A</Text>nimo
                        </Text>

                        {/* Search Button */}
                        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                            <MagnifyingGlassIcon size={30} strokeWidth={2} color="white" />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>

                {/* Main Content */}
                {loading ? (
                    <Loading />
                ) : (
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollViewContent}
                    >
                        {/* Trending Anime Section */}
                        <TrendingAnime data={Trending} />

                        {/* Upcoming Anime Section */}
                        <AnimeList title="Upcoming" data={upComing} />

                        {/* Top Rated Anime Section */}
                        <AnimeList title="Top Rated" data={TopRated} />

                        {/* Recommendations Anime Section */}
                        <AnimeList title="Recommendations" data={recommendations} />
                    </ScrollView>
                )}
            </View>
        </Drawer>
    );
}

// Stylesheet
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#262626',
    },
    safeAreaIOS: {
        marginBottom: -2,
    },
    safeAreaAndroid: {
        marginBottom: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        paddingBottom: 20,
    },
    drawerContainer: {
        flex: 1,
        backgroundColor: '#262626',
        padding: 20,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        paddingVertical: 10,
    },
    userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userName: {
        color: 'white',
        fontSize: 18,
    },
    section: {
        marginVertical: 10,
    },
    sectionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
    },
    sectionText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#444',
        marginVertical: 10,
    },
});
