import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Platform,
    Dimensions,
    StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from "../utils/colors";
import { api } from "../utils/api";
import Filter from "../components/Filter";

const { width } = Dimensions.get('window');

const AttendanceSummary = ({ navigation }) => {
    // Filter states
    const [classId, setClass] = useState("");
    const [section, setSection] = useState("");
    const [group, setGroup] = useState("");
    const [shift, setShift] = useState("");
    const [level, setLevel] = useState("");
    const [teacherId, setTeacherId] = useState("");

    // Date range states
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Data states
    const [attendanceData, setAttendanceData] = useState([]);
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Set default date range (last 30 days)
    useEffect(() => {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        setStartDate(thirtyDaysAgo);
        setEndDate(today);
    }, []);



    // Fetch attendance summary
    const fetchAttendanceSummary = useCallback(async () => {
        if (!classId) {
            Alert.alert("Error", "Please select a class");
            return;
        }

        try {
            setLoading(true);
            const params = new URLSearchParams({
                classId,
                ...(section && { sectionId: section }),
                ...(group && { groupId: group }),
                ...(shift && { shift }),
                ...(teacherId && { teacherId }),
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            });

            const response = await api.get(`/attendance-summary?${params}`);
            const result = response.data;
            setAttendanceData(result.data || []);
            setSummaryData(result.summary || null);
            // Alert.alert("Success", "Attendance summary loaded successfully");
        } catch (error) {
            console.error("Error fetching attendance summary:", error);
            Alert.alert("Error", "Failed to fetch attendance summary");
        } finally {
            setLoading(false);
        }
    }, [classId, section, group, shift, teacherId, startDate, endDate]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAttendanceSummary().finally(() => setRefreshing(false));
    }, [fetchAttendanceSummary]);



    // Date picker handlers
    const onStartDateChange = (event, selectedDate) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate);
        }
    };

    const onEndDateChange = (event, selectedDate) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate);
        }
    };

    // Get teacher name
    const getTeacherName = (tid) => {
        if (!tid) return 'All Teachers';
        // const teacher = teachers.find(t => t.id === tid);
        // return teacher ? teacher.name : 'Unknown Teacher';
        return 'Unknown Teacher';
    };

    // Get attendance status color
    const getAttendanceColor = (percentage) => {
        if (percentage >= 90) return colors.success;
        if (percentage >= 80) return colors.info;
        if (percentage >= 70) return colors.warning;
        return colors.danger;
    };

    // Get attendance status text
    const getAttendanceStatus = (percentage) => {
        if (percentage >= 80) return 'Good';
        if (percentage >= 70) return 'Average';
        return 'Poor';
    };

    // Format date for display
    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB');
    };

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor={colors.primary} barStyle="light-content" />

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                showsVerticalScrollIndicator={false}
            >
                {/* Modern Header with Gradient */}
                <LinearGradient
                    colors={[colors.primary, '#667eea']}
                    style={styles.headerGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                        <View style={styles.headerText}>
                            <Text style={styles.headerTitle}>Attendance Summary</Text>
                            <Text style={styles.headerSubtitle}>Monitor student attendance patterns</Text>
                        </View>
                        {/* <View style={styles.headerIcon}>
                            <Ionicons name="analytics" size={28} color="rgba(255,255,255,0.9)" />
                        </View> */}
                    </View>
                </LinearGradient>

                {/* Filters */}
                <Filter
                    setClass={setClass}
                    setSection={setSection}
                    setGroup={setGroup}
                    setShift={setShift}
                    setLevel={setLevel}
                    classId={classId}
                    section={section}
                    group={group}
                    shift={shift}
                    level={level}
                    handleSearch={fetchAttendanceSummary}
                />

                {/* Date Range Card */}
                <View style={styles.dateCard}>
                    <View style={styles.dateHeader}>
                        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
                        <Text style={styles.dateTitle}>Date Range</Text>
                    </View>

                    <View style={styles.dateRow}>
                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>Start Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowStartDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={16} color={colors.primary} />
                                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.dateSeparator}>
                            <Ionicons name="arrow-forward" size={16} color={colors.gray[400]} />
                        </View>

                        <View style={styles.dateColumn}>
                            <Text style={styles.dateLabel}>End Date</Text>
                            <TouchableOpacity
                                style={styles.dateButton}
                                onPress={() => setShowEndDatePicker(true)}
                            >
                                <Ionicons name="calendar" size={16} color={colors.primary} />
                                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={startDate}
                        mode="date"
                        display="default"
                        onChange={onStartDateChange}
                    />
                )}
                {showEndDatePicker && (
                    <DateTimePicker
                        value={endDate}
                        mode="date"
                        display="default"
                        onChange={onEndDateChange}
                    />
                )}

                {/* Loading Indicator */}
                {loading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading attendance data...</Text>
                    </View>
                )}

                {/* Summary Cards */}
                {summaryData && !loading && (
                    <View style={styles.summaryContainer}>
                        <Text style={styles.sectionTitle}>Overview</Text>

                        <View style={styles.summaryGrid}>
                            {/* Total Days Card */}
                            <LinearGradient
                                colors={['#667eea', '#764ba2']}
                                style={styles.summaryCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.summaryIcon}>
                                    <Ionicons name="calendar-outline" size={24} color="white" />
                                </View>
                                <Text style={styles.summaryValue}>{summaryData.totalReports || 0}</Text>
                                <Text style={styles.summaryLabel}>Total Days</Text>
                            </LinearGradient>

                            {/* Total Students Card */}
                            <LinearGradient
                                colors={['#f093fb', '#f5576c']}
                                style={styles.summaryCard}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.summaryIcon}>
                                    <Ionicons name="people-outline" size={24} color="white" />
                                </View>
                                <Text style={styles.summaryValue}>{attendanceData.length}</Text>
                                <Text style={styles.summaryLabel}>Students</Text>
                            </LinearGradient>
                        </View>

                        {/* Teacher Info Card */}
                        {/* <View style={styles.teacherCard}>
                            <View style={styles.teacherIcon}>
                                <Ionicons name="person-outline" size={20} color={colors.primary} />
                            </View>
                            <View style={styles.teacherInfo}>
                                <Text style={styles.teacherLabel}>Teacher</Text>
                                <Text style={styles.teacherName}>
                                    {getTeacherName(summaryData?.reportInfo?.teacherId)}
                                </Text>
                            </View>
                        </View> */}
                    </View>
                )}

                {/* Student Attendance List */}
                {attendanceData.length > 0 && !loading ? (
                    <View style={styles.listContainer}>
                        <Text style={styles.sectionTitle}>Student Attendance</Text>
                        {attendanceData.map((student, index) => (
                            <TouchableOpacity
                                key={student.studentId || index}
                                style={styles.studentCard}
                                onPress={() => navigation.navigate('StudentAttendanceCalendar', {
                                    studentId: student.studentId || student.id
                                })}
                                activeOpacity={0.7}
                            >
                                <View style={styles.studentRow}>
                                    <View style={styles.studentInfo}>
                                        <Text style={styles.studentName}>{student.name}</Text>
                                        <Text style={styles.studentRoll}>Roll: {student.roll}</Text>
                                    </View>

                                    <View style={styles.attendanceInfo}>
                                        <Text style={styles.attendanceStats}>
                                            <Text style={[styles.statText, { color: colors.success }]}>P:{student.present}</Text>
                                            <Text style={styles.statSeparator}> • </Text>
                                            <Text style={[styles.statText, { color: colors.danger }]}>A:{student.absent}</Text>
                                        </Text>
                                        <View style={styles.percentageContainer}>
                                            <Text
                                                style={[
                                                    styles.percentageText,
                                                    { color: getAttendanceColor(student.attendancePercentage) }
                                                ]}
                                            >
                                                {student.attendancePercentage}%
                                            </Text>
                                            <Ionicons name="chevron-forward" size={16} color={colors.gray[400]} />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    !loading && summaryData && (
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIcon}>
                                <Ionicons name="document-text-outline" size={48} color={colors.gray[400]} />
                            </View>
                            <Text style={styles.emptyTitle}>No attendance data found</Text>
                            <Text style={styles.emptySubtitle}>
                                Try adjusting your filters or date range
                            </Text>
                        </View>
                    )
                )}

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
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '400',
    },
    headerIcon: {
        marginLeft: 16,
    },
    dateCard: {
        backgroundColor: 'white',
        marginHorizontal: 16,
        marginVertical: 12,
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: colors.gray[100],
    },
    dateHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dateTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
        marginLeft: 8,
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    dateColumn: {
        flex: 1,
    },
    dateSeparator: {
        marginHorizontal: 16,
    },
    dateLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray[600],
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dateButton: {
        backgroundColor: colors.gray[50],
        borderWidth: 1.5,
        borderColor: colors.gray[200],
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    dateText: {
        fontSize: 14,
        color: colors.dark,
        fontWeight: '500',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: colors.gray[600],
        fontWeight: '500',
    },
    summaryContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.dark,
        marginBottom: 16,
        marginLeft: 4,
    },
    summaryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center',
        minHeight: 120,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    summaryIcon: {
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
    },
    summaryLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
        textAlign: 'center',
    },
    teacherCard: {
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    teacherIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.primary + '15',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    teacherInfo: {
        flex: 1,
    },
    teacherLabel: {
        fontSize: 12,
        color: colors.gray[600],
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    teacherName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.dark,
    },
    listContainer: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
    studentCard: {
        backgroundColor: 'white',
        marginBottom: 8,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray[100],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 2,
        elevation: 1,
    },
    studentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    studentInfo: {
        flex: 1,
    },
    studentName: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.dark,
        marginBottom: 2,
    },
    studentRoll: {
        fontSize: 11,
        color: colors.gray[500],
        fontWeight: '500',
    },
    attendanceInfo: {
        alignItems: 'flex-end',
    },
    attendanceStats: {
        fontSize: 12,
        marginBottom: 3,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statSeparator: {
        color: colors.gray[400],
        fontSize: 12,
    },
    percentageContainer: {
        alignItems: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    percentageText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 40,
        marginHorizontal: 16,
        backgroundColor: 'white',
        borderRadius: 16,
        marginVertical: 12,
    },
    emptyIcon: {
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gray[700],
        marginBottom: 8,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray[500],
        textAlign: 'center',
        lineHeight: 20,
    },
    bottomSpacing: {
        height: 20,
    },
});

export default AttendanceSummary;