import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Animated, Dimensions, ActivityIndicator } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from '@expo/vector-icons';

const UpdateProfileForm = ({ setValue }) => {
    const navigation = useNavigation();

    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [loading, setLoading] = useState(true);

    // State for form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

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

    // const [dept, setDept] = useState("");

    // const [image, setImage] = useState(null);
    // const [file, setFile] = useState(null);

    // const [positionItems, setPositionItems] = useState([
    //     { label: "Lecturer", value: "Lecturer" },
    //     { label: "Assistant Professor", value: "Assistant Professor" },
    //     { label: "Professor", value: "Professor" }
    // ]);
    // const [positionValue, setPositionValue] = useState(null);
    // const [openPosition, setOpenPosition] = useState(false);

    // const [imageUri, setImageUri] = useState(null);



    const getTeacher = async () => {
        try {
            setLoading(true);
            const teacher_id = await AsyncStorage.getItem('teacher-id');
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`https://sjsc-backend-production.up.railway.app/api/v1/teachers/fetch/${teacher_id}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 200) {
                const { name, email, phone, password } = response.data.teacher;
                setName(name);
                setEmail(email);
                setPhone(phone);
                setPassword(password);
                // setDept(extra?.dept || "");
                // setPositionValue(extra?.position || "");
            }
        } catch (error) {
            console.error("Error fetching teacher data:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        getTeacher();
    }, []);



    // Handle form submission
    const handleSubmit = async () => {
        if (!name || !email || !phone) {
            alert("Please fill all fields");
            return;
        }

        const data = {
            name,
            email,
            phone,
            password,
            // dept,
            // position: positionValue,
        };

        try {
            setSubmitting(true);
            const teacher_id = await AsyncStorage.getItem('teacher-id');
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put(
                // `http://192.168.0.103:4000/api/v1/teachers/update-info/${teacher_id}`,
                `https://sjsc-backend-production.up.railway.app/api/v1/teachers/update-info/${teacher_id}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                alert("Profile updated successfully");
                navigation.goBack();
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const [permissionStatus, setPermissionStatus] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Requesting permissions
    useEffect(() => {
        const requestPermission = async () => {
            // Commented out for now - ImagePicker functionality
            // const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            // setPermissionStatus(status === 'granted');
        };
        requestPermission();
    }, []);

    const pickImage = async () => {
        // Commented out for now - ImagePicker functionality
        // if (permissionStatus === 'granted') {
        //     let result = await ImagePicker.launchImageLibraryAsync({
        //         mediaTypes: ImagePicker.MediaTypeOptions.Images,
        //         allowsEditing: true,
        //         aspect: [4, 3],
        //         quality: 1,
        //     });

        //     if (!result.cancelled) {
        //         setImage(result.uri);
        //     }
        // } else {
        //     alert("Permission to access media library is required.");
        // }
    };

    // Loading component
    if (loading) {
        return (
            <View
                style={[styles.loadingContainer]}
            >
                <View style={styles.backgroundPattern}>
                    <Animated.View style={[styles.floatingShape, styles.shape1, { opacity: pulseAnim }]} />
                    <Animated.View style={[styles.floatingShape, styles.shape2, { opacity: pulseAnim }]} />
                    <Animated.View style={[styles.floatingShape, styles.shape3, { opacity: pulseAnim }]} />
                    <Animated.View style={[styles.floatingShape, styles.shape4, { opacity: pulseAnim }]} />
                </View>
                <Animated.View style={[styles.loadingCard, { opacity: fadeAnim }]}>
                    <ActivityIndicator size="large" color="#6C63FF" />
                    <Text style={styles.loadingText}>Loading Profile...</Text>
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
        <View
            style={[styles.screenContainer]}
        >
            {/* Floating Background Shapes */}
            <View style={styles.backgroundPattern}>
                <Animated.View style={[styles.floatingShape, styles.shape1]} />
                <Animated.View style={[styles.floatingShape, styles.shape2]} />
                <Animated.View style={[styles.floatingShape, styles.shape3]} />
                <Animated.View style={[styles.floatingShape, styles.shape4]} />
            </View>

            <ScrollView style={styles.container}>
                {/* Header Section */}
                <Animated.View style={[
                    styles.headerSection,
                ]}>
                    <Ionicons name="person-circle" size={60} color="#6C63FF" />
                    <Text style={styles.headerTitle}>Update Profile</Text>
                    <Text style={styles.headerSubtitle}>Update your personal information</Text>
                    <View style={styles.headerDecoration} />
                </Animated.View>

                <Animated.View style={[
                    styles.formContainer,
                ]}>
                    {/* Name Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="person" size={20} color="#6C63FF" />
                            <Text style={styles.label}>Name</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your name"
                                placeholderTextColor="#94a3b8"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>
                    </View>

                    {/* Email Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="mail" size={20} color="#6C63FF" />
                            <Text style={styles.label}>Email</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                placeholderTextColor="#94a3b8"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                            />
                        </View>
                    </View>

                    {/* Phone Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="call" size={20} color="#6C63FF" />
                            <Text style={styles.label}>Phone</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your phone number"
                                placeholderTextColor="#94a3b8"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="lock-closed" size={20} color="#6C63FF" />
                            <Text style={styles.label}>Password</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={[styles.input, styles.passwordInput]}
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons 
                                    name={showPassword ? "eye-off" : "eye"} 
                                    size={20} 
                                    color="#6C63FF" 
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <View style={styles.submitWrapper}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                style={[styles.submitButton, submitting && styles.submittingButton]}
                                onPress={handleSubmit}
                                disabled={submitting}
                            >
                                <View style={styles.submitButtonGlow} />
                                <View style={styles.submitContent}>
                                    {submitting ? (
                                        <>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.submitButtonText}>Updating...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="checkmark-circle" size={20} color="white" />
                                            <Text style={styles.submitButtonText}>Update Profile</Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Logout Button */}
                    <View style={styles.submitWrapper}>
                        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                            <TouchableOpacity
                                style={[styles.submitButton, styles.logoutButton]}
                                onPress={() => {
                                    AsyncStorage.removeItem('token');
                                    setValue(null);
                                }}
                            >
                                <View style={styles.logoutButtonGlow} />
                                <View style={styles.submitContent}>
                                    <Ionicons name="log-out" size={20} color="white" />
                                    <Text style={styles.submitButtonText}>Logout</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>

                    {/* Position Field */}
                    {/* <View style={styles.inputContainer}>
                        <Text style={styles.label}>Position</Text>
                        <DropDownPicker
                            open={openPosition}
                            value={positionValue}
                            items={positionItems}
                            setOpen={setOpenPosition}
                            setValue={setPositionValue}
                            setItems={setPositionItems}
                            placeholder="Select your position"
                            style={{ backgroundColor: "#fff" }}
                            listMode="SCROLLVIEW"
                            dropDownContainerStyle={{ backgroundColor: "#fff" }}
                        />

                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Depertment</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ex. Physics"
                            value={dept}
                            onChangeText={setDept}
                        />
                    </View> */}

                    <View style={styles.bottomSpacing} />
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        position: 'relative',
    },
    backgroundPattern: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
    },
    floatingShape: {
        position: 'absolute',
        borderRadius: 50,
        opacity: 0.1,
    },
    shape1: {
        width: 100,
        height: 100,
        backgroundColor: '#6C63FF',
        top: 50,
        right: 20,
        borderRadius: 20,
        transform: [{ rotate: '45deg' }],
        opacity: 0.2,
    },
    shape2: {
        width: 60,
        height: 60,
        backgroundColor: '#FF6B6B',
        top: 200,
        left: 30,
        borderRadius: 30,
        opacity: 0.2,
    },
    shape3: {
        width: 80,
        height: 80,
        backgroundColor: '#4ECDC4',
        bottom: 200,
        right: 40,
        borderRadius: 15,
        transform: [{ rotate: '30deg' }],
        opacity: 0.2,
    },
    shape4: {
        width: 40,
        height: 40,
        backgroundColor: '#FFD93D',
        bottom: 100,
        left: 50,
        borderRadius: 20,
        opacity: 0.2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: 40,
        borderRadius: 25,
        alignItems: 'center',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 15,
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.1)',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#111',
        fontWeight: '600',
    },
    loadingDots: {
        flexDirection: 'row',
        marginTop: 15,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6C63FF',
        marginHorizontal: 3,
        opacity: 0.5,
    },
    container: {
        padding: 20,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
        marginTop: 15,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(23, 16, 16, 0.8)',
        textAlign: 'center',
        marginBottom: 15,
    },
    headerDecoration: {
        width: 80,
        height: 4,
        backgroundColor: '#6C63FF',
        borderRadius: 2,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 5,
    },
    formContainer: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 25,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#555',
        marginLeft: 10,
    },
    inputWrapper: {
        position: 'relative',
    },
    inputGlow: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 17,
        backgroundColor: 'rgba(108, 99, 255, 0.05)',
        zIndex: -1,
    },
    input: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: 'rgba(108, 99, 255, 0.2)',
        borderWidth: 2,
        borderRadius: 15,
        paddingHorizontal: 20,
        paddingVertical: 18,
        fontSize: 16,
        color: '#374151',
        fontWeight: '500',
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    passwordInput: {
        paddingRight: 50, // Make room for the eye icon
    },
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: 5,
    },
    submitWrapper: {
        marginTop: 20,
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#6C63FF',
        borderRadius: 20,
        paddingVertical: 18,
        paddingHorizontal: 30,
        shadowColor: '#6C63FF',
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
        position: 'relative',
        minWidth: 200,
    },
    submittingButton: {
        backgroundColor: '#94a3b8',
    },
    logoutButton: {
        backgroundColor: '#dc2626',
        shadowColor: '#dc2626',
    },
    submitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    submitButtonGlow: {
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        borderRadius: 23,
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        zIndex: -1,
    },
    logoutButtonGlow: {
        position: 'absolute',
        top: -3,
        left: -3,
        right: -3,
        bottom: -3,
        borderRadius: 23,
        backgroundColor: 'rgba(220, 38, 38, 0.2)',
        zIndex: -1,
    },
    bottomSpacing: {
        height: 50,
    },
});

export default UpdateProfileForm;