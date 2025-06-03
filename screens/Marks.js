import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView, KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";

const Marks = () => {
    const navigation = useNavigation();

    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

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

    // State for Section Dropdown
    const [openExam, setOpenExam] = useState(false);
    const [examValue, setExamValue] = useState(null);
    const [examItems, setExamItems] = useState([]);

    // State for Subjects Dropdown
    const [openSubject, setOpenSubject] = useState(false);
    const [subjectValue, setSubjectValue] = useState(null);
    const [subjectItems, setSubjectItems] = useState([]);

    // Fetch Teacher Data
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const Tid = await AsyncStorage.getItem('teacher-id');
                const res = await axios.get(
                    // `http://192.168.0.103:3000/api/v1/teachers/fetch/${Tid}`
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
                setSubjectItems(res.data.teacher.assignedSubjects?.map(subject => ({
                    label: `${subject.name} (${subject.Class.level == "College" ? "college" : subject.Class.level})`,
                    class: subject.Class.id,
                    level: subject.Class.level,
                    value: subject.id,
                })));

            } catch (error) {
                console.error('Error fetching teacher data:', error);
                setLoading(false);
            }
        };

        const fetchExams = async () => {
            try {
                const res = await axios.get(`https://sjsc-backend-production.up.railway.app/api/v1/exam`);
                // console.log(res.data.exams);
                setExamItems(res.data.exams.map(exam => ({
                    label: exam.name,
                    classId: exam.Class.id,
                    mcq: exam.mcq,
                    written: exam.written,
                    practical: exam.practical,
                    quiz: exam.quiz,
                    value: exam.id,
                })));
            } catch (error) {
                console.error('Error fetching exams:', error);
            }
        };

        fetchExams();
        fetchTeacherData();
    }, []);

    // Update Group Items when Class is selected
    // useEffect(() => {
    //     if (teacherData) {
    //         const shifts = teacherData.assignedShift
    //             ?.map(shift => shift)

    //         setShiftItems(shifts);
    //         setGroupItems(null);
    //         setGroupValue(null);
    //         setSectionValue(null);
    //     }
    // }, [schoolValue, teacherData]);

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

    useEffect(() => {
        setShiftValue(null);
    }, [schoolValue]);

    const TakeMarks = async () => {
        try {
            const Tid = await AsyncStorage.getItem("teacher-id");
            const token = await AsyncStorage.getItem("token");
            const payload = {
                teacherId: parseInt(Tid),
                classId: classValue || null,
                groupId: groupValue || null,
                sectionId: sectionValue || null,
                examId: examValue || null,
                subjectId: subjectValue || null,
                shift: shiftValue || null,
            };

            // console.log(payload);

            setSubmitting(true);
            const response = await axios.post(
                `https://sjsc-backend-production.up.railway.app/api/v1/marks/create-report`,
                // `http://192.168.0.103:3000/api/v1/marks/create-report`,
                { ...payload },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.status == "success") {
                navigation.navigate("TakeMarks", {
                    classId: classValue,
                    sectionId: sectionValue || null,
                    groupId: groupValue || null,
                    shift: shiftValue || null,
                    markId: response.data.data.id,
                    examId: examValue || null,
                    examName: examItems.find(exam => exam.value === examValue).label,
                    teacherId: parseInt(Tid),
                    subjectId: subjectValue || null,
                    mcq: examItems.find(exam => exam.value === examValue).mcq,
                    written: examItems.find(exam => exam.value === examValue).written,
                    practical: examItems.find(exam => exam.value === examValue).practical,
                    quiz: examItems.find(exam => exam.value === examValue).quiz,
                });
                // console.log(response.data);
            }
            if (response.data.status == "exist") {
                // console.log(response.data);
                navigation.navigate("EditMarks", {
                    classId: classValue,
                    sectionId: sectionValue,
                    groupId: groupValue,
                    shift: shiftValue,
                    markId: response.data?.marksId,
                    examName: examItems.find(exam => exam.value === examValue).label,
                    className: classItems.find(item => item.value === classValue)?.label,
                    sectionName: sectionItems.find(item => item.value === sectionValue)?.label,
                    groupName: groupItems.find(item => item.value === groupValue)?.label,
                    teacherId: parseInt(Tid),
                    mcq: examItems.find(exam => exam.value === examValue).mcq,
                    written: examItems.find(exam => exam.value === examValue).written,
                    practical: examItems.find(exam => exam.value === examValue).practical,
                    quiz: examItems.find(exam => exam.value === examValue).quiz,
                });
            }
            setSubmitting(false);

        } catch (error) {
            if (error.response) {
                alert(error.response.data.message);
                console.log("Error response:", error.response);

            } else {
                console.error("Error message:", error.message);
            }
        }
    }


    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>

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
                        dropDownContainerStyle={styles.dropdownContainer}
                    />

                    <Text style={styles.label}>Exam</Text>
                    <DropDownPicker
                        open={openExam}
                        value={examValue}
                        items={examItems.filter(item => item.classId === classValue)}
                        setOpen={setOpenExam}
                        setValue={setExamValue}
                        setItems={setExamItems}
                        placeholder="Select Exam"
                        style={styles.dropdown}
                        zIndex={100}
                        disabled={!classValue}
                        dropDownContainerStyle={styles.dropdownContainer}
                    />

                    <Text style={styles.label}>Subject</Text>
                    <DropDownPicker
                        open={openSubject}
                        value={subjectValue}
                        items={subjectItems}
                        setOpen={setOpenSubject}
                        setValue={setSubjectValue}
                        setItems={setSubjectItems}
                        placeholder="Select Subject"
                        style={styles.dropdown}
                        zIndex={80}
                        disabled={!classValue}
                        dropDownContainerStyle={styles.dropdownContainer}
                    />

                    {/* Subject Display */}
                    {/* <Text style={styles.label}>
                        Subject :
                        <Text style={{ color: 'red' }}>
                            {teacherData?.Subject?.name}
                        </Text>
                    </Text> */}

                    {/* Submit Button */}
                    {classValue && (groupValue || sectionValue) && (
                        <TouchableOpacity style={styles.submitButton} onPress={TakeMarks} disabled={submitting}>
                            {submitting ? <ActivityIndicator color="white" /> : null}
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    )}

                </View>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
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

export default Marks;