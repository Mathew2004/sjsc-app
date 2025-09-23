import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    Animated,
    Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

const ViewAttendance = () => {
    const route = useRoute();
    const { id } = route.params;
    const navigation = useNavigation();
    
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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


    useFocusEffect(
        useCallback(() => {
            const fetchAttendanceData = async () => {
                try {
                    const response = await api.get(`/attendance/fetch/report/${id}`);
                    setAttendanceData(response.data);
                } catch (error) {
                    if (error.response) {
                        setError("An unexpected error occurred");
                    } else if (error.request) {
                        setError("Network error - please check your connection");
                    } else {
                        setError("An unexpected error occurred");
                        console.log(error);
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchAttendanceData();
        }, [id])
    );


    const totalStudent = attendanceData?.Attendances.length;

    const [filter, setFilter] = useState("Absent");

    const filteredRows = attendanceData?.Attendances?.filter(
        (row) => row.status === filter
    );



    if (loading) return (
        <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingCard, { opacity: fadeAnim }]}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading Attendance...</Text>
                <View style={styles.loadingDots}>
                    <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                    <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                    <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
                </View>
            </Animated.View>
        </View>
    );
    
    if (error) return (
        <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>Error: {error}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Section */}
                <Animated.View style={[
                    styles.headerSection,
                ]}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="calendar" size={32} color="#007AFF" />
                    </View>
                    <Text style={styles.headerTitle}>Attendance Report</Text>
                    <Text style={styles.headerSubtitle}>
                        {new Date(attendanceData.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </Text>
                </Animated.View>

                {/* Stats Overview */}
                <Animated.View style={[
                    styles.statsSection,
                ]}>
                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
                                <Ionicons name="people" size={24} color="#007AFF" />
                            </View>
                            <Text style={styles.statNumber}>{totalStudent}</Text>
                            <Text style={styles.statLabel}>Total Students</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#E8F5E8' }]}>
                                <Ionicons name="checkmark-circle" size={24} color="#34C759" />
                            </View>
                            <Text style={[styles.statNumber, { color: '#34C759' }]}>{attendanceData.totalPresent}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </View>
                        
                        <View style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: '#FFF2F2' }]}>
                                <Ionicons name="close-circle" size={24} color="#FF3B30" />
                            </View>
                            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>{attendanceData.totalAbsent}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* Class Information */}
                <Animated.View style={[
                    styles.infoSection,
                ]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle" size={20} color="#007AFF" />
                        <Text style={styles.sectionTitle}>Class Information</Text>
                    </View>
                    
                    <View style={styles.infoGrid}>
                        {[
                            { icon: "person", label: "Teacher", value: attendanceData?.Teacher?.name },
                            { icon: "school", label: "Class", value: attendanceData?.Class?.name },
                            { icon: "people-outline", label: "Group", value: attendanceData?.Group?.name || "N/A" },
                            { icon: "library", label: "Section", value: attendanceData?.Section?.name || "N/A" },
                            { icon: "document-text", label: "Remarks", value: attendanceData.remarks || "N/A" },
                        ].map((item, index) => (
                            <View key={index} style={styles.infoCard}>
                                <View style={styles.infoCardContent}>
                                    <Ionicons name={item.icon} size={18} color="#007AFF" />
                                    <View style={styles.infoText}>
                                        <Text style={styles.infoLabel}>{item.label}</Text>
                                        <Text style={styles.infoValue}>{item.value}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </Animated.View>

                {/* Filter Section */}
                <Animated.View style={[
                    styles.filterSection,

                ]}>
                    <View style={styles.filterContainer}>
                        {["Present", "Absent"].map((tag) => (
                            <Animated.View key={tag} style={{ transform: [{ scale: pulseAnim }] }}>
                                <TouchableOpacity
                                    onPress={() => setFilter(tag)}
                                    style={[
                                        styles.filterBtn,
                                        filter === tag && styles.filterBtnActive,
                                        filter === tag && tag === "Present" && styles.filterBtnPresent,
                                        filter === tag && tag === "Absent" && styles.filterBtnAbsent,
                                    ]}
                                >
                                    <Ionicons 
                                        name={tag === "Present" ? "checkmark-circle" : "close-circle"} 
                                        size={18} 
                                        color={filter === tag ? "white" : (tag === "Present" ? "#34C759" : "#FF3B30")} 
                                    />
                                    <Text
                                        style={[
                                            styles.filterText,
                                            filter === tag && styles.filterTextActive,
                                        ]}
                                    >
                                        {tag}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Student List */}
                <Animated.View style={[
                    styles.studentsSection,

                ]}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="list" size={20} color="#007AFF" />
                        <Text style={styles.sectionTitle}>
                            {filter} Students ({filteredRows?.length || 0})
                        </Text>
                    </View>
                    
                    <View style={styles.studentsList}>
                        {filteredRows?.map((item, index) => (
                            <Animated.View 
                                key={index} 
                                style={[
                                    styles.studentCard,
                                   
                                ]}
                            >
                                <View style={styles.studentInfo}>
                                    <View style={styles.rollContainer}>
                                        <Text style={styles.rollNumber}>{item.Student.roll}</Text>
                                    </View>
                                    <View style={styles.studentDetails}>
                                        <Text style={styles.studentName}>{item.Student.name}</Text>
                                    </View>
                                    <View style={[
                                        styles.statusBadge,
                                        item.status === "Present" ? styles.statusPresent : styles.statusAbsent,
                                    ]}>
                                        <Ionicons 
                                            name={item.status === "Present" ? "checkmark" : "close"} 
                                            size={16} 
                                            color="white" 
                                        />
                                        <Text style={styles.statusText}>{item.status}</Text>
                                    </View>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingCard: {
        backgroundColor: 'white',
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '500',
    },
    loadingDots: {
        flexDirection: 'row',
        marginTop: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#007AFF',
        marginHorizontal: 3,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        marginTop: 16,
        textAlign: 'center',
        fontWeight: '500',
    },
    headerSection: {
        backgroundColor: 'white',
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerIconContainer: {
        backgroundColor: '#F0F8FF',
        padding: 15,
        borderRadius: 25,
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#8E8E93',
        fontWeight: '500',
    },
    statsSection: {
        backgroundColor: 'white',
        margin: 20,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 6,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
    },
    statIcon: {
        padding: 10,
        borderRadius: 20,
        marginBottom: 8,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        textAlign: 'center',
    },
    infoSection: {
        backgroundColor: 'white',
        // marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 16,
        padding: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1C1C1E',
        marginLeft: 8,
    },
    infoGrid: {
        gap: 12,
    },
    infoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
    },
    infoCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        marginLeft: 12,
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '500',
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 16,
        color: '#1C1C1E',
        fontWeight: '600',
    },
    filterSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        backgroundColor: 'white',
        borderWidth: 2,
        borderColor: '#E5E5EA',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    filterBtnActive: {
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    filterBtnPresent: {
        backgroundColor: '#34C759',
        borderColor: '#34C759',
    },
    filterBtnAbsent: {
        backgroundColor: '#FF3B30',
        borderColor: '#FF3B30',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
        color: '#8E8E93',
    },
    filterTextActive: {
        color: 'white',
    },
    studentsSection: {
        backgroundColor: 'white',
        // marginHorizontal: 20,
        borderRadius: 16,
        padding: 20,
    },
    studentsList: {
        gap: 8,
    },
    studentCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    rollContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#E5E5EA',
    },
    rollNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1C1C1E',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginLeft: 12,
    },
    statusPresent: {
        backgroundColor: '#34C759',
    },
    statusAbsent: {
        backgroundColor: '#FF3B30',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 4,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default ViewAttendance;