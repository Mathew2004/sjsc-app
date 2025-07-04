import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TakeMarks() {
    const navigation = useNavigation();
    const route = useRoute();
    const { classId, groupId, sectionId, shift, markId,
        examName,
        mcq, written, practical, quiz } = route.params || {};

    console.log('TakeMarks', route.params);

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState({});
    const [processing, setProcessing] = useState(false);
    const [teacher_id, setTeacherId] = useState(null);

    useEffect(() => {
        fetchTeacherId();
        fetchStudents();
    }, []);

    async function fetchTeacherId() {
        try {
            const teacher_id = await AsyncStorage.getItem('teacher-id');
            setTeacherId(teacher_id);
        }
        catch (error) {
            console.error('Error fetching teacher ID:', error);
        }
    }

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://sjsc-backend-production.up.railway.app/api/v1/students/fetch?classId=${classId}&groupId=${groupId || ''}&sectionId=${sectionId || ''}&shift=${shift || ''}`
            );
            setData(res.data);
            setFilteredData(res.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (studentId, field, value) => {
        if (value > 100) {
            alert('Marks cannot be greater than 30');
            return;
        }
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: {
                ...prevMarks[studentId],
                [field]: value,
                teacherId: teacher_id,
            },
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            setProcessing(true);
            const studentRecords = data.map(student => ({
                studentId: student.id,
                mcq: marks[student.id]?.mcq || null,
                written: marks[student.id]?.written || null,
                practical: marks[student.id]?.practical || null,
                quiz: marks[student.id]?.quiz || null,
                teacherId: marks[student.id]?.teacherId || null,
            }));

            const response = await axios.post(
                `https://sjsc-backend-production.up.railway.app/api/v1/marks/take-marks`,
                // `http://192.168.0.108:3000/api/v1/marks/take-marks`,
                {
                    marksId: markId,
                    records: studentRecords,

                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.status === 200) {
                alert('Marks recorded successfully!');
                navigation.navigate('Home');
            } else {
                alert('Unexpected response from the server');
            }
            setProcessing(false);
        } catch (error) {
            alert(error.response?.data?.message || 'An error occurred');
            setProcessing(false);
        }
    };

    const inputRefs = useRef({});

    const setInputRef = (studentId, field) => (ref) => {
        if (!inputRefs.current[studentId]) inputRefs.current[studentId] = {};
        inputRefs.current[studentId][field] = ref;
    };

    // Focus same field in next student
    const focusNextInput = (currentStudentId, field) => {
        const students = data.map((s) => s.id);
        const currentIndex = students.indexOf(currentStudentId);
        if (currentIndex === -1) return;

        for (let i = currentIndex + 1; i < students.length; i++) {
            const nextStudentId = students[i];
            const nextRef = inputRefs.current[nextStudentId]?.[field];
            if (nextRef) {
                nextRef.focus();
                return;
            }
        }
    };

    if (loading || !data) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const searchByRollOrName = (text) => {
        const lowerText = text.toLowerCase();
        if (!lowerText) {
            setFilteredData(data);
            return;
        }
        const filtered = data.filter(item =>
            item?.roll.toString().toLowerCase().includes(lowerText) ||
            item?.name.toLowerCase().includes(lowerText)
        );
        setFilteredData(filtered);
    };


    return (

        <View style={styles.container}>

            {data.length === 0 && <Text style={styles.noStudentsText}>No students found</Text>}
            {/* Add a Search bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={18} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by roll or name"
                    placeholderTextColor="#9ca3af"
                    onChangeText={(e) => searchByRollOrName(e)}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>
            <ScrollView contentContainerStyle={styles.scrollView}>

                {filteredData.map((item, index) => (
                    <View key={item.id} style={styles.studentCard}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 10,
                        }}>
                            <Text style={styles.studentRoll}>{item.roll} - {item.name}</Text>
                            {quiz && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Quiz"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.quiz || ''}
                                    onChangeText={text => handleInputChange(item.id, 'quiz', text)}
                                    returnKeyType="next"
                                    ref={setInputRef(item.id, 'quiz')}
                                    onSubmitEditing={() => focusNextInput(item.id, 'quiz')}
                                />
                            )}
                        </View>
                        <View style={styles.marksRow}>
                            {mcq && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="MCQ"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.mcq || ''}
                                    onChangeText={text => handleInputChange(item.id, 'mcq', text)}
                                    returnKeyType="next"
                                    ref={setInputRef(item.id, 'mcq')}
                                    onSubmitEditing={() => focusNextInput(item.id, 'mcq')}
                                />
                            )}
                            {written && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Written"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.written || ''}
                                    onChangeText={text => handleInputChange(item.id, 'written', text)}
                                    returnKeyType="next"
                                    ref={setInputRef(item.id, 'written')}
                                    onSubmitEditing={() => focusNextInput(item.id, 'written')}
                                />
                            )}
                            {practical && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Practical"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.practical || ''}
                                    onChangeText={text => handleInputChange(item.id, 'practical', text)}
                                    returnKeyType="next"
                                    ref={setInputRef(item.id, 'practical')}
                                    onSubmitEditing={() => focusNextInput(item.id, 'practical')}
                                />
                            )}

                        </View>
                    </View>
                ))}

            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={processing}>
                {processing && <ActivityIndicator color="white" size="small" style={styles.submitLoader} />}
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                    {processing ? 'Submitting...' : 'Submit Marks'}
                </Text>
            </TouchableOpacity>
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    noStudentsText: {
        color: '#ef4444',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        fontWeight: '600',
    },
    studentCard: {
        marginVertical: 4,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        backgroundColor: 'white',
    },
    studentRoll: {
        fontWeight: '700',
        fontSize: 12,
        marginBottom: 8,
        width: '70%',
        color: '#1f2937',
    },
    marksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    input: {
        flex: 1,
        marginHorizontal: 4,
        padding: 12,
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
        paddingHorizontal: 24,
        backgroundColor: '#10b981',
        borderRadius: 12,
        marginTop: 20,
        shadowColor: '#10b981',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    submitLoader: {
        marginRight: 4,
    },
    submitButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
        fontWeight: '700',
    },
    scrollView: {
        paddingBottom: 2,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
});

