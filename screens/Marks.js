import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, ActivityIndicator,
    TouchableOpacity, ScrollView, KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    Animated,
    Dimensions
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

const Marks = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Animation setup
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start();

        // Pulse animation loop
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

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
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading marks dashboard...</Text>
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                    </View>
                </View>
            </View>
        );
    }

    return (
        <Animated.View style={[styles.mainContainer]}>
            <Animated.View
                style={[
                    styles.backgroundPattern,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
                    }
                ]}
            >
                {/* Floating Background Elements */}
                <View style={[styles.floatingShape, styles.shape1]} />
                <View style={[styles.floatingShape, styles.shape2]} />
                <View style={[styles.floatingShape, styles.shape3]} />
                <View style={[styles.floatingShape, styles.shape4]} />
            </Animated.View>

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.container}>
                            {/* Header Section */}
                            <View style={styles.headerSection}>
                                <Text style={styles.headerTitle}>📝 Marks Management</Text>
                                <Text style={styles.headerSubtitle}>Configure exam and class details</Text>
                                <View style={styles.headerDecoration} />
                            </View>

                            {/* Level Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="school" size={18} color="#6C63FF" />
                                    <Text style={styles.label}>Educational Level</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openSchool}
                                        value={schoolValue}
                                        items={schoolItems}
                                        setOpen={setOpenSchool}
                                        setValue={setSchoolValue}
                                        setItems={setSchoolItems}
                                        placeholder="🎓 Select School or College"
                                        style={styles.dropdown}
                                        textStyle={styles.dropdownText}
                                        zIndex={4000}
                                        listMode="SCROLLVIEW"
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {schoolValue === "school" && (
                                <Animated.View style={[styles.inputGroup, { opacity: fadeAnim }]}>
                                    <View style={styles.labelContainer}>
                                        <Ionicons name="time" size={18} color="#FF6B6B" />
                                        <Text style={styles.label}>Shift</Text>
                                    </View>
                                    <View style={styles.dropdownWrapper}>
                                        <DropDownPicker
                                            open={openShift}
                                            value={shiftValue}
                                            items={shiftItems}
                                            setOpen={setOpenShift}
                                            setValue={setShiftValue}
                                            setItems={setShiftItems}
                                            placeholder="🌅 Select Shift"
                                            style={styles.dropdown}
                                            textStyle={styles.dropdownText}
                                            zIndex={3300}
                                            listMode="SCROLLVIEW"
                                            dropDownContainerStyle={styles.dropdownContainer}
                                        />
                                        <View style={styles.dropdownGlow} />
                                    </View>
                                </Animated.View>
                            )}

                            {/* Class Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="book" size={18} color="#4ECDC4" />
                                    <Text style={styles.label}>Class/Grade</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openClass}
                                        value={classValue}
                                        items={classItems.filter(item => item.level.toLowerCase() === schoolValue)}
                                        setOpen={setOpenClass}
                                        setValue={setClassValue}
                                        setItems={setClassItems}
                                        placeholder="📚 Select Class"
                                        style={styles.dropdown}
                                        textStyle={styles.dropdownText}
                                        zIndex={3000}
                                        listMode="SCROLLVIEW"
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {/* Group Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="people" size={18} color="#FFD93D" />
                                    <Text style={styles.label}>Group</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openGroup}
                                        value={groupValue}
                                        items={groupItems}
                                        setOpen={setOpenGroup}
                                        setValue={setGroupValue}
                                        setItems={setGroupItems}
                                        placeholder="👥 Select Group"
                                        style={[styles.dropdown, !classValue && styles.disabledDropdown]}
                                        textStyle={styles.dropdownText}
                                        zIndex={2000}
                                        listMode="SCROLLVIEW"
                                        disabled={!classValue}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {/* Section Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="grid" size={18} color="#A8E6CF" />
                                    <Text style={styles.label}>Section</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openSection}
                                        value={sectionValue}
                                        items={sectionItems}
                                        setOpen={setOpenSection}
                                        setValue={setSectionValue}
                                        setItems={setSectionItems}
                                        placeholder="📝 Select Section"
                                        style={[styles.dropdown, !classValue && styles.disabledDropdown]}
                                        textStyle={styles.dropdownText}
                                        zIndex={1000}
                                        listMode="SCROLLVIEW"
                                        disabled={!classValue}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {/* Exam Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="document-text" size={18} color="#FF8A80" />
                                    <Text style={styles.label}>Examination</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openExam}
                                        value={examValue}
                                        items={examItems.filter(item => item.classId === classValue)}
                                        setOpen={setOpenExam}
                                        setValue={setExamValue}
                                        setItems={setExamItems}
                                        placeholder="📋 Select Exam"
                                        style={[styles.dropdown, !classValue && styles.disabledDropdown]}
                                        textStyle={styles.dropdownText}
                                        zIndex={100}
                                        listMode="SCROLLVIEW"
                                        disabled={!classValue}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {/* Subject Dropdown */}
                            <View style={styles.inputGroup}>
                                <View style={styles.labelContainer}>
                                    <Ionicons name="library" size={18} color="#C8A2C8" />
                                    <Text style={styles.label}>Subject</Text>
                                </View>
                                <View style={styles.dropdownWrapper}>
                                    <DropDownPicker
                                        open={openSubject}
                                        value={subjectValue}
                                        items={subjectItems}
                                        setOpen={setOpenSubject}
                                        setValue={setSubjectValue}
                                        setItems={setSubjectItems}
                                        placeholder="📖 Select Subject"
                                        style={[styles.dropdown, !classValue && styles.disabledDropdown]}
                                        textStyle={styles.dropdownText}
                                        zIndex={80}
                                        listMode="SCROLLVIEW"
                                        disabled={!classValue}
                                        dropDownContainerStyle={styles.dropdownContainer}
                                    />
                                    <View style={styles.dropdownGlow} />
                                </View>
                            </View>

                            {/* Submit Button */}
                            {classValue && (groupValue || sectionValue) && (
                                <Animated.View style={[styles.submitWrapper, { opacity: fadeAnim }]}>
                                    <TouchableOpacity 
                                        style={[styles.submitButton, submitting && styles.submittingButton]} 
                                        onPress={TakeMarks} 
                                        disabled={submitting}
                                    >
                                        <View style={styles.submitContent}>
                                            {submitting ? (
                                                <>
                                                    <ActivityIndicator color="white" size="small" />
                                                    <Text style={styles.submitButtonText}>Processing...</Text>
                                                </>
                                            ) : (
                                                <>
                                                    <Ionicons name="create" size={24} color="white" />
                                                    <Text style={styles.submitButtonText}>Create Marks Sheet</Text>
                                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                                </>
                                            )}
                                        </View>
                                        <View style={styles.submitButtonGlow} />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}

                            <View style={styles.bottomSpacing} />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    floatingShape: {
        position: 'absolute',
        borderRadius: 50,
        opacity: 0.1,
    },
    shape1: {
        width: 100,
        height: 100,
        backgroundColor: '#6C63FF',
        top: 50,
        right: 20,
        borderRadius: 20,
        transform: [{ rotate: '45deg' }],
    },
    shape2: {
        width: 60,
        height: 60,
        backgroundColor: '#FF6B6B',
        top: 200,
        left: 30,
        borderRadius: 30,
    },
    shape3: {
        width: 80,
        height: 80,
        backgroundColor: '#4ECDC4',
        bottom: 200,
        right: 40,
        borderRadius: 15,
        transform: [{ rotate: '30deg' }],
    },
    shape4: {
        width: 40,
        height: 40,
        backgroundColor: '#FFD93D',
        bottom: 100,
        left: 50,
        borderRadius: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 40,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.1)',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#64748b',
        fontWeight: '600',
    },
    loadingDots: {
        flexDirection: 'row',
        marginTop: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C63FF',
        marginHorizontal: 3,
    },
    container: {
        padding: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 15,
    },
    headerDecoration: {
        width: 80,
        height: 4,
        backgroundColor: '#6C63FF',
        borderRadius: 2,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    inputGroup: {
        marginBottom: 25,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 10,
    },
    dropdownWrapper: {
        position: 'relative',
    },
    dropdown: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(107, 99, 255, 0.08)',
        borderWidth: 2,
        borderRadius: 15,
        paddingHorizontal: 15,
        paddingVertical: 15,
    },
    disabledDropdown: {
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
    },
    dropdownText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
    },
    dropdownContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: 'rgba(108, 99, 255, 0.2)',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 10,
    },
    dropdownGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 17,
        backgroundColor: 'rgba(108, 99, 255, 0.05)',
        zIndex: -1,
    },
    submitWrapper: {
        marginTop: 20,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 30,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        position: 'relative',
        minWidth: 220,
    },
    submittingButton: {
        backgroundColor: '#94a3b8',
    },
    submitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    submitButtonGlow: {
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        borderRadius: 23,
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        zIndex: -1,
    },
    bottomSpacing: {
        height: 50,
    },
});

export default Marks;