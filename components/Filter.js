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
import { api } from "../utils/api";
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

    // Dropdown states
    const [levelOpen, setLevelOpen] = useState(false);
    const [shiftOpen, setShiftOpen] = useState(false);
    const [classOpen, setClassOpen] = useState(false);
    const [sectionOpen, setSectionOpen] = useState(false);
    const [groupOpen, setGroupOpen] = useState(false);

    // Dropdown items
    const [levelItems, setLevelItems] = useState([
        { label: 'School', value: 'School' },
        { label: 'College', value: 'College' },
    ]);
    const [shiftItems, setShiftItems] = useState([
        { label: 'Morning', value: 'Morning' },
        { label: 'Day', value: 'Noon' },
    ]);
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
        updateSectionItems();
    }, [classId]);

    // Fetch classes from the API
    const fetchClasses = async () => {
        try {
            const response = await api.get('/settings/fetch/class');
            const classes = response.data.data || [];
            setData(classes);
            updateClassItems(classes);
        } catch (error) {
            console.error("Error fetching classes:", error);
            Alert.alert("Error", "Failed to fetch classes");
        }
    };

    // Update class items based on level filter
    const updateClassItems = (classes = data) => {
        let filteredClasses = classes;
        if (level) {
            filteredClasses = classes.filter((cls) => cls.level === level);
        }
        
        setClassItems([
            { label: 'All Classes', value: '' },
            ...filteredClasses.map((cls) => ({
                label: cls.name,
                value: cls.id,
            }))
        ]);
    };

    // Update section items when class is selected
    const updateSectionItems = () => {
        if (!classId) {
            setSectionItems([]);
            return;
        }

        const selectedClass = data.find((cls) => cls.id == classId);
        if (selectedClass && selectedClass.Sections) {
            setSectionItems([
                { label: 'All Sections', value: '' },
                ...selectedClass.Sections.map((sec) => ({
                    label: sec.name,
                    value: sec.id,
                }))
            ]);
        }
    };

    // Update group items when class is selected
    const updateGroupItems = () => {
        if (!classId) {
            setGroupItems([]);
            return;
        }

        const selectedClass = data.find((cls) => cls.id == classId);
        if (selectedClass && selectedClass.Groups) {
            setGroupItems([
                { label: 'All Groups', value: '' },
                ...selectedClass.Groups.map((grp) => ({
                    label: grp.name,
                    value: grp.id,
                }))
            ]);
        }
    };

    // Update items when data or filters change
    useEffect(() => {
        updateClassItems();
    }, [level, data]);

    useEffect(() => {
        updateSectionItems();
        updateGroupItems();
    }, [classId, data]);

    // Fetch classes on component mount
    useEffect(() => {
        fetchClasses();
    }, []);

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
                    />
                </View>

                {/* Shift Filter (only for School level) */}
                {level === "School" && (
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
                        />
                    </View>
                )}

                {/* Class Filter */}
                <View style={styles.filterItem}>
                    <Text style={styles.label}>Class</Text>
                    <DropDownPicker
                        open={classOpen}
                        value={classId}
                        items={classItems}
                        setOpen={setClassOpen}
                        setValue={setClass}
                        setItems={setClassItems}
                        onChangeValue={handleClassChange}
                        placeholder="Class"
                        style={styles.dropdown}
                        textStyle={styles.dropdownText}
                        placeholderStyle={styles.placeholderText}
                        dropDownContainerStyle={styles.dropdownContainer}
                        zIndex={3000}
                        zIndexInverse={3000}
                    />
                </View>

                {/* Section Filter (only if a class is selected) */}
                {classId && sectionItems.length > 1 && (
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
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={2000}
                            zIndexInverse={4000}
                        />
                    </View>
                )}

                {/* Group Filter (only if a class is selected) */}
                {classId && groupItems.length > 1 && (
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
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            placeholderStyle={styles.placeholderText}
                            dropDownContainerStyle={styles.dropdownContainer}
                            zIndex={1000}
                            zIndexInverse={5000}
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