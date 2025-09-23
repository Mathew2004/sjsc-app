import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const MarksList = ({ navigation }) => {
    const [marksData, setMarksData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [headerAnim] = useState(new Animated.Value(0));

    useFocusEffect(
        useCallback(() => {
            const fetchAttendanceData = async () => {
                const controller = new AbortController();
                try {
                    const Tid = await AsyncStorage.getItem('teacher-id');
                    if (!Tid) throw new Error("Teacher ID not found");

                    const res = await api.get(`/marks/all-reports?teacherId=${Tid}`, { signal: controller.signal });

                    setMarksData(res.data.marksReport);
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
                        console.error(error);
                        setError(error.message || "Something went wrong");
                    }
                } finally {
                    setLoading(false);
                }

                return () => controller.abort();
            };

            fetchAttendanceData();

            // Animate header on focus
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        }, [])
    );

    const handleButtonPress = (item) => {
        navigation.navigate('TakeMarks', {
            classId: item?.classId,
            groupId: item?.groupId,
            sectionId: item?.sectionId,
            marksId: item?.id,
            markId: item?.id,
            examName: item.Exam?.name,
            teacherId: item?.teacherId,
            mcq: item.Exam?.mcq,
            written: item.Exam?.written,
            practical: item.Exam?.practical,
            quiz: item.Exam?.quiz,
        });
    };

    const handleTakeMarks = (item) => {
        navigation.navigate('EditMarks', {
            classId: item?.classId,
            groupId: item?.groupId,
            sectionId: item?.sectionId,
            markId: item?.id,
            examName: item.Exam?.name,
            className: item.Class?.name,
            groupName: item.Group?.name,
            sectionName: item.Section?.name,
            shift: item?.shift,
            teacherId: item?.teacherId,
            mcq: item.Exam?.mcq,
            written: item.Exam?.written,
            practical: item.Exam?.practical,
            quiz: item.Exam?.quiz,
        });
    };

    // Modern Marks Card Component
    const MarksCard = React.memo(({ item, index }) => {
        const fadeAnim = new Animated.Value(0);
        const slideAnim = new Animated.Value(50);

        React.useEffect(() => {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 600,
                    delay: index * 100,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 600,
                    delay: index * 100,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start();
        }, []);

        const getStatusColor = (isTaken) => {
            return isTaken ? '#10b981' : '#ef4444';
        };

        const getStatusIcon = (isTaken) => {
            return isTaken ? 'checkmark-circle' : 'time-outline';
        };

        const handlePress = () => {
            item.isTaken ? handleTakeMarks(item) : handleButtonPress(item);
        };

        return (
            <Animated.View
                style={[
                    styles.marksCard,
                    {
                        opacity: fadeAnim,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.examInfo}>
                        <View style={styles.examTitleContainer}>
                            <Ionicons name="document-text" size={20} color="#6366f1" />
                            <Text style={styles.examName}>{item.Exam.name}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.isTaken) + '20' }]}>
                            <Ionicons 
                                name={getStatusIcon(item.isTaken)} 
                                size={14} 
                                color={getStatusColor(item.isTaken)} 
                            />
                            <Text style={[styles.statusText, { color: getStatusColor(item.isTaken) }]}>
                                {item.isTaken ? "Given" : "Not Given"}
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                        <Ionicons 
                            name={item.isTaken ? "create-outline" : "add-outline"} 
                            size={20} 
                            color="#6366f1" 
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.cardContent}>
                    <View style={styles.classInfo}>
                        <View style={styles.infoRow}>
                            <Ionicons name="school-outline" size={16} color="#8b5cf6" />
                            <Text style={styles.className}>{item?.Class?.name}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="people-outline" size={16} color="#06b6d4" />
                            <Text style={styles.groupSection}>
                                {item?.Group?.name || "N/A"} • {item?.Section?.name || "N/A"}
                            </Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="book-outline" size={16} color="#f59e0b" />
                            <Text style={styles.subjectName}>{item?.Subject?.name}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
                        <Text style={styles.viewButtonText}>
                            {item.isTaken ? "Edit Marks" : "Take Marks"}
                        </Text>
                        <Ionicons name="arrow-forward" size={16} color="#6366f1" />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    });

    if (loading) {
        return (
            <View style={styles.container}>
                
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Loading marks data...</Text>
                </View>
            </View>
        );
    }

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Animated.View
                style={[
                    styles.emptyIconContainer,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                scale: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.8, 1],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <Ionicons name="document-text-outline" size={64} color="#e5e7eb" />
            </Animated.View>
            <Text style={styles.emptyTitle}>No Marks Records Found</Text>
            <Text style={styles.emptySubtitle}>
                No marks sheets are available at the moment
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                style={StyleSheet.absoluteFillObject}
            /> */}

            {/* Header Section */}
            <Animated.View
                style={[
                    styles.headerContainer,
                    {
                        opacity: headerAnim,
                        transform: [
                            {
                                translateY: headerAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [-30, 0],
                                }),
                            },
                        ],
                    },
                ]}
            >
                <View style={styles.titleContainer}>
                    <Ionicons name="document-text" size={28} color="#6366f1" />
                    <Text style={styles.title}>Marks Sheets</Text>
                </View>
                <Text style={styles.subtitle}>
                    {marksData.length} exam{marksData.length !== 1 ? 's' : ''} available
                </Text>
            </Animated.View>

            {/* Error Display */}
            {error && (
                <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}

            {/* Content */}
            {marksData.length > 0 ? (
                <ScrollView
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {marksData
                    .sort((a, b) => {
                        return a.isTaken === b.isTaken ? 0 : !a.isTaken ? -1 : 1; 
                    })
                    .map((item, index) => (
                        <MarksCard key={item?.id?.toString() || Math.random().toString()} item={item} index={index} />
                    ))}
                </ScrollView>
            ) : (
                renderEmptyState()
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    headerContainer: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginLeft: 12,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        marginLeft: 40,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginBottom: 16,
        borderRadius: 12,
        borderLeft: 4,
        borderLeftColor: '#ef4444',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        flex: 1,
    },
    listContainer: {
        padding: 20,
        paddingTop: 8,
    },
    marksCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.62)',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    examInfo: {
        flex: 1,
    },
    examTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    examName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginLeft: 8,
        flex: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    cardContent: {
        marginBottom: 16,
    },
    classInfo: {
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    className: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8b5cf6',
        marginLeft: 8,
    },
    groupSection: {
        fontSize: 14,
        color: '#06b6d4',
        fontWeight: '500',
        marginLeft: 8,
    },
    subjectName: {
        fontSize: 14,
        color: '#f59e0b',
        fontWeight: '500',
        marginLeft: 8,
    },
    cardFooter: {
        borderTop: 1,
        borderTopColor: 'rgba(229, 231, 235, 0.5)',
        paddingTop: 16,
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    viewButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6366f1',
        marginRight: 6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 12,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
        paddingHorizontal: 40,
    },
    emptyIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default MarksList;
