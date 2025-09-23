import React, { useState, useEffect } from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet, ScrollView, Animated, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import { useTeacher } from '../hooks';
import { api } from '../utils/api';



const Menus = [
    {
        item: 'Attendance',
        icon: require('../assets/icons/attendance.png'),
        href: 'Attendance',
    },
    {
        item: 'Marks',
        icon: require('../assets/icons/marks.png'),
        href: 'Marks',
    },
    {
        item: 'Attendance History',
        icon: require('../assets/icons/attendance-history.png'),
        href: 'Notice',
    },
    {
        item: 'Marks Sheets',
        icon: require('../assets/icons/marks-history.png'),
        href: 'MarksList',
    },
    {
        item: 'Teachers',
        icon: require('../assets/icons/teacher.png'),
        href: 'Teachers',
    },

];

// Notice Card Component
const NoticeCard = ({ notice, onPress }) => {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#10b981';
            default: return '#6b7280';
        }
    };

    const getPriorityIcon = (priority) => {
        switch (priority) {
            case 'high': return 'alert-circle';
            case 'medium': return 'information-circle';
            case 'low': return 'checkmark-circle';
            default: return 'information-circle';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateText = (text, maxLength = 80) => {
        if (text.length <= maxLength) return text;
        return text.substr(0, maxLength) + '...';
    };

    return (
        <TouchableOpacity
            style={styles.noticeCard}
            onPress={() => onPress(notice)}
            activeOpacity={0.8}
        >
            <View style={styles.noticeHeader}>
                <View style={styles.noticeTitleContainer}>
                    <Ionicons
                        name={getPriorityIcon(notice.priority)}
                        size={16}
                        color={getPriorityColor(notice.priority)}
                        style={styles.priorityIcon}
                    />
                    <Text style={styles.noticeTitle} numberOfLines={1}>
                        {notice.title}
                    </Text>
                </View>
                <Text style={styles.noticeDate}>{formatDate(notice.date)}</Text>
            </View>
            <Text style={styles.noticeBody} numberOfLines={3}>
                {truncateText(notice.body)}
            </Text>
            <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(notice.priority) }]} />
        </TouchableOpacity>
    );
};

export default function HomeScreen() {
    console.log("Home");
    const navigation = useNavigation();

    const { teacher } = useTeacher();
    const teachers_level = teacher?.assignedClasses[0]?.level;

    const [notices, setNotices] = useState([]);
    const [loadingNotices, setLoadingNotices] = useState(true);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    console.log('Teacher Level:', teachers_level);
    // Fetch notices from API
    const fetchNotices = async () => {
        try {
            setLoadingNotices(true);
            const res = await api.get('/notices/fetch');
            console.log('API Response:', res.data);
            const data = res.data.data || [];
            console.log('Notices data:', data);
            // Transform API data to match NoticeCard props
            const transformedNotices = data.map(notice => ({
                id: notice._id || notice.id,
                title: notice.title,
                body: notice.description,
                priority: notice.priority || 'medium',
                level: notice.level || 'All',
                date: notice.date ? notice.date : new Date().toISOString(),
                type: notice.type || 'general'
            }));
            console.log('Transformed notices:', transformedNotices);

            setNotices(transformedNotices);
        } catch (error) {
            console.error('Error fetching notices:', error);
            // Fallback to empty array if API fails
            setNotices([]);
        } finally {
            setLoadingNotices(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchNotices().finally(() => setRefreshing(false));
    }, []);

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleNoticePress = (notice) => {
        console.log('Notice pressed:', notice);
        setSelectedNotice(notice);
        setModalVisible(true);
    };

    const formatFullDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <ScrollView 
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#6366f1']}
                    tintColor="#6366f1"
                />
            }
        >
            {/* Notice Section */}
            {notices && notices.length > 0 && notices.some(notice => notice.level === teachers_level || notice.level === 'All') && (
                <View style={styles.noticeSection}>
                    <View style={styles.noticeSectionHeader}>
                        <Ionicons name="notifications" size={22} color="#6366f1" />
                        <Text style={styles.noticeSectionTitle}>Latest Notices</Text>
                    </View>

                    {loadingNotices ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#6366f1" />
                            <Text style={styles.loadingText}>Loading notices...</Text>
                        </View>
                    ) : notices.length > 0 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.noticeScrollContainer}
                            style={styles.noticeScrollView}
                        >
                            {notices.map((notice) => {
                                if (notice.level === teachers_level || notice.level === 'All') {
                                    return (
                                        <NoticeCard
                                            key={notice.id}
                                            notice={notice}
                                            onPress={() => handleNoticePress(notice)}
                                        />
                                    );
                                } else {
                                    return <View><Text>No notices available</Text></View>;
                                }
                            })}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyNoticesContainer}>
                            <Ionicons name="document-outline" size={48} color="#9ca3af" />
                            <Text style={styles.emptyNoticesText}>No notices available</Text>
                        </View>
                    )}
                </View>
            )}

            {/* Quick Actions Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.sectionUnderline} />
            </View>

            <View style={styles.menuContainer}>
                <View style={styles.menuGrid}>
                    {Menus.map((menu, index) => (
                        <View key={index} style={styles.cardWrapper}>
                            <Card item={menu.item} icon={menu.icon} href={menu.href} />
                        </View>
                    ))}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </View>

            {/* Notice Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notice Details</Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {selectedNotice && (
                            <ScrollView style={styles.modalContent}>
                                <View style={styles.modalNoticeHeader}>
                                    <Text style={styles.modalNoticeTitle}>
                                        {selectedNotice.title || 'No title'}
                                    </Text>
                                    <Text style={styles.modalNoticeDate}>
                                        {formatFullDate(selectedNotice.date)}
                                    </Text>
                                </View>

                                <View style={styles.modalNoticeBody}>
                                    <Text style={styles.modalNoticeBodyText}>
                                        {selectedNotice.body || selectedNotice.description || 'No description available'}
                                    </Text>
                                </View>

                                <View style={styles.modalNoticePriority}>
                                    <Text style={styles.modalPriorityLabel}>For </Text>
                                    <View style={[
                                        styles.priorityBadge,
                                        {
                                            backgroundColor: selectedNotice.level === 'Colllege' ? '#ef4444' :
                                                selectedNotice.level === 'School' ? '#f59e0b' : '#10b981'
                                        }
                                    ]}>
                                        <Text style={styles.priorityBadgeText}>
                                            {(selectedNotice.level || 'All').toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 20,
    },
    noticeSection: {
        // marginHorizontal: 20,
        marginBottom: 30,
    },
    noticeSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        marginHorizontal: 20,
    },
    noticeSectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginLeft: 8,
    },
    noticeScrollView: {
        flexGrow: 0,
        paddingHorizontal: 20,
    },
    noticeScrollContainer: {
        paddingRight: 20,
    },
    noticeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        width: 280,
        minHeight: 120,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        position: 'relative',
    },
    noticeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    noticeTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    priorityIcon: {
        marginRight: 8,
    },
    noticeTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        flex: 1,
    },
    noticeDate: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '500',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    noticeBody: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
        marginBottom: 12,
    },
    priorityIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
    },
    sectionHeader: {
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c3e50',
        marginBottom: 8,
    },
    sectionUnderline: {
        width: 60,
        height: 3,
        backgroundColor: '#6C63FF',
        borderRadius: 2,
    },
    menuContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    menuContent: {
        paddingBottom: 20,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    bottomSpacing: {
        height: 30,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptyNoticesContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
    },
    emptyNoticesText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9ca3af',
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingTop: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    closeButton: {
        padding: 8,
        borderRadius: 12,
        backgroundColor: '#f9fafb',
    },
    modalContent: {
        paddingHorizontal: 20,
    },
    modalNoticeHeader: {
        paddingVertical: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    modalNoticeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 8,
        lineHeight: 32,
    },
    modalNoticeDate: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
    },
    modalNoticeBody: {
        paddingVertical: 20,
    },
    modalNoticeBodyText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    modalNoticePriority: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 30,
    },
    modalPriorityLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginRight: 12,
    },
    priorityBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    priorityBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
});



