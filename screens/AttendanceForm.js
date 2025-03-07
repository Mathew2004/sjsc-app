import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Button, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from "@react-native-community/datetimepicker";


// export default function AttendanceForm() {
//     const navigation = useNavigation();

//     // API States
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     // Set Full Data
//     const [fullData, setFullData] = useState([]);

//     //   School or College
//     const [schoolItems, setSchoolItems] = useState([
//         { label: "School", value: "school" },
//         { label: "College", value: "college" }
//     ]);
//     const [schoolValue, setSchoolValue] = useState(null);
//     const [openSchool, setOpenSchool] = useState(false);

//     //   Shift
//     const [shiftItems, setShiftItems] = useState([
//         { label: "Morning", value: "Morning" },
//         { label: "Day", value: "Day" }
//     ]);
//     const [shiftValue, setShiftValue] = useState(null);
//     const [openShift, setOpenShift] = useState(false);

//     // Data States
//     const [classes, setClasses] = useState([]);

//     // Dropdown States
//     const [openClass, setOpenClass] = useState(false);
//     const [classValue, setClassValue] = useState(null);
//     const [classItems, setClassItems] = useState([]);

//     const [openGroup, setOpenGroup] = useState(false);
//     const [groupValue, setGroupValue] = useState(null);
//     const [groupItems, setGroupItems] = useState([]);

//     const [openSection, setOpenSection] = useState(false);
//     const [sectionValue, setSectionValue] = useState(null);
//     const [sectionItems, setSectionItems] = useState([]);

//     // Fetch Classes on Mount
//     useEffect(() => {
//         const fetchClasses = async () => {
//             try {
//                 // console.log(process.env.URL);
//                 const res = await axios.get("https://sjsc-backend-production.up.railway.app/api/v1/settings/fetch/class");
//                 setClasses(res.data.data);
//                 setClassItems(res.data.data.map(cls => ({
//                     label: cls.name,
//                     value: cls.id
//                 })));
//             } catch (err) {
//                 console.log(err);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchClasses();
//     }, []);

//     // Update Groups/Sections when class changes
//     useEffect(() => {
//         if (classValue) {
//             const selectedClass = classes.find(c => c.id === classValue);

//             setGroupItems(selectedClass.Groups.map(g => ({
//                 label: g.name,
//                 value: g.id
//             })));

//             setSectionItems(selectedClass.Sections.map(s => ({
//                 label: s.name,
//                 value: s.id
//             })));
//         }
//         setGroupValue(null);
//         setSectionValue(null);
//     }, [classValue]);

//     const handleSubmit = async () => {
//         try {
//             const payload = {
//                 classId: classValue,
//                 groupId: groupValue,
//                 sectionId: sectionValue
//             };

//             // console.log('Submission successful:', payload);
//             // Pass payload to next screen\
//             navigation.navigate('TakeAttendance', { 
//                 classId: classValue,
//                 groupId: groupValue,
//                 sectionId: sectionValue,
//                 className : classItems.find(c => c.value === classValue).label,
//                 groupName : groupItems.find(g => g.value === groupValue)?.label,
//                 sectionName : sectionItems.find(s => s.value === sectionValue)?.label
//              });



//         } catch (error) {
//             console.error('Submission failed:', error);
//         }
//     };

//     if (loading) {
//         return (
//             <View style={styles.center}>
//                 <ActivityIndicator size="large" />
//             </View>
//         );
//     }


//     if (error) {
//         return (
//             <View style={styles.center}>
//                 <Text style={styles.error}>{error}</Text>
//             </View>
//         );
//     }

//     return (
//         <View style={styles.container}>
//             {/* School or COllege Dropdown */}
//             <DropDownPicker
//                 open={openSchool}
//                 value={schoolValue}
//                 items={schoolItems}
//                 setOpen={setOpenSchool}
//                 setValue={setSchoolValue}
//                 setItems={setSchoolItems}
//                 placeholder="Select School or College"
//                 style={styles.dropdown}
//                 zIndex={3000}
//             />
//             {/* Shfit Dropdown */}
//             {schoolValue == "school" && (
//                 <DropDownPicker
//                     open={openShift}
//                     value={shiftValue}
//                     items={shiftItems}
//                     setOpen={setOpenShift}
//                     setValue={setShiftValue}
//                     setItems={setShiftItems}
//                     placeholder="Select Shift"
//                     style={styles.dropdown}
//                     zIndex={2500}
//                 />
//             )}
//             {/* Class Dropdown */}
//             <DropDownPicker
//                 open={openClass}
//                 value={classValue}
//                 items={classItems}
//                 setOpen={setOpenClass}
//                 setValue={setClassValue}
//                 setItems={setClassItems}
//                 placeholder="Select Class"
//                 style={styles.dropdown}
//                 zIndex={2000}
//             />

//             {/* Group Dropdown (only if class has groups) */}
//             {classValue && groupItems.length > 0 && (
//                 <DropDownPicker
//                     open={openGroup}
//                     value={groupValue}
//                     items={groupItems}
//                     setOpen={setOpenGroup}
//                     setValue={setGroupValue}
//                     setItems={setGroupItems}
//                     placeholder="Select Group"
//                     style={styles.dropdown}
//                     zIndex={1500}
//                 />
//             )}

//             {/* Section Dropdown (only if class has sections) */}
//             {classValue && sectionItems.length > 0 && (
//                 <DropDownPicker
//                     open={openSection}
//                     value={sectionValue}
//                     items={sectionItems}
//                     setOpen={setOpenSection}
//                     setValue={setSectionValue}
//                     setItems={setSectionItems}
//                     placeholder="Select Section"
//                     style={styles.dropdown}
//                     zIndex={1300}
//                 />
//             )}

//             {(groupValue || sectionValue) && (
//                 <Button
//                     title="Submit Selection"
//                     onPress={handleSubmit}
//                     color="#2196F3"
//                 />
//             )}
//         </View>
//     );
// };

export default function AttendanceCard() {
    const navigation = useNavigation();

    // API States
    const [loading, setLoading] = useState(true);

    const [data, setData] = useState();

    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const teacherId = await AsyncStorage.getItem("teacher-id");
                if (!teacherId) {
                    console.log("Teacher ID not found");
                    return;
                }
                const res = await axios.get(`https://sjsc-backend-production.up.railway.app/api/v1/teachers/fetch/${teacherId}`);
                setData(res.data.teacher);
            } catch (err) {
                console.error("Error fetching classes:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClasses();
    }, []);


    // const fetchAttendance = async () => {
    //     try {
    //         const Tid = await AsyncStorage.getItem("teacher-id");
    //         const token = await AsyncStorage.getItem("token");
    //         const response = await axios.get(
    //             `https://sjsc-backend-production.up.railway.app/api/v1/attendance/fetch/reports`,
    //             {
    //               headers: {
    //                 Authorization: `Bearer ${token}`,
    //               },
    //             }
    //           );
    //         // console.log(response.data);
    //     } catch (error) {
    //         console.error("Error fetching attendance:", error);
    //     }
    // };

    const fetchReports = async () => {
        try {
            const Tid = await AsyncStorage.getItem("teacher-id");
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get(
                `https://sjsc-backend-production.up.railway.app/api/v1/attendance/fetch/reports`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data);
        } catch (error) {
            console.error("Error fetching attendance:", error);
        }
    }

    useEffect(() => {
        fetchAttendance();
    }, []);

            

    const takeAttendance = async (classId, sectionId, groupId) => {
        try {
            const Tid = await AsyncStorage.getItem("teacher-id");
            const token = await AsyncStorage.getItem("token");

            const response = await axios.post(
                `https://sjsc-backend-production.up.railway.app/api/v1/attendance/create/report`,
                {
                    teacherId: parseInt(Tid),
                    classId,
                    sectionId,
                    groupId,
                    date,
                    remarks: "",
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // console.log(response.data.data.id);
            if (response.data.message == "Attendance report created successfully") {
                navigation.navigate("TakeAttendance", {
                    classId: data?.assignedClasses[0]?.id,
                    sectionId: data?.assignedSections[0]?.id,
                    groupId: data?.assignedGroups[0]?.id,
                    attendanceId: response.data.data.id,
                });
                console.log("POOKIE");
            }
        } catch (error) {
            console.error("Error taking attendance:", error);
        }
    }

    return (
        <View style={styles.container}>
            {/* <Text style={{
                fontSize: 20,
                fontWeight: "bold",
            }}>Assigned Class</Text> */}

            {loading ?
                <ActivityIndicator size="large" /> :
                (
                    <View style={styles.card}>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Class:</Text>
                            <Text style={styles.value}>{data?.assignedClasses[0]?.name || "N/A"}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Section:</Text>
                            <Text style={styles.value}>{data?.assignedSections[0]?.name || "N/A"}</Text>
                        </View>
                        <View style={styles.infoContainer}>
                            <Text style={styles.label}>Group:</Text>
                            <Text style={styles.value}>{data?.assignedGroups[0]?.name || "N/A"}</Text>
                        </View>
                        {/* Date Picker */}
                        <TouchableOpacity style={styles.datePicker} onPress={() => setShowPicker(true)}>
                            <Text style={styles.dateText}>📅 {date.toDateString()}</Text>
                        </TouchableOpacity>

                        {showPicker && (
                            <DateTimePicker
                                value={date}
                                mode="date"
                                display="default"
                                onChange={onChange}
                            />
                        )}
                        <Button
                            title="Take Attendance"
                            onPress={() => takeAttendance(data?.assignedClasses[0]?.id, data?.assignedSections[0]?.id, data?.assignedGroups[0]?.id)}
                            color="#007BFF"
                        />
                    </View>
                )}
        </View>
    );
}


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
