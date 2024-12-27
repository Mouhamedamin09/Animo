import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, ScrollView, StatusBar, Image, Platform } from 'react-native';
import { Drawer } from 'react-native-drawer-layout';
import { useNavigation, useIsFocused, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Bars3CenterLeftIcon, MagnifyingGlassIcon } from 'react-native-heroicons/outline';

const Layout = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [activeScreen, setActiveScreen] = useState('Home'); // State to track active screen
    const navigation = useNavigation();
    const route = useRoute();
    const isFocused = useIsFocused();

    const renderNavigationView = () => (
        <View style={styles.drawerContainer}>
            <View style={styles.userSection}>
                <Image source={{ uri: '../assets/james.webp' }} style={styles.userAvatar} />
                <Text style={styles.userName}>Mohamed Amin</Text>
            </View>
            {/* Sections */}
            <View style={styles.section}>
                <TouchableOpacity
                    style={[styles.sectionItem, activeScreen === 'Home' && styles.activeItem]}
                    onPress={() => { navigation.navigate('Home'), setOpen(false), setActiveScreen('Home') }}
                >
                    <Icon name="list-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>My List</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.sectionItem, activeScreen === 'Seasons' && styles.activeItem]}
                    onPress={() => { navigation.navigate('Seasons'), setOpen(false), setActiveScreen('Seasons') }}
                >
                    <Icon name="calendar-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Seasons</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => { /* Navigate to Top Characters */ }}>
                    <Icon name="people-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Top Characters</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            {/* Quizzes */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionItem} onPress={() => { /* Navigate to Daily Quiz */ }}>
                    <Icon name="clipboard-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Daily Quiz</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => { /* Navigate to Anime IQ */ }}>
                    <Icon name="bulb-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Anime IQ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sectionItem} onPress={() => { /* Navigate to Quizzes */ }}>
                    <Icon name="help-circle-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Quizzes</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.separator} />
            {/* Settings */}
            <View style={styles.section}>
                <TouchableOpacity style={styles.sectionItem} onPress={() => { /* Navigate to Settings */ }}>
                    <Icon name="settings-outline" size={24} color="white" />
                    <Text style={styles.sectionText}>Settings</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    useEffect(() => {
        if (isFocused) {
            setActiveScreen(route.name); // Update activeScreen state with current route name
        }
    }, [isFocused, route]);

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
            <View className='flex-1 bg-neutral-800'>
                <SafeAreaView className={Platform.OS == "ios" ? "-mb-2" : "mb-3"}>
                    <StatusBar style='light' backgroundColor="#262626" />
                    <View className="flex-row justify-between items-center mx-4">
                        <TouchableOpacity onPress={() => setOpen(true)}>
                            <Bars3CenterLeftIcon size="30" strokeWidth={2} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-3xl font-bold">{activeScreen==="Home" ? <Text style={{ color: "#5abf75" }}>A</Text>:<Text style={{ color: "#5abf75" }}>{activeScreen.slice(0,1)}</Text>}{activeScreen==="Home" ? "nimo":activeScreen.slice(1,)}</Text>
                        <TouchableOpacity>
                            <MagnifyingGlassIcon size="30" strokeWidth={2} color="white" onPress={() => { navigation.navigate("Search") }} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
                {children}
            </View>
        </Drawer>
    );
}

const styles = {
    drawerContainer: {
        flex: 1,
        backgroundColor: '#262626',
        padding: 0,
    },
    userSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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
        paddingLeft:20,
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
    activeItem: {
        backgroundColor: '#5abf751f', // Example of active item style
    },
};

export default Layout;
