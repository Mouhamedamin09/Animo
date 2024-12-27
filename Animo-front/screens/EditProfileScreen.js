import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// --- Image Picker (Expo 14+) ---
import * as ImagePicker from 'expo-image-picker';

// Helper for iOS vs Android safe area
const ios = Platform.OS === 'ios';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params || {};

  // Local state for loading spinner & form fields
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    location: '',
    birthDate: '',
    avatarUri: '',
  });

  // 1) Fetch current user data on mount
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        navigation.replace('Login');
        return;
      }

      // Example endpoint for fetching user data
      const response = await axios.get(
        `http://192.168.43.44:3000/data?userId=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const { userData } = response.data;
        setEditData({
          name: userData.username || '',
          location: userData.country || '',
          birthDate: userData.birthDate || '',
          avatarUri: userData.avatar || '',
        });
      } else {
        Alert.alert('Error', 'Failed to fetch user data.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while fetching user data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  // 2) Pick an image from the phone’s gallery
  const pickAvatar = async () => {
    try {
      // Request permission to access media library
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission denied',
          'We need your permission to access your camera roll.'
        );
        return;
      }

      // Launch image picker (Expo 14+)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',  // 'photo' | 'video' | 'mixed' (or ['photo','video'])
        allowsEditing: true,
        aspect: [1, 1],      // square crop
        quality: 1,
      });

      if (result.canceled) {
        // If user canceled, do nothing
        return;
      }

      // `result.assets` is an array of selected media
      const selectedAsset = result.assets[0];
      if (selectedAsset.uri) {
        // Update local state so we can display the new image
        setEditData((prev) => ({ ...prev, avatarUri: selectedAsset.uri }));
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong while picking the image.');
    }
  };

  // 3) Save/update user data on backend
  const handleSave = async () => {
    try {
      setLoading(true);
  
      const token = await AsyncStorage.getItem('token');
      console.log('Retrieved token:', token);
      if (!token) {
        Alert.alert('Error', 'No token found. Please log in again.');
        navigation.replace('Login');
        return;
      }
  
      const requestBody = {
        username: editData.name,
        country: editData.location,
        birthDate: editData.birthDate,
      };
  
      console.log('Request URL:', `http://192.168.43.44:3000/update-profile`);
      console.log('Request Body:', requestBody);
      console.log('Headers:', {
        Authorization: `Bearer ${token}`,
      });
  
      const response = await axios.put(
        `http://192.168.43.44:3000/update-profile`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      console.log('Response:', response.data);
  
      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      console.error('Error during profile update:', error.message);
      Alert.alert('Error', 'An error occurred while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={ios ? styles.safeAreaIOS : styles.safeAreaAndroid}>
        <StatusBar barStyle="light-content" backgroundColor="#262626" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          {/* Empty View to balance the back arrow (for alignment) */}
          <View style={{ width: 26 }} />
        </View>
      </SafeAreaView>

      <LinearGradient
        colors={['#333333', '#2a2a2a']}
        style={styles.gradientContainer}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#5abf75" />
        ) : (
          <>
            {/* Avatar at the Top + Pen Icon */}
            <View style={styles.avatarContainer}>
              <TouchableOpacity onPress={pickAvatar}>
              <Image
                    source={{
                    uri: editData.avatarUri, // Ensure this is correctly set
                        }}
                    style={styles.avatarImage}
                    />
                {/* Little Pen Icon in the bottom-left */}
                <View style={styles.penContainer}>
                  <Ionicons name="create" size={18} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.formFields}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.inputField}
                placeholderTextColor="#888"
                placeholder="Enter your name"
                value={editData.name}
                onChangeText={(text) =>
                  setEditData({ ...editData, name: text })
                }
              />

              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.inputField}
                placeholderTextColor="#888"
                placeholder="Enter your location"
                value={editData.location}
                onChangeText={(text) =>
                  setEditData({ ...editData, location: text })
                }
              />

              <Text style={styles.inputLabel}>Birth Date</Text>
              <TextInput
                style={styles.inputField}
                placeholderTextColor="#888"
                placeholder="YYYY-MM-DD (or similar)"
                value={editData.birthDate}
                onChangeText={(text) =>
                  setEditData({ ...editData, birthDate: text })
                }
              />

              {/* Save Button */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Ionicons
                  name="save-outline"
                  size={20}
                  color="#5abf75"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </LinearGradient>
    </View>
  );
}

/* --- STYLES --- */
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
    alignItems: 'center',
    marginHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  gradientContainer: {
    flex: 1,
    paddingTop: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: 20,
    position: 'relative', // so pen icon can be positioned absolute
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderColor: '#5abf75',
    borderWidth: 3,
  },
  penContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    backgroundColor: '#5abf75',
    borderRadius: 14,
    padding: 4,
  },
  formFields: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 6,
    marginTop: 16,
  },
  inputField: {
    backgroundColor: '#444444',
    color: '#fff',
    fontSize: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#444444',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#5abf75',
    fontSize: 16,
    fontWeight: '600',
  },
});
