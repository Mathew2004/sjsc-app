import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    FlatList,
    Linking,
    ActivityIndicator,
    Text,
    RefreshControl,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import { Avatar, ListItem, Icon } from "react-native-elements";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
// import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');


const fetchTeachers = async (signal) => {
    try {
        const response = await fetch("https://sjsc-backend-production.up.railway.app/api/v1/teachers/fetch", { signal });
        const data = await response.json();
        return Array.isArray(data?.teachers) ? data.teachers : [];
    } catch (error) {
        if (error.name === "AbortError") {
            console.log("Request was aborted");
        } else {
            console.error("Error fetching teachers:", error);
        }
        throw error;
    }
};

const TeacherCard = React.memo(({ teacher, index }) => {
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

    const handleCall = () => {
        Linking.openURL(`tel:${teacher.phone}`);
    };

    const handleEmail = () => {
        Linking.openURL(`mailto:${teacher.email}`);
    };

    return (
        <Animated.View
            style={[
                styles.teacherCard,
            ]}
        >
            <View style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <Avatar
                        rounded
                        size={60}
                        source={{
                            uri: teacher.extra?.image || `https://assets.chorcha.net/ZUfPUPHLvDxY_yOveJGZm.png`
                        }}
                        containerStyle={styles.avatar}
                    />
                    <View style={styles.statusDot} />
                </View>

                <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <View style={styles.positionContainer}>
                        <Ionicons name="briefcase-outline" size={14} color="#6366f1" />
                        <Text style={styles.positionText}>
                            {teacher?.extra?.position || "Teacher"}
                        </Text>
                    </View>
                    {teacher.extra?.dept && (
                        <View style={styles.deptContainer}>
                            <Ionicons name="school-outline" size={14} color="#8b5cf6" />
                            <Text style={styles.deptText}>{teacher.extra.dept}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View style={styles.contactActions}>
                <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
                    <View style={styles.contactButtonContent}>
                        <Ionicons name="call-outline" size={18} color="#059669" />
                        <Text style={styles.contactButtonText}>Call</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
                    <View style={styles.contactButtonContent}>
                        <Ionicons name="mail-outline" size={18} color="#dc2626" />
                        <Text style={styles.contactButtonText}>Email</Text>
                    </View>
                </TouchableOpacity>
            </View>

        </Animated.View>
    );
});

export default function TeacherScreen() {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [headerAnim] = useState(new Animated.Value(0));

    const loadTeachers = useCallback(async (signal) => {
        try {
            setLoading(true);
            const data = await fetchTeachers(signal);
            setTeachers(data);
            setFilteredTeachers(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            const abortController = new AbortController();

            const fetchData = async () => {
                await loadTeachers(abortController.signal);
            };

            fetchData();

            // Animate header on focus
            Animated.timing(headerAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();

            return () => abortController.abort();
        }, [])
    );

    useEffect(() => {
        setFilteredTeachers(
            teachers.filter((teacher) =>
                teacher.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.extra?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                teacher.extra?.dept?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, teachers]);

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Animated.View
                style={[
                    styles.emptyIconContainer,
                ]}
            >
                <Ionicons name="people-outline" size={64} color="#e5e7eb" />
            </Animated.View>
            <Text style={styles.emptyTitle}>No Teachers Found</Text>
            <Text style={styles.emptySubtitle}>
                {searchQuery ? 'Try adjusting your search criteria' : 'No teachers available at the moment'}
            </Text>
        </View>
    );

    const renderHeader = () => (
        <Animated.View
            style={[
                styles.headerContainer,
            ]}
        >
            <View style={styles.titleContainer}>
                {/* <Text style={styles.title}>Faculty Directory</Text> */}
                <Text style={styles.subtitle}>
                    {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} available
                </Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => setSearchQuery('')}
                    >
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* <LinearGradient
                colors={['#f8fafc', '#f1f5f9']}
                style={StyleSheet.absoluteFillObject}
            /> */}

            {renderHeader()}

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6366f1" />
                    <Text style={styles.loadingText}>Loading teachers...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredTeachers}
                    keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                    renderItem={({ item, index }) => <TeacherCard teacher={item} index={index} />}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => {
                                setRefreshing(true);
                                loadTeachers();
                            }}
                            colors={['#6366f1']}
                            tintColor="#6366f1"
                        />
                    }
                    ListEmptyComponent={renderEmptyState}
                />
            )}
        </View>
    );
}


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
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
        fontWeight: '500',
    },
    clearButton: {
        marginLeft: 8,
        padding: 4,
    },
    listContainer: {
        padding: 20,
        paddingTop: 8,
    },
    teacherCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 4,
        // shadowColor: '#000',
        // shadowOffset: {
        //     width: 0,
        //     height: 4,
        // },
        // shadowOpacity: 0.1,
        // shadowRadius: 12,
        // elevation: 5,
        // borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: 16,
    },
    avatar: {
        shadowColor: '#6366f1',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    statusDot: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#10b981',
        borderWidth: 3,
        borderColor: 'white',
    },
    teacherInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    teacherName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    positionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    positionText: {
        fontSize: 14,
        color: '#6366f1',
        fontWeight: '600',
        marginLeft: 6,
    },
    deptContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    deptText: {
        fontSize: 14,
        color: '#8b5cf6',
        fontWeight: '500',
        marginLeft: 6,
    },
    contactActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        gap: 12,
    },
    contactButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.2)',
    },
    contactButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 6,
    },
    contactDetails: {
        backgroundColor: 'rgba(248, 250, 252, 0.8)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(229, 231, 235, 0.5)',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    contactInfo: {
        fontSize: 13,
        color: '#6b7280',
        marginLeft: 8,
        fontWeight: '500',
        flex: 1,
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