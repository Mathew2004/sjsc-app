import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';


const Card = ({ item, icon, href }) => {
    const navigation = useNavigation();
    const scaleValue = useRef(new Animated.Value(1)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;
    const shimmerValue = useRef(new Animated.Value(0)).current;
    const glowValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous shimmer animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmerValue, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmerValue, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();

        // Continuous glow animation
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowValue, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                }),
                Animated.timing(glowValue, {
                    toValue: 0,
                    duration: 3000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 0.95,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const rotate = rotateValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '5deg'],
    });

    const shimmerTranslate = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-200, 200],
    });

    const glowOpacity = glowValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.8],
    });

    return (
        <Animated.View
            style={[
                styles.cardContainer,
                {
                    transform: [{ scale: scaleValue }, { rotate }],
                },
            ]}
        >
            <TouchableOpacity
                onPress={() => navigation.navigate(href)}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                {/* Glow Effect */}
                <Animated.View style={[styles.glowEffect, { opacity: glowOpacity }]} />

             
                <View style={styles.card}>
                    {/* Shimmer Effect */}
                    <Animated.View
                        style={[
                            styles.shimmer,
                            {
                                transform: [{ translateX: shimmerTranslate }],
                            },
                        ]}
                    />

                    {/* Floating Particles */}
                    <View style={styles.particle1} />
                    <View style={styles.particle2} />
                    <View style={styles.particle3} />

                    {/* Icon Container with Holographic Effect */}
                    <View style={styles.iconContainer}>

                        <Image source={icon} style={styles.iconImage} />

                    </View>

                    {/* Text with Neon Effect */}
                    <View style={styles.textContainer}>
                        <Text style={styles.cardTitle}>{item}</Text>
                        <View style={styles.textUnderline} />
                    </View>

                    {/* Corner Decorations */}
                    {/* <View style={styles.cornerDecoration1} />
                    <View style={styles.cornerDecoration2} /> */}

                    {/* Action Indicator */}
                    {/* <View style={styles.actionIndicator}>
                        <Ionicons name="chevron-forward" size={16} color="rgba(102, 126, 234, 0.6)" />
                    </View> */}
                </View>

                {/* Outer Glow Border */}
                <View style={styles.outerBorder} />
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        margin: 8,
        position: 'relative',
    },
    touchable: {
        position: 'relative',
    },
    glowEffect: {
        // position: 'absolute',
        // top: -10,
        // left: -10,
        // right: -10,
        // bottom: -10,
        // borderRadius: 25,
        // backgroundColor: 'rgba(102, 126, 234, 0.3)',
        // shadowColor: '#667eea',
        // shadowOffset: {
        //     width: 0,
        //     height: 0,
        // },
        // shadowOpacity: 0.8,
        // shadowRadius: 20,
        // elevation: 10,
    },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 25,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 8,
        // },
        // shadowOpacity: 0.15,
        // shadowRadius: 15,
        // elevation: 8,
        overflow: 'hidden',
        position: 'relative',
        minHeight: 140,
        width: '100%',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 50,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        transform: [{ rotate: '45deg' }],
    },
    particle1: {
        position: 'absolute',
        top: 10,
        right: 15,
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(102, 126, 234, 0.4)',
    },
    particle2: {
        position: 'absolute',
        top: 25,
        right: 25,
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: 'rgba(240, 147, 251, 0.5)',
    },
    particle3: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        width: 2,
        height: 2,
        borderRadius: 1,
        backgroundColor: 'rgba(118, 75, 162, 0.6)',
    },
    iconContainer: {
        position: 'relative',
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconBackground: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#667eea',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    iconImage: {
        width: 32,
        height: 32,
        // tintColor: 'white',
    },
    iconGlow: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(102, 126, 234, 0.3)',
        top: -10,
        left: -10,
    },
    textContainer: {
        alignItems: 'center',
        position: 'relative',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        color: '#2c3e50',
        textAlign: 'center',
        lineHeight: 18,
        textShadowColor: 'rgba(0,0,0,0.1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.5,
    },
    textUnderline: {
        width: 30,
        height: 2,
        backgroundColor: 'rgba(102, 126, 234, 0.4)',
        borderRadius: 1,
        marginTop: 5,
    },
    cornerDecoration1: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 20,
        height: 20,
        borderTopLeftRadius: 20,
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderColor: 'rgba(102, 126, 234, 0.2)',
    },
    cornerDecoration2: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 20,
        height: 20,
        borderBottomRightRadius: 20,
        borderBottomWidth: 3,
        borderRightWidth: 3,
        borderColor: 'rgba(240, 147, 251, 0.2)',
    },
    actionIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    outerBorder: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.1)',
        zIndex: -1,
    },
});

export default Card;