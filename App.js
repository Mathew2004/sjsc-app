import { StyleSheet, Text, View, SafeAreaView, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { NavigationContainer, DefaultTheme, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from './utils/notifications';
import { api, getTeacherId } from './utils/api';


const Stack = createNativeStackNavigator();


export default function App() {
  // Get AsyncStorage
  const [value, setValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("token");
      const teacher_id = await getTeacherId();
      const fcmToken = await registerForPushNotificationsAsync();
      
      // send token to your backend
      if (token && teacher_id && fcmToken) {
        await api.post('/save-fcm-token', {
          fcmToken: fcmToken,
          teacher_id: teacher_id
        });
      }

    })();

    const sub1 = Notifications.addNotificationReceivedListener(notification => {
      console.log('Foreground notification:', notification);
    });

    const sub2 = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('User tapped notification:', response.notification.request.content.data);
    });


    return () => {
      sub1.remove();
      sub2.remove();
    };
  }, []);



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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#667eea" />
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
                  name="Home"
                  options={{
                    header: () => <Header />,
                  }}
                >
                  {(props) => (
                    <SafeAreaView style={{ flex: 1 }}>
                      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <HomeScreen {...props} setValue={setValue} />
                      </ScrollView>
                    </SafeAreaView>
                  )}
                </Stack.Screen>

                <Stack.Screen
                  name="Attendance"
                  component={Attendance}
                  options={{
                    title: 'Attendance',
                    headerStyle: { backgroundColor: '#eee' },
                    headerTintColor: '#111',
                    headerTextAlign: 'center',
                    detachPreviousScreen: false,
                  }}
                />
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
                  name="Marks"
                  component={Marks}
                  options={{
                    title: 'Marks',
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
                {/* <Stack.Screen
                name="Profile"
                component={Profile}
                options={{
                  title: 'Profile',
                  headerStyle: { backgroundColor: '#111' },
                  headerTintColor: '#fff',
                  headerTitleStyle: { fontWeight: 'bold' },
                  headerTextAlign: 'center'
                }}
              /> */}
                <Stack.Screen
                  name="Profile"
                  options={{
                    title: 'Profile',
                    headerStyle: { backgroundColor: '#eee' },
                    headerTintColor: '#111',
                    headerTextAlign: 'center'
                  }}
                >
                  {(props) => (
                    <SafeAreaView style={{ flex: 1 }}>
                      <Profile setValue={setValue} />
                    </SafeAreaView>
                  )}
                </Stack.Screen>
              </>
            )
          }
        </Stack.Navigator>
      </NavigationContainer>
    </>
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