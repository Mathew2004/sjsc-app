import React from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Menus = [
    {
        item: 'Attendance',
        icon: require('../assets/icons/attendance.png'),
        href: 'Attendance',
    },
    {
        item: 'Marks',
        icon: require('../assets/icons/marks.png'),
        href: 'Marks',
    },
    {
        item: 'Attendance History',
        icon: require('../assets/icons/attendance-history.png'),
        href: 'Notice',
    },
    {
        item: 'Teachers',
        icon: require('../assets/icons/teacher.png'),
        href: 'Teachers',
    },
    {
        item: 'Marks Sheets',
        icon: require('../assets/icons/marks-history.png'),
        href: 'MarksList',
    },
];

export default function HomeScreen() {
    return (
        <View>
           
            <View style={{
                flex: 1,
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                padding: 20,
                alignItems: 'center',

            }}>
                {Menus.map((menu, index) => (
                    <Card key={index} item={menu.item} icon={menu.icon} href={menu.href} />
                ))}


            </View>
        </View>
    );
};


{/* Add A Logout And When It press it delete token form AsynStorage */ }
{/* <TouchableOpacity
                style={{
                    padding: 10,
                    backgroundColor: 'red',
                    borderRadius: 5,
                    alignItems: 'center',
                }}
            onPress={() => {
                AsyncStorage.removeItem('token');
                navigation.navigate('Login');
            }}>
                <Text>Logout</Text>
            </TouchableOpacity> */}

