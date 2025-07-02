import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from '@expo/vector-icons';

const AttendanceReport = () => {
  const navigation = useNavigation();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classItems, setClassItems] = useState([]);

  // Date filter state
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const Tid = await AsyncStorage.getItem('teacher-id');
      if (!Tid) throw new Error('Teacher ID not found');

      const res = await axios.get(
        `https://sjsc-backend-production.up.railway.app/api/v1/attendance/fetch/teacher-report/${Tid}`
      );

      const sortedData = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceData(sortedData);

    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setAttendanceData([]); // Reset data to avoid inconsistencies when navigating back
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Optionally clear the data or refetch when navigating back
      setAttendanceData([]);
      setLoading(true);
      fetchAttendanceData();
    }, [])
  );

  // Handle button press
  const handleButtonPress = (item) => {
    if (navigation.canGoBack()) {
      navigation.navigate('ViewAttendance', { id: item });
    }
  };

  const handleTakeAttendance = (item) => {
    console.log('Take attendance for:', item);
    if (navigation.canGoBack()) {
      navigation.navigate('TakeAttendance', {
        classId: item.classId,
        groupId: item.groupId,
        sectionId: item.sectionId,
        className: item.Class?.name,
        groupName: item.Group?.name,
        sectionName: item.Section?.name,
        attendanceId: item.id,
      });
    }
  };

  // Handle date change
  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    const currentDate = selectedDate || startDate;
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    const currentDate = selectedDate || endDate;
    setEndDate(currentDate);
  };

  const filterAttendanceData = () => {
    return attendanceData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= endDate;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingCard, { opacity: fadeAnim }]}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading Reports...</Text>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
            <Animated.View style={[styles.dot, { opacity: pulseAnim }]} />
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {/* <Animated.View style={[
        styles.headerSection,
       
      ]}>
        <View style={styles.headerIconContainer}>
          <Ionicons name="calendar-outline" size={28} color="#007AFF" />
        </View>
        <Text style={styles.headerTitle}>Attendance Reports</Text>
        <Text style={styles.headerSubtitle}>View and manage attendance records</Text>
      </Animated.View> */}

      {/* Date Filter Section */}
      <Animated.View style={[
        styles.filterSection,
       
      ]}>
        <View style={styles.filterHeader}>
          <Ionicons name="filter" size={18} color="#007AFF" />
          <Text style={styles.filterTitle}>Filter by Date Range</Text>
        </View>
        
        <View style={styles.dateRangeContainer}>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar" size={16} color="#007AFF" />
              <Text style={styles.dateButtonText}>
                {dayjs(startDate).format("D MMM YYYY")}
              </Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.dateRangeSeparator}>
            <Text style={styles.dateRangeText}>to</Text>
            <View style={styles.dateRangeLine} />
          </View>
          
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar" size={16} color="#007AFF" />
              <Text style={styles.dateButtonText}>
                {dayjs(endDate).format("D MMM YYYY")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Show Date Pickers if needed */}
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

      {/* Statistics */}
      {/* <Animated.View style={[
        styles.statsSection,
       
      ]}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{filterAttendanceData().length}</Text>
            <Text style={styles.statLabel}>Total Records</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#34C759' }]}>
              {filterAttendanceData().filter(item => item.isTaken).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#FF3B30' }]}>
              {filterAttendanceData().filter(item => !item.isTaken).length}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>
      </Animated.View> */}

      {/* Attendance Records List */}
      <ScrollView 
        style={styles.recordsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.recordsContainer}
      >
        {filterAttendanceData().length > 0 ? (
          filterAttendanceData().map((item, index) => (
            <Animated.View
              key={`${item.id}-${index}`}
              style={[
                styles.recordCard,
                item.isTaken ? styles.completedCard : styles.pendingCard,
              ]}
            >
              {/* Status Indicator */}
              <View style={[
                styles.statusIndicator,
                item.isTaken ? styles.completedIndicator : styles.pendingIndicator
              ]} />

              {/* Record Content */}
              <View style={styles.recordContent}>
                {/* Date Section */}
                <View style={styles.dateSection}>
                  <Text style={styles.recordDate}>
                    {dayjs(item.date).format("D")}
                  </Text>
                  <Text style={styles.recordMonth}>
                    {dayjs(item.date).format("MMM")}
                  </Text>
                </View>

                {/* Class Info Section */}
                <View style={styles.classInfoSection}>
                  <Text style={styles.className}>{item?.Class?.name}</Text>
                  <Text style={styles.classDetails}>
                    {item?.Group?.name || "All Groups"} • {item?.Section?.name || "All Sections"}
                  </Text>
                  <View style={styles.statusBadge}>
                    <View style={[
                      styles.statusDot,
                      item.isTaken ? styles.completedDot : styles.pendingDot
                    ]} />
                    <Text style={[
                      styles.statusText,
                      item.isTaken ? styles.completedText : styles.pendingText
                    ]}>
                      {item.isTaken ? "Completed" : "Pending"}
                    </Text>
                  </View>
                </View>

                {/* Action Section */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() =>
                    item.isTaken ? handleButtonPress(item.id) : handleTakeAttendance(item)
                  }
                >
                  <View style={[
                    styles.actionButtonContent,
                    item.isTaken ? styles.viewAction : styles.takeAction
                  ]}>
                    <Ionicons 
                      name={item.isTaken ? "eye" : "create"} 
                      size={18} 
                      color="white" 
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))
        ) : (
          <Animated.View style={[styles.emptyState, { opacity: fadeAnim }]}>
            <Ionicons name="document-outline" size={48} color="#8E8E93" />
            <Text style={styles.emptyStateText}>No attendance records found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your date filter range
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
  filterSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
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
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginLeft: 8,
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    flex: 1,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  dateRangeSeparator: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  dateRangeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateRangeLine: {
    width: 20,
    height: 2,
    backgroundColor: '#E5E5EA',
    borderRadius: 1,
  },
  statsSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
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
  recordsList: {
    flex: 1,
    marginTop: 16,
  },
  recordsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  completedCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#34C759',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
  completedIndicator: {
    backgroundColor: '#34C759',
  },
  pendingIndicator: {
    backgroundColor: '#FF3B30',
  },
  recordContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
  },
  dateSection: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 50,
  },
  recordDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    lineHeight: 24,
  },
  recordMonth: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  classInfoSection: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  classDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  completedDot: {
    backgroundColor: '#34C759',
  },
  pendingDot: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedText: {
    color: '#34C759',
  },
  pendingText: {
    color: '#FF3B30',
  },
  actionButton: {
    paddingLeft: 12,
  },
  actionButtonContent: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAction: {
    backgroundColor: '#007AFF',
  },
  takeAction: {
    backgroundColor: '#FF9500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default AttendanceReport;
