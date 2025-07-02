import React from 'react';
import { Button, Text, TouchableOpacity, View, StyleSheet, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';

// Sample notice data
const Notices = [
    {
        id: 1,
        title: "Exam Schedule Released",
        body: "The mid-term examination schedule for all departments has been published. Students are advised to check their respective class schedules and prepare accordingly. The exams will commence from next week.",
        date: "2025-07-02",
        priority: "high"
    },
    {
        id: 2,
        title: "Library Timing Update",
        body: "The college library will now remain open until 8 PM on weekdays and 6 PM on weekends. Students can make use of the extended hours for their studies and research work.",
        date: "2025-07-01",
        priority: "medium"
    },
    {
        id: 3,
        title: "Sports Day Registration",
        body: "Registration for the annual sports day is now open. Students interested in participating in various sports events can register with their respective department coordinators before the deadline.",
        date: "2025-06-30",
        priority: "low"
    },
    {
        id: 4,
        title: "Guest Lecture Series",
        body: "A special guest lecture series on 'Future of Technology' will be conducted by industry experts. All students are encouraged to attend these informative sessions.",
        date: "2025-06-28",
        priority: "medium"
    },
    {
        id: 5,
        title: "Holiday Notice",
        body: "The college will remain closed on July 15th due to a national holiday. Classes will resume on July 16th as per the regular schedule.",
        date: "2025-06-25",
        priority: "high"
    }
];

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
const NoticeCard = ({ notice }) => {
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
        <View style={styles.noticeCard}>
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
        </View>
    );
};

export default function HomeScreen() {
    console.log("Home");
    const navigation = useNavigation();
    
    return (
        // <LinearGradient
        //     colors={['#f8f9fa', '#e9ecef', '#dee2e6']}
        //     style={styles.container}
        // >
        <View style={styles.container}>
            {/* Notice Section */}
            <View style={styles.noticeSection}>
                <View style={styles.noticeSectionHeader}>
                    <Ionicons name="notifications" size={22} color="#6366f1" />
                    <Text style={styles.noticeSectionTitle}>Latest Notices</Text>
                </View>
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.noticeScrollContainer}
                    style={styles.noticeScrollView}
                >
                    {Notices.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </ScrollView>
            </View>

            {/* Quick Actions Section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.sectionUnderline} />
            </View>

            <ScrollView 
                style={styles.menuContainer}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.menuContent}
            >
                <View style={styles.menuGrid}>
                    {Menus.map((menu, index) => (
                        <View key={index} style={styles.cardWrapper}>
                            <Card item={menu.item} icon={menu.icon} href={menu.href} />
                        </View>
                    ))}
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
});



