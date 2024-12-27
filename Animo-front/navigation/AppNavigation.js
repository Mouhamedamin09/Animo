import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AnimeScreen from "../screens/AnimeScreen";
import CharacterScreen from "../screens/CharacterScreen";
import SearchScreen from "../screens/SearchScreen";
import VoiceActorScreen from "../screens/VoiceActorScreen";
import SeeAllScreen from "../screens/SeeAllScreen";
import AIChatScreen from "../screens/AIChatScreen";
import SeasonsScreen from "../screens/SeasonsScreen";
import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import PreferenceScreen from "../screens/PreferenceScreen";
import LoggedHomeScreen from "../screens/LoggedHomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";


const Stack=createNativeStackNavigator();

export default function AppNavigation(){
    return(
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" options={{headerShown:false}} component={HomeScreen} />
                <Stack.Screen name="Anime" options={{headerShown:false}} component={AnimeScreen} />
                <Stack.Screen name="Character" options={{headerShown:false}} component={CharacterScreen} />
                <Stack.Screen name="Search" options={{headerShown:false}} component={SearchScreen} />
                <Stack.Screen name="VoiceActor" options={{headerShown:false}} component={VoiceActorScreen} />
                <Stack.Screen name="SeeAll" options={{headerShown:false}} component={SeeAllScreen} />
                <Stack.Screen name="AIChat" options={{headerShown:false}} component={AIChatScreen} />
                <Stack.Screen name="Seasons" options={{headerShown:false}} component={SeasonsScreen} />
                <Stack.Screen name="Login" options={{headerShown:false}} component={LoginScreen} />
                <Stack.Screen name="Signup" options={{headerShown:false}} component={SignupScreen} />
                <Stack.Screen name="Preference" options={{headerShown:false}} component={PreferenceScreen} />
                <Stack.Screen name="LoggedHome" options={{headerShown:false}} component={LoggedHomeScreen} />
                <Stack.Screen name="Profile" options={{headerShown:false}} component={ProfileScreen} />
                <Stack.Screen name="EditProfile" options={{headerShown:false}} component={EditProfileScreen} />
               
                
            </Stack.Navigator>
        </NavigationContainer>
    )
}