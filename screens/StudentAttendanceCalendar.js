import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Platform,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../utils/colors';
import { api } from '../utils/api';

const { width } = Dimensions.get('window');

const StudentAttendanceCalendar = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { studentId } = route.params;

    const [student, setStudent] = useState(null);
    const [attendanceCalendar, setAttendanceCalendar] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calendar navigation
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    useEffect(() => {
        fetchStudentAttendance();
    }, [studentId]);

    const fetchStudentAttendance = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/attendance-summary/${studentId}`);
            
            setStudent(response.data.student);
            setAttendanceCalendar(response.data.calendar);
        } catch (error) {
            console.error('Error fetching student attendance:', error);
            Alert.alert('Error', 'Failed to fetch student attendance data');
        } finally {
            setLoading(false);
        }
    };

    // Get the first day of the month and number of days
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    // Navigate months
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    };

    const goToToday = () => {
        setCurrentDate(new Date());
    };

    // Get attendance status for a specific date
    const getAttendanceStatus = (day) => {
        const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return attendanceCalendar[dateString];
    };

    // Get attendance statistics for current month
    const getMonthlyStats = () => {
        let present = 0;
        let absent = 0;

        for (let day = 1; day <= daysInMonth; day++) {
            const status = getAttendanceStatus(day);
            if (status === true) present++;
            else if (status === false) absent++;
        }

        const total = present + absent;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

        return { present, absent, total, percentage };
    };

    const monthlyStats = getMonthlyStats();

    // Render calendar days
    const renderCalendarDays = () => {
        const days = [];

        // Previous month's trailing days
        const lastDayOfPrevMonth = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = firstDayWeekday - 1; i >= 0; i--) {
            const day = lastDayOfPrevMonth - i;
            days.push(
                <View key={`prev-${day}`} style={[styles.dayCell, styles.otherMonthDay]}>
                    <Text style={[styles.dayText, styles.otherMonthText]}>{day}</Text>
                </View>
            );
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const attendanceStatus = getAttendanceStatus(day);
            const isToday = new Date().getDate() === day &&
                new Date().getMonth() === currentMonth &&
                new Date().getFullYear() === currentYear;

            let dayStyle = [styles.dayCell];
            let textStyle = [styles.dayText];
            let statusIndicator = null;

            if (attendanceStatus === true) {
                dayStyle.push(styles.presentDay);
                textStyle.push(styles.presentText);
                statusIndicator = <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />;
            } else if (attendanceStatus === false) {
                dayStyle.push(styles.absentDay);
                textStyle.push(styles.absentText);
                statusIndicator = <View style={[styles.statusDot, { backgroundColor: '#ef4444' }]} />;
            } else {
                dayStyle.push(styles.noDataDay);
                textStyle.push(styles.noDataText);
            }

            if (isToday) {
                dayStyle.push(styles.todayHighlight);
            }

            days.push(
                <TouchableOpacity 
                    key={day} 
                    style={dayStyle}
                    activeOpacity={0.7}
                >
                    {statusIndicator}
                    <Text style={textStyle}>{day}</Text>
                </TouchableOpacity>
            );
        }

        return days;
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
        );
    }

    if (!student) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Student Not Found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="white" />
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <LinearGradient
                    colors={[colors.primary, '#667eea']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.headerBackButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Attendance Calendar</Text>
                            <Text style={styles.headerSubtitle}>Student attendance history</Text>
                        </View>
                        <View style={styles.headerIcon}>
                            <Ionicons name="calendar" size={28} color="rgba(255,255,255,0.9)" />
                        </View>
                    </View>
                </LinearGradient>

                {/* Student Information Card */}
                <View style={styles.studentInfoContainer}>
                    <View style={styles.studentCard}>
                        <View style={styles.studentHeader}>
                            <View style={styles.avatarContainer}>
                                <LinearGradient
                                    colors={['#667eea', '#764ba2']}
                                    style={styles.avatar}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Text style={styles.avatarText}>
                                        {student.name.charAt(0).toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </View>
                            <View style={styles.studentDetails}>
                                <Text style={styles.studentName}>{student.name}</Text>
                                <Text style={styles.studentClass}>
                                    {student.Class?.name} • Roll {student.roll}
                                </Text>
                                <Text style={styles.studentSection}>
                                    {student.Section?.name} - {student.Group?.name} • {student.shift || 'N/A'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Monthly Statistics */}
                <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Monthly Overview</Text>
                    <View style={styles.statsRow}>
                        <LinearGradient
                            colors={['#10b981', '#065f46']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="checkmark-circle" size={28} color="white" />
                            <Text style={styles.statNumber}>{monthlyStats.present}</Text>
                            <Text style={styles.statLabel}>Present</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['#ef4444', '#991b1b']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Ionicons name="close-circle" size={28} color="white" />
                            <Text style={styles.statNumber}>{monthlyStats.absent}</Text>
                            <Text style={styles.statLabel}>Absent</Text>
                        </LinearGradient>

                        <LinearGradient
                            colors={['#8b5cf6', '#5b21b6']}
                            style={styles.statCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.percentageText}>{monthlyStats.percentage}%</Text>
                            <Text style={styles.statLabel}>Attendance</Text>
                        </LinearGradient>
                    </View>
                </View>

                {/* Calendar Section */}
                <View style={styles.calendarContainer}>
                    <View style={styles.calendarHeader}>
                        <Text style={styles.sectionTitle}>Attendance Calendar</Text>
                        <TouchableOpacity
                            style={styles.todayButton}
                            onPress={goToToday}
                        >
                            <Ionicons name="today" size={16} color={colors.primary} />
                            <Text style={styles.todayButtonText}>Today</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Month Navigation */}
                    <View style={styles.monthNavigation}>
                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToPreviousMonth}
                        >
                            <Ionicons name="chevron-back" size={24} color={colors.primary} />
                        </TouchableOpacity>

                        <View style={styles.monthTitleContainer}>
                            <Text style={styles.monthTitle}>
                                {monthNames[currentMonth]}
                            </Text>
                            <Text style={styles.yearTitle}>{currentYear}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.navButton}
                            onPress={goToNextMonth}
                        >
                            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.calendarGrid}>
                        {/* Days of week header */}
                        <View style={styles.weekHeader}>
                            {daysOfWeek.map(day => (
                                <View key={day} style={styles.weekDayCell}>
                                    <Text style={styles.weekDayText}>{day}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Calendar days */}
                        <View style={styles.daysContainer}>
                            {renderCalendarDays()}
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legend}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
                            <Text style={styles.legendText}>Present</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
                            <Text style={styles.legendText}>Absent</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: colors.gray[300] }]} />
                            <Text style={styles.legendText}>No Data</Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollView: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray[600],
        fontWeight: '500',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    errorTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.dark,
        marginBottom: 20,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        gap: 8,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerBackButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerText: {
        flex: 1,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400',
    },
    headerIcon: {
        marginLeft: 16,
    },
    studentInfoContainer: {
        padding: 16,
    },
    studentCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    studentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        marginRight: 16,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        color: 'white',
        fontSize: 24,
        fontWeight: 'bold',
    },
    studentDetails: {
        flex: 1,
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    studentClass: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 2,
    },
    studentSection: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    statsContainer: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '600',
        textAlign: 'center',
    },
    percentageText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginTop: 8,
        marginBottom: 4,
    },
    calendarContainer: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    calendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    todayButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary + '15',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    todayButtonText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    monthNavigation: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        gap: 24,
    },
    navButton: {
        padding: 12,
        backgroundColor: colors.primary + '10',
        borderRadius: 25,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthTitleContainer: {
        alignItems: 'center',
        minWidth: 120,
    },
    monthTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
    },
    yearTitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        marginTop: 2,
    },
    calendarGrid: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    weekHeader: {
        flexDirection: 'row',
        // backgroundColor: '#f9fafb',
        paddingVertical: 12,
    },
    weekDayCell: {
        width: (width - 80) / 7,
        alignItems: 'center',
    },
    weekDayText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        textAlign: 'center',
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: (width - 80) / 7,
        height: 45,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        // borderRadius: 8,
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    emptyDay: {
        width: (width - 80) / 7,
        height: 45,
        marginBottom: 6,
    },
    presentDay: {
        backgroundColor: '#c3efd0ff',
    },
    absentDay: {
        backgroundColor: '#fdbcbcff',
    },
    noDataDay: {
        backgroundColor: '#f3f4f667',
    },
    todayHighlight: {
        borderWidth: 2,
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
    },
    dayText: {
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        color: '#f9fafb',
    },
    presentText: {
        color: '#4fa167ff',
    },
    absentText: {
        color: '#bb5757ff',
    },
    noDataText: {
        color: '#9ca3af',
    },
    otherMonthDay: {
        backgroundColor: 'transparent',
    },
    otherMonthText: {
        color: '#6b7280',
    },
    statusDot: {
        position: 'absolute',
        top: 3,
        right: 3,
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#4b5563',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    bottomSpacing: {
        height: 20,
    },
});

export default StudentAttendanceCalendar;