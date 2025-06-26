import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './screens/HomeScreen';
import Dashboard from './screens/Dashboard';
import Header from './components/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import LoginScreen from './screens/auth/Login';
import Attendance from './screens/AttendanceForm';
import TakeAttendance from './screens/TakeAttendance';
import Marks from './screens/Marks';
import Notice from './screens/Notice';
import Teachers from './screens/Teachers';
import ViewAttendance from './screens/ViewAttendance';
import Profile from './screens/Profile';
import TakeMarks from './screens/TakeMarks';
import EditMarks from './screens/EditMarks';
import MarksLists from './screens/MarksList';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  // Get AsyncStorage
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        setValue(token);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const MainTabs = () => (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Attendance') {
            iconName = 'calendar';
          } else if (route.name === 'Marks') {
            iconName = 'clipboard';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6C63FF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ header: () => <Header /> }}
      >
        {props => (
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <HomeScreen {...props} setValue={setValue} />
            </ScrollView>
          </SafeAreaView>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Attendance"
        component={Attendance}
        options={{
          title: 'Attendance',
          headerStyle: { backgroundColor: '#eee' },
          headerTintColor: '#111',
          headerTextAlign: 'center',
        }}
      />
      <Tab.Screen
        name="Marks"
        component={Marks}
        options={{
          title: 'Marks',
          headerStyle: { backgroundColor: '#eee' },
          headerTintColor: '#111',
          headerTextAlign: 'center',
        }}
      />
      <Tab.Screen
        name="Profile"
        options={{
          title: 'Profile',
          headerStyle: { backgroundColor: '#eee' },
          headerTintColor: '#111',
          headerTextAlign: 'center',
        }}
      >
        {props => (
          <SafeAreaView style={{ flex: 1 }}>
            <Profile setValue={setValue} />
          </SafeAreaView>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }




  return (
    <NavigationContainer>
      <Stack.Navigator>
        {
          value === null ? (
            <Stack.Screen
              name="Login"
              options={{
                headerShown: false
              }}
            >
              {(props) => (
                <SafeAreaView style={{ flex: 1 }}>
                  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <LoginScreen {...props} setValue={setValue} />
                  </ScrollView>
                </SafeAreaView>
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Main"
                options={{ headerShown: false }}
              >
                {() => <MainTabs />}
              </Stack.Screen>
              <Stack.Screen
                name="TakeAttendance"
                component={TakeAttendance}
                options={{
                  title: 'Attendance',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              <Stack.Screen
                name="Notice"
                component={Notice}
                options={{
                  title: 'Attendance History',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              <Stack.Screen
                name="Teachers"
                component={Teachers}
                options={{
                  title: 'Teachers',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}

              />
              <Stack.Screen
                name="ViewAttendance"
                component={ViewAttendance}
                options={{
                  title: 'View Attendance',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              <Stack.Screen
                name="TakeMarks"
                component={TakeMarks}
                options={{
                  title: 'Put Marks',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              <Stack.Screen
                name="EditMarks"
                component={EditMarks}
                options={{
                  title: 'Edit Marks',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              <Stack.Screen
                name="MarksList"
                component={MarksLists}
                options={{
                  title: 'Marks List',
                  headerStyle: { backgroundColor: '#eee' },
                  headerTintColor: '#111',
                  headerTextAlign: 'center',
                  detachPreviousScreen: false,
                }}
              />
              {/* Profile screen handled in bottom tabs */}
            </>
          )
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
