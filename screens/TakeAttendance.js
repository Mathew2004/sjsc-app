import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, TouchableOpacity, TextInput, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function TakeAttendance() {
    const navigation = useNavigation();
    const route = useRoute();
    const { classId, groupId, sectionId, shift, attendanceId } = route.params || {};

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [searchText, setSearchText] = useState(""); 
    const [proccessing, setProccessing] = useState(false);

    // Animation setup
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

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

    const filteredData = useMemo(() => {
        if (!searchText.trim()) return data;
        return data.filter((item) =>
            item.roll == (searchText.trim())
        );
    }, [data, searchText]);

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

            // console.log("Student Records", studentRecords);
            // console.log("Attendance ID", attendanceId);
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Students...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <Animated.View style={[
                styles.headerSection,
                // {
                //     opacity: fadeAnim,
                //     transform: [{ translateY: slideAnim }],
                // }
            ]}>
                <View style={styles.headerTop}>
                    <View style={styles.titleContainer}>
                        <Ionicons name="people" size={24} color="#007AFF" />
                        <Text style={styles.headerTitle}>Take Attendance</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.selectAllButton} 
                        onPress={ToggleselectAll}
                    >
                        <Ionicons 
                            name={selectedStudents.length === data.length ? "checkbox" : "square-outline"} 
                            size={18} 
                            color="#007AFF" 
                        />
                        <Text style={styles.selectAllText}>
                            {selectedStudents.length === data.length ? "Deselect All" : "Select All"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Statistics */}
                {/* <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{data.length}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: '#34C759' }]}>{selectedStudents.length}</Text>
                        <Text style={styles.statLabel}>Present</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{data.length - selectedStudents.length}</Text>
                        <Text style={styles.statLabel}>Absent</Text>
                    </View>
                </View> */}
            </Animated.View>

            {/* Search Section */}
            <Animated.View style={[
                styles.searchSection,
                // {
                //     opacity: fadeAnim,
                //     transform: [{ translateY: slideAnim }],
                // }
            ]}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by roll number"
                        placeholderTextColor="#8E8E93"
                        keyboardType="numeric"
                        value={searchText}
                        onChangeText={setSearchText}
                        returnKeyType="search"
                    />
                    {searchText.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchText("")}>
                            <Ionicons name="close-circle" size={18} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            {/* No Students Message */}
            {data.length === 0 && (
                <Animated.View style={[styles.noStudentsContainer, { opacity: fadeAnim }]}>
                    <Ionicons name="people-outline" size={48} color="#8E8E93" />
                    <Text style={styles.noStudentsText}>No students found</Text>
                </Animated.View>
            )}

            {/* Students List */}
            <ScrollView 
                style={styles.studentsList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.studentsContainer}
            >
                {filteredData.map((item, index) => (
                    <Animated.View
                        key={item.id}
                        style={[
                            styles.studentCard,
                            selectedStudents.includes(item.id) && styles.selectedCard,
                            
                        ]}
                    >
                        <TouchableOpacity
                            style={styles.studentCardContent}
                            onPress={() => ToggleStudent(item.id)}
                            activeOpacity={0.7}
                        >
                            {/* Student Info */}
                            <View style={styles.studentInfo}>
                                <View style={styles.rollContainer}>
                                    <Text style={styles.rollNumber}>{item.roll}</Text>
                                </View>
                                <View style={styles.studentDetails}>
                                    <Text style={styles.studentName}>{item.name}</Text>
                                    <Text style={styles.studentStatus}>
                                        {selectedStudents.includes(item.id) ? "Present" : "Absent"}
                                    </Text>
                                </View>
                            </View>

                            {/* Attendance Status */}
                            <View style={styles.attendanceStatus}>
                                <View style={[
                                    styles.statusIndicator,
                                    selectedStudents.includes(item.id) ? styles.presentIndicator : styles.absentIndicator
                                ]}>
                                    <Ionicons 
                                        name={selectedStudents.includes(item.id) ? "checkmark" : "close"} 
                                        size={16} 
                                        color="white" 
                                    />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                ))}
            </ScrollView>

            {/* Submit Button */}
            <Animated.View style={[
                styles.submitSection,
                // {
                //     opacity: fadeAnim,
                //     transform: [{ translateY: slideAnim }],
                // }
            ]}>
                <TouchableOpacity 
                    style={[styles.submitButton, proccessing && styles.submittingButton]} 
                    onPress={handleSubmit}
                    disabled={proccessing}
                >
                    <View style={styles.submitContent}>
                        {proccessing ? (
                            <>
                                <ActivityIndicator size="small" color="white" />
                                <Text style={styles.submitButtonText}>Submitting...</Text>
                            </>
                        ) : (
                            <>
                                <Ionicons name="checkmark-circle" size={20} color="white" />
                                <Text style={styles.submitButtonText}>Submit Attendance</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#FAFAFA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: '#FAFAFA',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '500',
    },
    headerSection: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginLeft: 8,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
    },
    selectAllText: {
        fontSize: 14,
        color: '#007AFF',
        fontWeight: '500',
        marginLeft: 6,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statCard: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
    },
    searchSection: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F7',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '400',
    },
    noStudentsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    noStudentsText: {
        fontSize: 16,
        color: '#8E8E93',
        marginTop: 12,
        fontWeight: '500',
    },
    studentsList: {
        flex: 1,
    },
    studentsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    studentCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    selectedCard: {
        borderColor: '#007AFF',
        borderWidth: 2,
        backgroundColor: '#F0F8FF',
    },
    studentCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        justifyContent: 'space-between',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    rollContainer: {
        backgroundColor: '#F2F2F7',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginRight: 16,
        minWidth: 50,
        alignItems: 'center',
    },
    rollNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1C1C1E',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    studentStatus: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
    attendanceStatus: {
        marginLeft: 12,
    },
    statusIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    presentIndicator: {
        backgroundColor: '#34C759',
    },
    absentIndicator: {
        backgroundColor: '#FF3B30',
    },
    submitSection: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    submitButton: {
        backgroundColor: '#007AFF',
        borderRadius: 12,
        paddingVertical: 16,
        shadowColor: '#007AFF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    submittingButton: {
        backgroundColor: '#8E8E93',
    },
    submitContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
});