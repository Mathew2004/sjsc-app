import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function EditMarks() {
    const navigation = useNavigation();
    const route = useRoute();
    const { className, sectionName, groupName, examName,
        groupId, sectionId, shift, markId,
        mcq, written, practical, quiz } = route.params || {};

    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState({});
    const [processing, setProcessing] = useState(false);
    const [teacher_id, setTeacherId] = useState(null);


    useFocusEffect(
        useCallback(() => {
            fetchTeacherId();
            fetchStudents();
        }, [])
    );

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
                `https://sjsc-backend-production.up.railway.app/api/v1/marks?marksId=${markId}`,
                // `http://192.168.0.108:3000/api/v1/marks?marksId=${markId}`
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
                    quiz: student.quiz || '',
                    teacherId: student.teacherId || null,
                };
            });

            setData(students);
            setFilteredData(students);
            setMarks(initialMarks);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };


    const handleInputChange = async (studentId, field, value) => {
        // teacher_id = await AsyncStorage.getItem('teacher-id');

        if (value > 100) {
            alert('Marks cannot be greater than 30');
            return;
        }

        // Just update this specific field
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: {
                ...prevMarks[studentId],
                [field]: value || 0,
                teacherId: teacher_id,
            },
        }));
        try {
            const rs = await axios.put(
                `https://sjsc-backend-production.up.railway.app/api/v1/marks/update-marks/${markId}`, {
                // `http://192.168.0.108:3000/api/v1/marks/update-marks/${markId}`, {
                studentId: studentId,
                teacherId: teacher_id,
                [field]: value || 0,
            });
            if (rs.data.status == "success") {
                console.log('Marks Updated');
            } else {
                alert("Error updating marks");
            }

        } catch (e) {
            // log the error to console
            console.log(e.response.data.error);

            alert(`${e.response.data.error}`);
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
            item?.Student?.roll.toString().toLowerCase().includes(lowerText) ||
            item?.Student?.name.toLowerCase().includes(lowerText)
        );
        setFilteredData(filtered);
    };

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
                    {/* Add a Search bar */}
                    <TextInput
                        style={styles.input}
                        placeholder="Search by roll or name"
                        onChangeText={(e) => searchByRollOrName(e)}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />

                    {filteredData.map(item => {
                        const disabled = !(marks[item.Student.id]?.teacherId && marks[item.Student.id]?.teacherId != teacher_id);

                        return (
                            <View key={item.Student.id} style={styles.studentCard}>
                                <View style={{
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 10,
                                    marginBottom: 10,
                                }}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.studentRoll}>
                                            {item?.Student?.roll} - {item?.Student?.name}
                                        </Text>
                                        {(written || mcq) && (
                                            <Text style={{ backgroundColor: 'darkgreen', color: "white", paddingVertical: 2, paddingHorizontal: 8, borderRadius: 10 }}>
                                                Total : {(parseFloat(marks[item.Student.id]?.mcq) || 0) + (parseFloat(marks[item.Student.id]?.written) || 0) + (parseFloat(marks[item.Student.id]?.practical) || 0)}
                                            </Text>
                                        )}
                                    </View>

                                    {quiz && (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                !disabled && styles.disabledInput // Apply disabled style
                                            ]}
                                            placeholder="Quiz"
                                            keyboardType="numeric"
                                            value={String(marks[item.Student?.id]?.quiz || '')}
                                            onChangeText={text => handleInputChange(item.Student?.id, 'quiz', text)}
                                            ref={setInputRef(item.id, 'quiz')}
                                            onSubmitEditing={() => focusNextInput(item.id, 'quiz')}
                                            editable={disabled}
                                        />
                                    )}
                                </View>

                                <View style={styles.marksRow}>

                                    {written && (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                !disabled && styles.disabledInput
                                            ]}
                                            placeholder="Written"
                                            keyboardType="numeric"
                                            value={String(marks[item.Student.id]?.written || '')}
                                            onChangeText={text => handleInputChange(item.Student.id, 'written', text)}
                                            ref={setInputRef(item.id, 'written')}
                                            onSubmitEditing={() => focusNextInput(item.id, 'written')}
                                            editable={disabled}
                                        />
                                    )}

                                    {mcq && (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                !disabled && styles.disabledInput
                                            ]}
                                            placeholder="MCQ"
                                            keyboardType="numeric"
                                            value={String(marks[item.Student.id]?.mcq || '')}
                                            onChangeText={text => handleInputChange(item.Student.id, 'mcq', text)}
                                            ref={setInputRef(item.id, 'mcq')}
                                            onSubmitEditing={() => focusNextInput(item.id, 'mcq')}
                                            editable={disabled}
                                        />
                                    )}


                                    {practical && (
                                        <TextInput
                                            style={[
                                                styles.input,
                                                !disabled && styles.disabledInput
                                            ]}
                                            placeholder="Practical"
                                            keyboardType="numeric"
                                            value={String(marks[item.Student.id]?.practical || '')}
                                            onChangeText={text => handleInputChange(item.Student.id, 'practical', text)}
                                            ref={setInputRef(item.id, 'practical')}
                                            onSubmitEditing={() => focusNextInput(item.id, 'practical')}
                                            editable={disabled}
                                        />
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

            </ScrollView>


            <TouchableOpacity style={styles.submitButton} onPress={() => { setProcessing(false); alert("Marks Updated"); }} disabled={processing}>
                {processing && <ActivityIndicator color="white" size="small" style={styles.submitLoader} />}
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.submitButtonText}>
                    {processing ? 'Submitting...' : 'Submit Marks'}
                </Text>
            </TouchableOpacity>

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
    disabledInput: {
        backgroundColor: '#f0f0f0',
        borderColor: '#ccc',
        color: '#999',
    },
    submitButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        paddingVertical: 8,
        paddingHorizontal: 24,
        backgroundColor: '#10b981',
        borderRadius: 12,
        margin: 10,
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
        paddingBottom: 200,
    },
});

