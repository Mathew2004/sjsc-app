import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 3; // 3 cards per row: 20px side padding + 10px gaps between cards

const Card = ({ item, icon, href }) => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity
            style={styles.cardContainer}
            onPress={() => navigation.navigate(href)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <Image source={icon} style={styles.iconImage} />
                <Text style={styles.cardTitle}>{item}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: cardWidth,
        margin: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 1,
        minHeight: 110,
    },
    iconImage: {
        width: 36,
        height: 36,
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        lineHeight: 14,
    },
});

export default Card;