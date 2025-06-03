import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from '@react-navigation/native';


const TeacherDropdownForm = () => {
    const navigation = useNavigation();

    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);

    //  Date 
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

    const onChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }

    };

    // State for School Dropdown
    const [schoolItems, setSchoolItems] = useState([
        { label: "School", value: "school" },
        { label: "College", value: "college" }
    ]);
    const [schoolValue, setSchoolValue] = useState(null);
    const [openSchool, setOpenSchool] = useState(false);

    // State for Shift Dropdown
    const [openShift, setOpenShift] = useState(false);
    const [shiftValue, setShiftValue] = useState(null);
    const [shiftItems, setShiftItems] = useState([]);


    // State for Class Dropdown
    const [openClass, setOpenClass] = useState(false);
    const [classValue, setClassValue] = useState(null);
    const [classItems, setClassItems] = useState([]);

    // State for Group Dropdown
    const [openGroup, setOpenGroup] = useState(false);
    const [groupValue, setGroupValue] = useState(null);
    const [groupItems, setGroupItems] = useState([]);

    // State for Section Dropdown
    const [openSection, setOpenSection] = useState(false);
    const [sectionValue, setSectionValue] = useState(null);
    const [sectionItems, setSectionItems] = useState([]);

    const [submitting, setSubmitting] = useState(false);

    // Fetch Teacher Data
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const Tid = await AsyncStorage.getItem('teacher-id');
                const res = await axios.get(
                    `https://sjsc-backend-production.up.railway.app/api/v1/teachers/fetch/${Tid}`
                );
                setTeacherData(res.data.teacher);
                setLoading(false);

                // Set Class Items
                const classes = res.data.teacher.assignedClasses?.map(cls => ({
                    label: cls.name,
                    level: cls.level,
                    value: cls.id,
                }));
                setClassItems(classes);
                setShiftItems(res.data.teacher.assignedShift?.map(shift => ({
                    label: shift,
                    value: shift,
                })));
            } catch (error) {
                console.error('Error fetching teacher data:', error);
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, []);

    // On navigate back to this screen, reset the state
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                setOpenSchool(false); 
            };
        }, [])
    );



    useEffect(() => {
        if (classValue && teacherData) {
            const groups = teacherData.assignedGroups
                ?.filter(group => group.Class.id === classValue)
                ?.map(group => ({
                    label: group.name,
                    value: group.id,
                }));
            setGroupItems(groups);
            setGroupValue(null);
            setSectionValue(null);
        }
    }, [classValue, teacherData]);


    // Update Section Items when Group is selected
    useEffect(() => {
        if (classValue && teacherData) {
            const sections = teacherData.assignedSections
                ?.filter(section => section.Class.id === classValue)
                ?.map(section => ({
                    label: section.name,
                    value: section.id,
                }));
            setSectionItems(sections);
            setSectionValue(null);
        }
    }, [classValue, teacherData]);

    const handleSubmit = async () => {
        try {
            const payload = {
                classId: classValue,
                groupId: groupValue,
                sectionId: sectionValue,
                date: date,
            };

            console.log('Submission successful:', payload);
            // Pass payload to next screen\
            // navigation.navigate('TakeAttendance', {
            //     classId: classValue,
            //     groupId: groupValue,
            //     sectionId: sectionValue,
            // });



        } catch (error) {
            console.error('Submission failed:', error);
        }
    };

    const takeAttendance = async () => {
        try {
            const Tid = await AsyncStorage.getItem("teacher-id");
            const token = await AsyncStorage.getItem("token");
            console.log(parseInt(Tid),
                classValue,
                sectionValue,
                groupValue,
            )

            setSubmitting(true);

            const response = await axios.post(
                // `http://192.168.0.101:3000/api/v1/attendance/create/report`,
                `https://sjsc-backend-production.up.railway.app/api/v1/attendance/create/report`,
                {
                    teacherId: parseInt(Tid),
                    classId: classValue,
                    sectionId: sectionValue || null,
                    groupId: groupValue || null,
                    shift: shiftValue || null,
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

            setSubmitting(false);
            if (response.data.message == "Attendance report created successfully") {
                navigation.navigate("TakeAttendance", {
                    classId: classValue,
                    sectionId: sectionValue || null,
                    groupId: groupValue || null,
                    shift: shiftValue || null,
                    attendanceId: response.data.data.id,
                });
                // console.log(response.data);
            } else {
                if (response.data.id && response.data.isTaken == false) {
                    navigation.navigate("TakeAttendance", {
                        classId: classValue,
                        sectionId: sectionValue,
                        groupId: groupValue,
                        shift: shiftValue,
                        attendanceId: response?.data?.id,
                    });
                } else {
                    alert(response.data.message);
                    navigation.navigate("Home");
                }
            }
        } catch (error) {
            if (error.response) {
                alert(error.response.data.error);
                console.log("Error response:", error.response.data);

            } else {
                console.error("Error message:", error.message);
            }
        }
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <ScrollView>
            <View
                style={styles.container}
            >
                {/* Level Dropdown */}
                <Text style={styles.label}>Level</Text>
                
                <DropDownPicker
                    open={openSchool}
                    value={schoolValue}
                    items={schoolItems}
                    setOpen={setOpenSchool}
                    setValue={setSchoolValue}
                    setItems={setSchoolItems}
                    placeholder="Select School or College"
                    style={styles.dropdown}
                    zIndex={4000}
                    dropDownContainerStyle={styles.dropdownContainer}
                />

                {schoolValue === "school" && (
                    <>
                        <Text style={styles.label}>Shift</Text>
                        <DropDownPicker
                            open={openShift}
                            value={shiftValue}
                            items={shiftItems}
                            setOpen={setOpenShift}
                            setValue={setShiftValue}
                            setItems={setShiftItems}
                            placeholder="Select Shift"
                            style={styles.dropdown}
                            zIndex={3300}
                            dropDownContainerStyle={styles.dropdownContainer}
                        />
                    </>
                )}

                {/* Class Dropdown */}
                <Text style={styles.label}>Class</Text>
                <DropDownPicker
                    open={openClass}
                    value={classValue}
                    items={classItems.filter(item => item.level.toLowerCase() === schoolValue)}
                    setOpen={setOpenClass}
                    setValue={setClassValue}
                    setItems={setClassItems}
                    placeholder="Select Class"
                    style={styles.dropdown}
                    disabled={!schoolValue}
                    zIndex={3000}
                    dropDownContainerStyle={styles.dropdownContainer}
                />

                {/* Group Dropdown */}
                <Text style={styles.label}>Group</Text>
                <DropDownPicker
                    open={openGroup}
                    value={groupValue}
                    items={groupItems}
                    setOpen={setOpenGroup}
                    setValue={setGroupValue}
                    setItems={setGroupItems}
                    placeholder="Select Group"
                    style={styles.dropdown}
                    zIndex={2000}
                    disabled={!classValue}
                    dropDownContainerStyle={styles.dropdownContainer}
                />

                {/* Section Dropdown */}
                <Text style={styles.label}>Section</Text>
                <DropDownPicker
                    open={openSection}
                    value={sectionValue}
                    items={sectionItems}
                    setOpen={setOpenSection}
                    setValue={setSectionValue}
                    setItems={setSectionItems}
                    placeholder="Select Section"
                    style={styles.dropdown}
                    zIndex={1000}
                    disabled={!classValue}
                // dropDownContainerStyle={styles.dropdownContainer}
                />

                {/* Date Picker */}
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                    style={styles.datePicker}
                    onPress={() => setShowPicker(true)}
                >
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

                {/* Submit Button */}
                {classValue && (groupValue || sectionValue) && (
                    <TouchableOpacity style={styles.submitButton} onPress={takeAttendance} disabled={submitting}>
                        {submitting ? <ActivityIndicator color="white" /> : null}
                        <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    label: {
        fontSize: 14,
        marginVertical: 5,
    },
    dropdown: {
        marginBottom: 1,
        border: 1,
        borderColor: '#ccc',
    },
    datePicker: {
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        borderColor: '#ccc',
        marginBottom: 10,
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

export default TeacherDropdownForm;