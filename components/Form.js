import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';


const TeacherDropdownForm = () => {
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const [teacherData, setTeacherData] = useState(null);
    const [loading, setLoading] = useState(true);

    //  Date 
    const [date, setDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState(false);

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

    //  Date 
    // const [date, setDate] = useState(new Date());
    // const [showPicker, setShowPicker] = useState(false);

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
                const res = await api.get(`/teachers/fetch/${Tid}`);
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
        return (
            <View style={styles.loadingContainer}>
                <View style={styles.loadingCard}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading your dashboard...</Text>
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
                    // {
                    //     opacity: fadeAnim,
                    //     transform: [{ translateY: slideAnim }, { scale: pulseAnim }],
                    // }
                ]}
            >
                {/* Floating Background Elements */}
                <View style={[styles.floatingShape, styles.shape1]} />
                <View style={[styles.floatingShape, styles.shape2]} />
                <View style={[styles.floatingShape, styles.shape3]} />
                <View style={[styles.floatingShape, styles.shape4]} />

            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    {/* Header Section */}
                    <View style={styles.headerSection}>
                        <Text style={styles.headerTitle}>📊 Attendance Form</Text>
                        <Text style={styles.headerSubtitle}>Configure your class details</Text>
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
                        <Animated.View style={[styles.inputGroup, { zIndex: 100 }]}>
                            <View style={styles.labelContainer}>
                                <Ionicons name="time" size={18} color="#FF6B6B" />
                                <Text style={styles.label}>Study Shift</Text>
                            </View>
                            <View style={[styles.dropdownWrapper, { zIndex: 3400 }]}>
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
                                    zIndex={3000}
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
                                style={[styles.dropdown, !schoolValue && styles.disabledDropdown]}
                                textStyle={styles.dropdownText}
                                disabled={!schoolValue}
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

                    {/* Date Picker */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="calendar" size={18} color="#FF8A80" />
                            <Text style={styles.label}>Date</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.datePicker}
                            onPress={() => setShowPicker(true)}
                        >
                            <View style={styles.dateContent}>
                                <Text style={styles.dateEmoji}>📅</Text>
                                <Text style={styles.dateText}>{date.toDateString()}</Text>
                                <Ionicons name="chevron-down" size={20} color="#6C63FF" />
                            </View>
                            <View style={styles.datePickerGlow} />
                        </TouchableOpacity>
                    </View>

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
                        <Animated.View style={[styles.submitWrapper, { opacity: fadeAnim }]}>
                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submittingButton]}
                                onPress={takeAttendance}
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
                                            <Ionicons name="checkmark-circle" size={24} color="white" />
                                            <Text style={styles.submitButtonText}>Take Attendance</Text>
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
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        // backgroundColor: '#f8fafc',
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
        // backgroundColor: '#f8fafc',
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
    datePicker: {
        position: 'relative',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 2,
        borderColor: 'rgba(108, 99, 255, 0.2)',
        borderRadius: 15,
        paddingVertical: 18,
        paddingHorizontal: 20,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    dateContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateEmoji: {
        fontSize: 20,
    },
    dateText: {
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
        flex: 1,
        marginLeft: 12,
    },
    datePickerGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 17,
        backgroundColor: 'rgba(255, 138, 128, 0.05)',
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
        minWidth: 200,
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

export default TeacherDropdownForm;