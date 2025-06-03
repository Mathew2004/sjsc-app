import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { ScrollView, ActivityIndicator, Text, StyleSheet, View, TextInput, TouchableOpacity } from 'react-native';

export default function TakeMarks() {
    const navigation = useNavigation();
    const route = useRoute();
    const { classId, groupId, sectionId, shift, markId,
        examName,
        mcq, written, practical, quiz } = route.params || {};

    console.log('TakeMarks', route.params);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [marks, setMarks] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `https://sjsc-backend-production.up.railway.app/api/v1/students/fetch?classId=${classId}&groupId=${groupId || ''}&sectionId=${sectionId || ''}&shift=${shift || ''}`
            );
            setData(res.data);
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
            }));

            const response = await axios.post(
                `https://sjsc-backend-production.up.railway.app/api/v1/marks/take-marks`,
                // 'https://sjsc-backend-production.up.railway.app/api/v1/marks/take-marks',
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

    if (loading || !data) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (

        <View style={styles.container}>

            {data.length === 0 && <Text style={styles.noStudentsText}>No students found</Text>}
            <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 20,
            }}>
                {examName}
            </Text>
            <ScrollView contentContainerStyle={styles.scrollView}>

                {data.map(item => (
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
                                />
                            )}
                            {written && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Written"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.written || ''}
                                    onChangeText={text => handleInputChange(item.id, 'written', text)}
                                />
                            )}
                            {practical && (
                                <TextInput
                                    style={styles.input}
                                    placeholder="Practical"
                                    keyboardType="numeric"
                                    value={marks[item.id]?.practical || ''}
                                    onChangeText={text => handleInputChange(item.id, 'practical', text)}
                                />
                            )}

                        </View>
                    </View>
                ))}

            </ScrollView>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={processing}>
                {processing ? <ActivityIndicator color="white" /> : null}
                <Text style={styles.submitButtonText}>Submit Marks</Text>
            </TouchableOpacity>
        </View>

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
    scrollView: {
        paddingBottom: 2,
    },
});

