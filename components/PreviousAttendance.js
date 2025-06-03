import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import DateTimePicker from "@react-native-community/datetimepicker";

const AttendanceReport = () => {
  const navigation = useNavigation();

  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [classItems, setClassItems] = useState([]);

  // Date filter state
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').toDate());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

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
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Attendance Reports</Text>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        {/* <Text style={styles.filterText}>Filter by Date:</Text>  */}
        <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
          <Text style={styles.dateText}>{dayjs(startDate).format("D MMMM YYYY")}</Text>
        </TouchableOpacity>
        <Text style={{
          fontSize: 16,
          fontWeight: "bold",
          marginHorizontal: 5,
          color: "#333",
        }}> To </Text>
        <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
          <Text style={styles.dateText}>{dayjs(endDate).format("D MMMM YYYY")}</Text>
        </TouchableOpacity>
      </View>

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

      <ScrollView contentContainerStyle={{ padding: 2 }}>
        {filterAttendanceData().length > 0 ? (
          filterAttendanceData().map((item, index) => (
            <View
              key={`${item.id}-${index}`}
              style={{
                flexDirection: "row",
                backgroundColor: "#f9f9f9",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginVertical: 4,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#e0e0e0",
              }}
            >
              {/* Date Column */}
              <View style={{ flex: 1 }}>
                <Text style={[styles.cell, { flex: 1 }]}>
                  {dayjs(item.date).format("D MMMM")}
                </Text>
                <Text
                  style={{
                    color: item.isTaken ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.isTaken ? "Taken" : "Not Taken"}
                </Text>
              </View>

              {/* Class, Group, and Section Column */}
              <View style={{ flex: 2, marginLeft: 16 }}>
                <Text style={styles.cell}>{item?.Class?.name}</Text>
                <Text style={styles.cell}>
                  {item?.Group?.name || "N/A"} ({item?.Section?.name || "N/A"})
                </Text>
              </View>

              {/* Status Column */}
              <TouchableOpacity
                onPress={() =>
                  item.isTaken ? handleButtonPress(item.id) : handleTakeAttendance(item)
                }
                style={{ flex: 1, alignItems: "flex-end" }}
              >
                <Text
                  style={{
                    ...styles.cell,
                    color: item.isTaken ? "green" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {item.isTaken ? (
                    <Icon name="eye" type="feather" size={18} color="#007bff" />
                  ) : (
                    "✏️"
                  )}
                </Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={{ textAlign: "center", marginTop: 20 }}>No attendance data available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  dateText: {
    fontSize: 16,
    color: "#007bff",
    borderWidth: 1,
    borderColor: "#999",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontWeight: "bold",
  },
  cell: {
    flex: 1,
    textAlign: 'center',
  },
});

export default AttendanceReport;
