import React from 'react';
import { Button, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';

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
        item: 'Marks Sheets',
        icon: require('../assets/icons/marks-history.png'),
        href: 'MarksList',
    },
    {
        item: 'Teachers',
        icon: require('../assets/icons/teacher.png'),
        href: 'Teachers',
    },
    
];

export default function HomeScreen() {
    console.log("Home");
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



