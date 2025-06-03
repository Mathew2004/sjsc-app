import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, TextInput, KeyboardAvoidingView, Platform } from 'react-native';

export default function EditMarks() {
    const navigation = useNavigation();
    const route = useRoute();
    const { className, sectionName, groupName, examName,
        groupId, sectionId, shift, markId,
        mcq, written, practical, quiz } = route.params || {};

    console.log(className, sectionName, groupName, examName)
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState({});
    const [processing, setProcessing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchStudents();
        }, [])
    );

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://sjsc-backend-production.up.railway.app/api/v1/marks?marksId=${markId}`,
                // `https://sjsc-backend-production.up.railway.app/api/v1/marks?markId=${markId}`
            );
            // console.log(res.data.marksReport.Marks);
            const students = res.data.marksReport.Marks;

            // Initialize marks state with existing values
            const initialMarks = {};
            students.forEach(student => {
                initialMarks[student?.Student?.id] = {
                    mcq: student.mcq || '',
                    written: student.written || '',
                    practical: student.practical || '',
                    quiz: student.quiz || ''
                };
            });

            console.log(initialMarks);

            setData(students);
            setMarks(initialMarks);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = async (studentId, field, value) => {
        if (value > 100) {
            alert('Marks cannot be greater than 30');
            return;
        }

        // Just update this specific field
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: {
                ...prevMarks[studentId],
                [field]: value,
            },
        }));

        try {
            const rs = await axios.put(`https://sjsc-backend-production.up.railway.app/api/v1/marks/update-marks/${markId}`, {
                studentId: studentId,
                [field]: value,
            });
            if (rs.data.status == "success") {
                console.log('Marks Updated');
            } else {
                alert("Error updating marks");
            }

        } catch (e) {
            console.log(e);
            alert("Error updating marks, Please Contact Admin");
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

    return (

        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}>
            <ScrollView
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollView}>
                <View style={styles.container}>
                    {data.length === 0 && <Text style={styles.noStudentsText}>No students found</Text>}
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'semibold',
                        textAlign: 'center',
                        marginBottom: 20,
                    }}>
                        {examName} ({className} {groupName || ""} - {sectionName || ""}) {shift ? `(${shift})` : ""}
                    </Text>
                    {data.map(item => (
                        <View key={item.Student.id} style={styles.studentCard}>
                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 10,
                                marginBottom: 10,
                            }}>
                                <Text style={styles.studentRoll}>{item?.Student?.roll} - {item?.Student?.name}</Text>
                                {quiz && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Quiz"
                                        keyboardType="numeric"
                                        value={String(marks[item.Student?.id]?.quiz || '')}
                                        onChangeText={text => handleInputChange(item.Student?.id, 'quiz', text)}
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
                                        value={String(marks[item.Student.id]?.mcq)}
                                        onChangeText={text => handleInputChange(item.Student.id, 'mcq', text)}
                                        ref={setInputRef(item.id, 'mcq')}
                                        onSubmitEditing={() => focusNextInput(item.id, 'mcq')}
                                    />
                                )}
                                {written && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Written"
                                        keyboardType="numeric"
                                        value={String(marks[item.Student.id].written)}
                                        onChangeText={text => handleInputChange(item.Student.id, 'written', text)}
                                        ref={setInputRef(item.id, 'written')}
                                        onSubmitEditing={() => focusNextInput(item.id, 'written')}
                                    />
                                )}
                                {practical && (
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Practical"
                                        keyboardType="numeric"
                                        value={String(marks[item.Student.id]?.practical)}
                                        onChangeText={text => handleInputChange(item.Student.id, 'practical', text)}
                                        ref={setInputRef(item.id, 'practical')}
                                        onSubmitEditing={() => focusNextInput(item.id, 'practical')}
                                    />
                                )}

                            </View>
                        </View>
                    ))}

                    {/* <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={processing}>
                {processing ? <ActivityIndicator color="white" /> : null}
                <Text style={styles.submitButtonText}>Submit Marks</Text>
            </TouchableOpacity> */}
                </View>

            </ScrollView>

            {/* <View style={{ paddingBottom: 100 }} /> */}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    noStudentsText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    studentCard: {
        marginVertical: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    studentRoll: {
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 8,
        width: '70%',
    },
    marksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        marginHorizontal: 5,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        textAlign: 'center',
    },
    submitButton: {
        padding: 15,
        backgroundColor: 'green',
        borderRadius: 5,
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 18,
    },
    scrollView: {
        paddingBottom: 200,
    },
});

