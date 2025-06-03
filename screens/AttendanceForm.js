import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Text, TouchableOpacity, FlatList } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from 'react-native';
import TeacherDropdownForm from '../components/Form';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <TeacherDropdownForm />
    </SafeAreaView>
  );
};


export default App;

export function Attendance() {
    return (
        <View style={styles.container}>
            <Text>Students List</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20
    },
    dropdown: {
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: 'red',
        fontSize: 16
    }, card: {
        backgroundColor: "#ffffff",
        padding: 15,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        margin: 10,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    infoContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    label: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
    },
    value: {
        fontSize: 16,
        color: "#555",
    },
    datePicker: {
        backgroundColor: "#f8f9fa",
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 10,
        alignItems: "center",
    },
    dateText: {
        fontSize: 16,
        color: "#333",
    },
});
