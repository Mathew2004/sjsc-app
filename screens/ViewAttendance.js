import React, { useEffect, useState, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

const ViewAttendance = () => {
    const route = useRoute();
    const { id } = route.params;
    const navigation = useNavigation();
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useFocusEffect(
        useCallback(() => {
            const fetchAttendanceData = async () => {
                try {
                    const token = await AsyncStorage.getItem("token");
                    const response = await axios.get(
                        `https://sjsc-backend-production.up.railway.app/api/v1/attendance/fetch/report/${id}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    setAttendanceData(response.data);
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
                        // setError(error);
                        console.log(error);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchAttendanceData();
        }, [id])
    );


    const totalStudent = attendanceData?.Attendances.length;

    const [filter, setFilter] = useState("Absent");

    const filteredRows = attendanceData?.Attendances?.filter(
        (row) => row.status === filter
    );



    if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
    if (error) return <Text>Error: {error.message}</Text>;

    return (
        <ScrollView style={styles.container}>
            {/* Attendance Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Attendance Information</Text>
                <View style={styles.grid}>
                    {[
                        { label: "Date", value: new Date(attendanceData.date).toLocaleDateString() },
                        { label: "Teacher", value: attendanceData?.Teacher?.name },
                        { label: "Class", value: attendanceData?.Class?.name },
                        { label: "Group", value: attendanceData?.Group?.name },
                        { label: "Section", value: attendanceData?.Section?.name },
                        { label: "Total Student", value: totalStudent },
                        { label: "Total Present", value: attendanceData.totalPresent },
                        { label: "Total Absent", value: attendanceData.totalAbsent },
                        { label: "Remarks", value: attendanceData.remarks || "N/A" },
                    ].map((item, index) => (
                        <View key={index} style={styles.gridItem}>
                            <Text style={styles.label}>{item.label}</Text>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Filter */}
            <View style={styles.filterBar}>
                {["Present", "Absent"].map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        onPress={() => setFilter(tag)}
                        style={[
                            styles.filterBtn,
                            filter === tag && styles.filterBtnActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                filter === tag && styles.filterTextActive,
                            ]}
                        >
                            {tag}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Attendance Report Table Section */}
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Attendance Report</Text>
                <View>
                    {filteredRows?.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <View style={{ width: "70%" }}>
                                <Text style={styles.cell}>{item.Student.roll}. {item.Student.name}</Text>
                            </View>
                            <View
                                style={[
                                    styles.status,
                                    item.status === "Present" ? styles.statusPresent : styles.statusAbsent,
                                ]}
                            >
                                <Text style={styles.statusText}>{item.status}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>
            <View style={{ height: 100 }}></View>
        </ScrollView >

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
    },
    section: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#333",
        textAlign: "center",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    gridItem: {
        width: "48%",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    label: {
        fontSize: 14,
        color: "#666",
    },
    value: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
        marginTop: 4,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#007bff",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 5,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    cell: {
        flex: 1,
        fontSize: 14,
        color: "#333",
    },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusPresent: {
        backgroundColor: "#d4edda",
    },
    statusAbsent: {
        backgroundColor: "#f8d7da",
    },
    statusText: {
        fontSize: 14,
        fontWeight: "bold",
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 16,
    },
    editButton: {
        backgroundColor: "#28a745",
        marginRight: 8,
    },
    deleteButton: {
        backgroundColor: "#dc3545",
    },
    /* ---------- filter styles ---------- */
    filterBar: {                                
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 12,
    },
    filterBtn: {                                  
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#007bff",
        marginHorizontal: 6,
        backgroundColor: "#fff",
    },
    filterBtnActive: {                            
        backgroundColor: "#007bff",
    },
    filterText: {                               
        color: "#007bff",
        fontWeight: "bold",
    },
    filterTextActive: {                         
        color: "#fff",
    },
});

export default ViewAttendance;