import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';

const Header = () => {
    const navigation = useNavigation();
    const goProfile = () => {
        navigation.navigate('Profile');
    };
    return (
        <View style={styles.header}>
            {/* Center Image */}
            <View style={styles.centerView}>
                <Image
                    source={{ uri: "https://assets.chorcha.net/a-SYEMAoDS7aZhSPshmh6.png" }}
                    style={styles.centerImage}
                />
                <View>
                    <Text style={styles.headerTextBold}>SJSC Teachers App</Text>
                    {/* <Text>Bonpara, Natore</Text> */}
                </View>
            </View>

            {/* Right-end Image with Text (User) */}
            <TouchableOpacity onPress={goProfile} style={styles.profileButton}>
                <Image
                    source={{ uri: "https://assets.chorcha.net/ZUfPUPHLvDxY_yOveJGZm.png" }}
                    style={styles.profileImage}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        // marginBottom: 1,
        height: 120,
        borderRadius: 15,
        backgroundColor: '#f1f1f1', // Add some background color to differentiate the header
    },
    centerView: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10, // Space between image and text
    },
    centerImage: {
        width: 60,
        height: 60,
        borderRadius: 30, // Ensuring the image is round
    },
    headerTextBold: {
        fontWeight: 'bold',
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        width: 30,
        height: 30,
        borderRadius: 15, // Make the profile image round
    },
});

export default Header;
