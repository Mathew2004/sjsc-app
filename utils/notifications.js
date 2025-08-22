import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// export async function createNotificationChannel() {
//   if (Platform.OS === "android") {
//     await Notifications.setNotificationChannelAsync("default", {
//       name: "default",
//       importance: Notifications.AndroidImportance.MAX,
//       sound: "hehe.mp3", // name of the file in assets folder
//       vibrationPattern: [0, 250, 250, 250],
//       lightColor: "#FF231F7C",
//     });
//   }
// }

export async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
        alert("Must use physical device for push notifications");
        return null;
    }
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log("Expo push token:", token);

    // Request permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== "granted") {
        alert("Permission not granted!");
        return null;
    }

    // 👉 Get FCM token instead of Expo token
    const { data: fcmToken } = await Notifications.getDevicePushTokenAsync();
    console.log("FCM Token:", fcmToken);

    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
            name: "default",
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    return fcmToken;
}
