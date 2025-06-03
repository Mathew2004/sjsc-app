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
} from "react-native";
import { Avatar, ListItem, Icon } from "react-native-elements";
import { useFocusEffect } from "@react-navigation/native";


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

const TeacherCard = React.memo(({ teacher }) => (
    <ListItem containerStyle={styles.cardContainer} onPress={() => Linking.openURL(`tel:${teacher.phone}`)}>
        <Avatar rounded size="medium" source={{ uri: teacher.extra?.image || `https://www.gravatar.com/avatar/${teacher.name}?d=robohash&s=400` }} />
        <ListItem.Content>
            <ListItem.Title style={styles.name}>{teacher.name}</ListItem.Title>
            <View style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 2,
                paddingVertical: 2,
            }}>
                {/* <Icon name="book" type="feather" color="#FF6584" size={14} /> */}
                <Text style={{
                    fontSize: 14,
                    color: "#999",
                    fontWeight: "600",
                }} onPress={() => Linking.openURL(`mailto:${teacher.email}`)}>
                    {teacher?.extra?.position || "Teacher"} - {teacher.extra?.dept || ""}
                </Text>
            </View>
            <View style={styles.contactContainer}>
                <Icon name="phone" type="feather" color="#6C63FF" size={14} />
                <Text style={styles.contactText} onPress={() => Linking.openURL(`tel:${teacher.phone}`)}>
                    {teacher.phone}
                </Text>
            </View>
            <View style={styles.contactContainer}>
                <Icon name="mail" type="feather" color="#FF6584" size={14} />
                <Text style={styles.contactText} onPress={() => Linking.openURL(`mailto:${teacher.email}`)}>
                    {teacher.email}
                </Text>

            </View>
        </ListItem.Content>
        <Icon name="chevron-right" type="feather" color="#ccc" size={18} />
    </ListItem>
));

export default function TeacherScreen() {
    const [teachers, setTeachers] = useState([]);
    const [filteredTeachers, setFilteredTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

            return () => abortController.abort();
        }, [])
    );

    useEffect(() => {
        setFilteredTeachers(
            teachers.filter((teacher) =>
                teacher.name?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );
    }, [searchQuery, teachers]);


    return (
        // <View style={styles.container}>
        //     <TextInput
        //         style={styles.searchBar}
        //         placeholder="Search teachers..."
        //         value={searchQuery}
        //         onChangeText={setSearchQuery}
        //     />
        //     {loading ? (
        //         <ActivityIndicator size="large" color="#6C63FF" />
        //     ) : (
        //         filteredTeachers.length > 0 ? (
        //             <FlatList
        //                 data={filteredTeachers}
        //                 keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        //                 renderItem={({ item }) => <TeacherCard teacher={item} />}
        //                 refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTeachers()} />}
        //             />
        //         ) : (
        //             <Text style={styles.emptyText}>No teachers found.</Text>
        //         )

        //     )}
        // </View>
        <View style={styles.container}>
            <TextInput
                style={styles.searchBar}
                placeholder="Search teachers..."
                value={searchQuery}
                onChangeText={setSearchQuery}
            />

            {loading ? (
                <ActivityIndicator size="large" color="#6C63FF" />
            ) : (
                <ScrollView
                    style={{ flexGrow: 1 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadTeachers()} />}
                >
                    {filteredTeachers.length > 0 ? (
                        filteredTeachers.map((item) => (
                            <TeacherCard key={item.id?.toString() || Math.random().toString()} teacher={item} />
                        ))
                    ) : (
                        <Text style={styles.emptyText}>No teachers found.</Text>
                    )}
                </ScrollView>
            )}
        </View>

    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
    },
    searchBar: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 14,
        color: "#333",
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardContainer: {
        borderRadius: 10,
        marginVertical: 5,
        backgroundColor: "#FFF",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    name: {
        fontWeight: "600",
        fontSize: 14,
        marginBottom: 4,
        color: "#333",
    },
    contactContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 2,
    },
    contactText: {
        marginLeft: 8,
        fontSize: 12,
        color: "#6C63FF",
    },
    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    errorText: {
        color: "#FF6584",
        fontSize: 14,
        marginBottom: 10,
    },
    emptyText: {
        textAlign: "center",
        fontSize: 14,
        color: "#888",
        marginTop: 20,
    },
})