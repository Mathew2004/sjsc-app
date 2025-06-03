import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { use } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';


export default function TakeAttendance() {
    const navigation = useNavigation();

    const route = useRoute();
    const { classId, groupId, sectionId, shift, attendanceId } = route.params || {};
    console.log("shift", shift);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [proccessing, setProccessing] = useState(false);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            if (!classId) {
                alert('Invalid classId or groupId');
            }
            const res = await axios.get(`https://sjsc-backend-production.up.railway.app/api/v1/students/fetch?classId=${classId}&groupId=${groupId || ''}&sectionId=${sectionId || ''}&shift=${shift || ''}`);
            setData(res.data);
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

    useEffect(() => {
        fetchStudents();
    }, []);

    const ToggleStudent = (id) => {
        setSelectedStudents(prev => {
            if (prev.includes(id)) {
                return prev.filter(studentId => studentId !== id);
            }
            return [...prev, id];
        });
    };

    const ToggleselectAll = () => {
        if (selectedStudents.length === data.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(data.map(student => student.id));
        }
    };

    // Unselected students
    const unselectedStudents = data.filter(student => !selectedStudents.includes(student.id)).map(student => student.id);
    // console.log("Absent Students", unselectedStudents);

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            setProccessing(true);
            const studentRecords = data.map((student) => ({
                studentId: student.id,
                status: selectedStudents.includes(student.id) ? "Present" : "Absent",
            }));

            console.log("Student Records", studentRecords);
            console.log("Attendance ID", attendanceId);
            // Submit attendance data
            const response = await axios.post(
                `https://sjsc-backend-production.up.railway.app/api/v1/attendance/take/attendance`,
                {
                    attendanceId: attendanceId,
                    studentRecords,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 201) {
                alert("Attendance recorded successfully!");
                navigation.navigate('ViewAttendance', { id: attendanceId });
            } else {
                alert("Unexpected response from the server");
            }
            setProccessing(false);
        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
                navigation.navigate('Home');
            } else {
                console.error("Error message:", error.message);
            }
            setProccessing(false);
        }
    };

    if (loading || !data) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        // <View style={styles.container}>
        //     <View style={{
        //         flexDirection: 'row',
        //         justifyContent: 'flex-end',
        //         alignItems: 'center',
        //         padding: 6,
        //     }}>
        //         {/* <Text style={{ fontSize: 16, fontWeight: 'bold' }}
        //         >{className} | {groupName} | {sectionName || ""}  </Text> */}
        //         <TouchableOpacity
        //             style={{ padding: 1, color: 'blue' }}
        //             onPress={ToggleselectAll}
        //         >
        //             <Text>{selectedStudents.length === data.length ? 'Deselect All' : 'Select All'}</Text>
        //         </TouchableOpacity>
        //     </View>

        //     {data.length === 0 && <Text style={{
        //         color: 'red',
        //         fontSize: 16,
        //         textAlign: 'center',
        //         marginTop: 20
        //     }}>No students found</Text>}
        //     <FlatList
        //         data={data}
        //         keyExtractor={item => item.id.toString()}
        //         renderItem={({ item }) => (
        //             <TouchableOpacity
        //                 style={styles.dropdown}
        //                 onPress={() => ToggleStudent(item.id)}
        //             >
        //                 <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: "start", padding: 10 }}>
        //                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        //                         <Text>{item.roll}</Text>
        //                         {/* <Image source={{ uri: "https://i.ibb.co.com/zWb8jL6w/360-F-77711294-BA5-QTjtg-GPm-LKCXGdtb-Ag-Zci-L4k-Ew-Cnx.jpg" }}
        //                             style={{ width: 30, height: 30 }}
        //                         /> */}
        //                     </View>
        //                     <Text>{item.name}</Text>
        //                     <Text>{selectedStudents.includes(item.id) ? '✅' : '⬜'}</Text>
        //                 </View>
        //             </TouchableOpacity>
        //         )}
        //     />

        //     <TouchableOpacity
        //         style={styles.submitButton}
        //         onPress={() => handleSubmit()}
        //     >
        //         {proccessing ? <ActivityIndicator color="white" /> : null}
        //         <Text style={{ color: 'white', textAlign: 'center' }}>Submit</Text>
        //     </TouchableOpacity>

        // </View>
        <View style={styles.container}>
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    padding: 6,
                }}
            >
                <TouchableOpacity style={{ padding: 1, color: "blue" }} onPress={ToggleselectAll}>
                    <Text>{selectedStudents.length === data.length ? "Deselect All" : "Select All"}</Text>
                </TouchableOpacity>
            </View>

            {data.length === 0 && (
                <Text
                    style={{
                        color: "red",
                        fontSize: 16,
                        textAlign: "center",
                        marginTop: 20,
                    }}
                >
                    No students found
                </Text>
            )}

            {/* Replacing FlatList with ScrollView */}
            <ScrollView style={{ flexGrow: 1 }}>
                {data.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.dropdown}
                        onPress={() => ToggleStudent(item.id)}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: 10,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Text>{item.roll}</Text>
                            </View>
                            <Text>{item.name}</Text>
                            <Text>{selectedStudents.includes(item.id) ? "✅" : "⬜"}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                {proccessing ? <ActivityIndicator color="white" /> : null}
                <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>
            </TouchableOpacity>
        </View>


    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        marginBottom: 0,
    },
    dropdown: {
        marginVertical: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        flex: 1,
        justifyContent: 'start',
        alignItems: 'start',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    error: {
        color: 'red',
        fontSize: 16
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        backgroundColor: 'green',
        borderRadius: 5,
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
});