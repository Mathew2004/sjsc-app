import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const MarksList = ({ navigation }) => {
    const [marksData, setMarksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // Added missing error state

    useFocusEffect(
        useCallback(() => {
            const fetchAttendanceData = async () => {
                const controller = new AbortController();
                try {
                    const Tid = await AsyncStorage.getItem('teacher-id');
                    if (!Tid) throw new Error("Teacher ID not found");

                    const res = await axios.get(
                        // `http://192.168.0.103:3000/api/v1/marks/all-reports?teacherId=${Tid}`,
                        `https://sjsc-backend-production.up.railway.app/api/v1/marks/all-reports?teacherId=${Tid}`,
                        { signal: controller.signal }
                    );

                    setMarksData(res.data.marksReport);
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        if (error.response) {
                            setError("An unexpected error occurred");
                        } else if (error.request) {
                            setError("Network error - please check your connection");
                        } else {
                            setError("An unexpected error occurred");
                        }
                    } else {
                        console.error(error);
                        setError(error.message || "Something went wrong");
                    }
                } finally {
                    setLoading(false);
                }

                return () => controller.abort();
            };

            fetchAttendanceData();
        }, [])
    );

    const handleButtonPress = (item) => {
        navigation.navigate('TakeMarks', {
            classId: item?.classId,
            groupId: item?.groupId,
            sectionId: item?.sectionId,
            marksId: item?.id,
            markId: item?.id,
            examName: item.Exam?.name,
            teacherId: item?.teacherId,
            mcq: item.Exam?.mcq,
            written: item.Exam?.written,
            practical: item.Exam?.practical,
            quiz: item.Exam?.quiz,
        });
    };

    const handleTakeMarks = (item) => {
        navigation.navigate('EditMarks', {
            classId: item?.classId,
            groupId: item?.groupId,
            sectionId: item?.sectionId,
            markId: item?.id,
            examName: item.Exam?.name,
            className: item.Class?.name,
            groupName: item.Group?.name,
            sectionName: item.Section?.name,
            shift: item?.shift,
            teacherId: item?.teacherId,
            mcq: item.Exam?.mcq,
            written: item.Exam?.written,
            practical: item.Exam?.practical,
            quiz: item.Exam?.quiz,
        });
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        // <View style={styles.container}>
        //     <Text style={styles.header}>Marks Sheets</Text>
        //     {error ? <Text style={styles.error}>{error}</Text> : null}
        //     {marksData.length > 0 ? (
        //         <FlatList
        //             data={marksData}
        //             renderItem={({ item }) => (
        //                 <View style={styles.rowContainer}>
        //                     <View style={{ flex: 1, alignItems: "center" }}>
        //                         <Text style={[styles.cell, { flex: 1 }]}>{item.Exam.name}</Text>
        //                         <Text style={{
        //                             color: item.isTaken ? "green" : "red",
        //                             fontWeight: "bold",
        //                         }}>
        //                             {item.isTaken ? "Given" : "Not Given"}
        //                         </Text>
        //                     </View>

        //                     <View style={{ flex: 2, marginLeft: 16 }}>
        //                         <Text style={styles.cell}>{item?.Class?.name}</Text>
        //                         <Text style={styles.cell}>
        //                             {item?.Group?.name || "N/A"} ({item?.Section?.name || "N/A"})
        //                         </Text>
        //                     </View>

        //                     <Text style={styles.cell}>{item?.Subject?.name}</Text>

        //                     <TouchableOpacity
        //                         onPress={() =>
        //                             item.isTaken ? handleTakeMarks(item) : handleButtonPress(item)
        //                         }
        //                         style={{ flex: 1, alignItems: "flex-end" }}
        //                     >
        //                         <Text style={styles.editIcon}>✏️</Text>
        //                     </TouchableOpacity>
        //                 </View>
        //             )}
        //             keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
        //         />
        //     ) : (
        //         <Text>No attendance records found.</Text>
        //     )}
        // </View>
        <View style={styles.container}>
            <Text style={styles.header}>Marks Sheets</Text>
            {error ? <Text style={styles.error}>{error}</Text> : null}

            {marksData.length > 0 ? (
                <ScrollView style={{ flexGrow: 1 }}>
                    {marksData.map((item) => (
                        <View key={item?.id || Math.random().toString()} style={styles.rowContainer}>
                            <View style={{ flex: 1, alignItems: "center" }}>
                                <Text style={[styles.cell, { flex: 1 }]}>{item.Exam.name}</Text>
                                <Text style={{
                                    color: item.isTaken ? "green" : "red",
                                    fontWeight: "bold",
                                }}>
                                    {item.isTaken ? "Given" : "Not Given"}
                                </Text>
                            </View>

                            <View style={{ flex: 2, marginLeft: 16 }}>
                                <Text style={styles.cell}>{item?.Class?.name}</Text>
                                <Text style={styles.cell}>
                                    {item?.Group?.name || "N/A"} ({item?.Section?.name || "N/A"})
                                </Text>
                            </View>

                            <Text style={styles.cell}>{item?.Subject?.name}</Text>

                            <TouchableOpacity
                                onPress={() =>
                                    item.isTaken ? handleTakeMarks(item) : handleButtonPress(item)
                                }
                                style={{ flex: 1, alignItems: "flex-end" }}
                            >
                                <Text style={styles.editIcon}>✏️</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            ) : (
                <Text>No Marks records found.</Text>
            )}
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    error: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
    },
    rowContainer: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e0e0e0",
    },
    cell: {
        flex: 1,
        textAlign: 'center',
    },
    editIcon: {
        fontSize: 20,
        color: "blue",
        fontWeight: "bold",
    }
});

export default MarksList;
