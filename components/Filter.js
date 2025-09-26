import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getTeacherId } from "../utils/api";
import { colors } from "../utils/colors";

const Filter = ({
    setClass,
    setSection,
    setGroup,
    setShift,
    setLevel,
    classId,
    section,
    group,
    shift,
    level,
    handleSearch,
}) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [teacherData, setTeacherData] = useState(null);

    // Dropdown states
    const [levelOpen, setLevelOpen] = useState(false);
    const [shiftOpen, setShiftOpen] = useState(false);
    const [classOpen, setClassOpen] = useState(false);
    const [sectionOpen, setSectionOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);

    // Dropdown items
    const [levelItems, setLevelItems] = useState([
        { label: 'School', value: 'school' },
        { label: 'College', value: 'college' },
    ]);
    const [shiftItems, setShiftItems] = useState([]);
    const [classItems, setClassItems] = useState([]);
    const [sectionItems, setSectionItems] = useState([]);
    const [groupItems, setGroupItems] = useState([]);

    // Reset filters when level changes
    useEffect(() => {
        setClass("");
        setSection("");
        setGroup("");
        setShift("");
        setSectionItems([]);
        setGroupItems([]);
    }, [level]);

    // Reset section and group when class changes
    useEffect(() => {
        setSection("");
        setGroup("");
        setSectionItems([]);
        setGroupItems([]);
    }, [classId]);


    // Fetch Teacher Data
    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const Tid = await AsyncStorage.getItem('teacher-id');
                const res = await api.get(`/teachers/fetch/${Tid}`);
                setTeacherData(res.data.teacher);
                setLoading(false);

                // Set Class Items with proper level mapping
                const classes = res.data.teacher.assignedClasses?.map(cls => ({
                    label: cls.name,
                    level: cls.level,
                    value: cls.id,
                })) || [];
                setClassItems(classes);
                
                // Set Shift Items from teacher's assigned shifts
                const shifts = res.data.teacher.assignedShift?.map(shift => ({
                    label: shift,
                    value: shift,
                })) || [];
                setShiftItems(shifts);
            } catch (error) {
                console.error('Error fetching teacher data:', error);
                setLoading(false);
            }
        };

        fetchTeacherData();
    }, []);


    useEffect(() => {
        if (classId && teacherData) {
            const groups = teacherData.assignedGroups
                ?.filter(group => group.Class.id === classId)
                ?.map(group => ({
                    label: group.name,
                    value: group.id,
                }));
            setGroupItems(groups);
            setGroup("");
            setSection("");
        }
    }, [classId, teacherData]);


    // Update Section Items when Class is selected
    useEffect(() => {
        if (classId && teacherData) {
            const sections = teacherData.assignedSections
                ?.filter(section => section.Class.id === classId)
                ?.map(section => ({
                    label: section.name,
                    value: section.id,
                }));
            setSectionItems(sections);
            setSection("");
        }
    }, [classId, teacherData]);

    // Reset all filters
    const resetFilters = () => {
        setLevel("");
        setClass("");
        setSection("");
        setGroup("");
        setShift("");
    };

    // Handle level change
    const handleLevelChange = (value) => {
        setLevel(value);
    };

    // Handle class change
    const handleClassChange = (value) => {
        setClass(value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Ionicons name="filter" size={20} color={colors.primary} />
                <Text style={styles.title}>Filters</Text>
            </View>

            {/* Filters in wrap layout */}
            <View style={styles.filtersContainer}>
                {/* Level Filter */}
                <View style={styles.filterItem}>
                    <Text style={styles.label}>Level</Text>
                    <DropDownPicker
                        open={levelOpen}
                        value={level}
                        items={levelItems}
                        setOpen={setLevelOpen}
                        setValue={setLevel}
                        setItems={setLevelItems}
                        onChangeValue={handleLevelChange}
                        placeholder="Level"
                        style={styles.dropdown}
                        textStyle={styles.dropdownText}
                        placeholderStyle={styles.placeholderText}
                        dropDownContainerStyle={styles.dropdownContainer}
                        zIndex={5000}
                        zIndexInverse={1000}
                        listMode="SCROLLVIEW"
                    />
                </View>

                {/* Shift Filter (only for School level) */}
                {level === "school" && (
                    <View style={styles.filterItem}>
                        <Text style={styles.label}>Shift</Text>
                        <DropDownPicker
                            open={shiftOpen}
                            value={shift}
                            items={shiftItems}
                            setOpen={setShiftOpen}
                            setValue={setShift}
                            setItems={setShiftItems}
                            placeholder="Shift"
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={4000}
                            zIndexInverse={2000}
                            listMode="SCROLLVIEW"
                        />
                    </View>
                )}

                {/* Class Filter */}
                <View style={styles.filterItem}>
                    <Text style={styles.label}>Class</Text>
                    <DropDownPicker
                        open={classOpen}
                        value={classId}
                        items={classItems.filter(item => item.level?.toLowerCase() === level?.toLowerCase())}
                        setOpen={setClassOpen}
                        setValue={setClass}
                        setItems={setClassItems}
                        placeholder="Select Class"
                        style={[styles.dropdown, !level && styles.disabledDropdown]}
                        textStyle={styles.dropdownText}
                        disabled={!level}
                        zIndex={3000}
                        listMode="SCROLLVIEW"
                        dropDownContainerStyle={styles.dropdownContainer}
                    />
                </View>

                {/* Section Filter (only if a class is selected) */}
                {classId && sectionItems.length > 0 && (
                    <View style={styles.filterItem}>
                        <Text style={styles.label}>Section</Text>
                        <DropDownPicker
                            open={sectionOpen}
                            value={section}
                            items={sectionItems}
                            setOpen={setSectionOpen}
                            setValue={setSection}
                            setItems={setSectionItems}
                            placeholder="Section"
                            style={[styles.dropdown, !classId && styles.disabledDropdown]}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            disabled={!classId}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={2000}
                            zIndexInverse={4000}
                            listMode="SCROLLVIEW"
                        />
                    </View>
                )}

                {/* Group Filter (only if a class is selected) */}
                {classId && groupItems.length > 0 && (
                    <View style={styles.filterItem}>
                        <Text style={styles.label}>Group</Text>
                        <DropDownPicker
                            open={groupOpen}
                            value={group}
                            items={groupItems}
                            setOpen={setGroupOpen}
                            setValue={setGroup}
                            setItems={setGroupItems}
                            placeholder="Group"
                            style={[styles.dropdown, !classId && styles.disabledDropdown]}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            disabled={!classId}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={1000}
                            zIndexInverse={5000}
                            listMode="SCROLLVIEW"
                        />
                    </View>
                )}
            </View>

            {/* Action Buttons */}
            {handleSearch && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearch}
                    >
                        <Ionicons name="search" size={18} color={colors.white} />
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.resetButton}
                        onPress={resetFilters}
                    >
                        <Ionicons name="refresh" size={18} color={colors.gray[600]} />
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        marginHorizontal: 16,
        marginVertical: 8,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.dark,
        marginLeft: 8,
    },
    filtersContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    filterItem: {
        width: '48%', // Two items per row with gap
        marginBottom: 16,
        minWidth: 140, // Minimum width for smaller screens
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.gray[700],
        marginBottom: 6,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dropdown: {
        borderColor: colors.gray[200],
        borderWidth: 1.5,
        borderRadius: 12,
        minHeight: 44,
        backgroundColor: colors.gray[50],
        paddingHorizontal: 12,
    },
    disabledDropdown: {
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderColor: 'rgba(148, 163, 184, 0.3)',
    },
    dropdownContainer: {
        borderColor: colors.gray[200],
        borderRadius: 12,
        backgroundColor: colors.white,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    dropdownText: {
        fontSize: 14,
        color: colors.dark,
        fontWeight: '500',
    },
    placeholderText: {
        fontSize: 14,
        color: colors.gray[500],
        fontWeight: '400',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginTop: 8,
    },
    searchButton: {
        flex: 2,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    searchButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    resetButton: {
        flex: 1,
        backgroundColor: colors.gray[100],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.gray[200],
    },
    resetButtonText: {
        color: colors.gray[600],
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 6,
    },
});

export default Filter;