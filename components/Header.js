import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../hooks';
import appConfig from '../app.json';

const Header = () => {
    const navigation = useNavigation();
    const { teacher } = useTeacher();
    const goProfile = () => {
        navigation.navigate('Profile');
    };

    return (
        <View style={[styles.header, { backgroundColor: '#667eea' }]} >
            {/* Decorative elements */}
            <View style={styles.decorativeCircle1} />
            <View style={styles.decorativeCircle2} />

            {/* Main content */}
            <View style={styles.content}>
                {/* Left side - Logo and text */}
                <View style={styles.leftSection}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={{ uri: "https://assets.chorcha.net/a-SYEMAoDS7aZhSPshmh6.png" }}
                            style={styles.centerImage}
                        />
                        <View style={styles.logoGlow} />
                    </View>
                    <View style={styles.textContainer}>
                        <Text style={styles.headerTextBold}>SJSC Teachers</Text>
                        <Text style={styles.headerSubtext}>Welcome, {teacher?.name || "Teacher"}</Text>
                        <Text style={styles.versionText}>v{appConfig.expo.version}</Text>
                    </View>
                </View>

                {/* Right side - Profile with notification */}
                <TouchableOpacity onPress={goProfile} style={styles.profileButton}>
                    <View style={styles.profileContainer}>
                        <Image
                            source={{ uri: teacher?.extra?.image || "https://assets.chorcha.net/ZUfPUPHLvDxY_yOveJGZm.png" }}
                            style={styles.profileImage}
                        />
                        <View style={styles.onlineIndicator} />
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 120,
        // paddingTop: 50,
        paddingHorizontal: 20,
        paddingBottom: 15,
        position: 'relative',
        overflow: 'hidden',
    },
    decorativeCircle1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: 'rgba(255,255,255,0.1)',
        top: -100,
        right: -50,
    },
    decorativeCircle2: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255,255,255,0.05)',
        bottom: -75,
        left: -30,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
        zIndex: 1,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    logoContainer: {
        position: 'relative',
        marginRight: 15,
    },
    centerImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    logoGlow: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        top: 0,
        left: 0,
        shadowColor: '#fff',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    textContainer: {
        flex: 1,
    },
    headerTextBold: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
        letterSpacing: 0.5,
    },
    headerSubtext: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
        marginTop: 2,
        letterSpacing: 0.3,
    },
    versionText: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '400',
        marginTop: 1,
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    profileContainer: {
        position: 'relative',
        marginRight: 8,
    },
    profileImage: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.4)',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: '#ffffff',
    },
});

export default Header;
