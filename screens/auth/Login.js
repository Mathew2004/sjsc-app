import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Animated, Dimensions } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import { Ionicons } from '@expo/vector-icons';


const LoginScreen = ({ setValue }) => {
    const navigation = useNavigation();
    
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const logoRotateAnim = useRef(new Animated.Value(0)).current;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Animation setup
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }),
        ]).start();

        // Logo rotation animation
        Animated.loop(
            Animated.timing(logoRotateAnim, {
                toValue: 1,
                duration: 20000,
                useNativeDriver: true,
            })
        ).start();

        // Pulse animation loop for decorative elements
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
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

    const handleLogin = async () => {
        try {
            const payload = {
                email: username.startsWith("01") ? "" : username,
                phone: username.startsWith("01") ? username : "",
                password,
            };

            setLoading(true);

            console.log(payload);

            // Add timeout configuration
            const res = await axios.post(
                "https://sjsc-backend-production.up.railway.app/api/v1/auth/teacher-login",
                // "http://192.168.0.103:3000/api/v1/auth/teacher-login",
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 5000,
                }
            );

            setLoading(false);

            if (res) {
                const id = res.data.data.id;
                await AsyncStorage.setItem("token", res.data.token);
                await AsyncStorage.setItem("teacher-id", id.toString());
                // navigation.navigate("Home");
                setValue(res.data.token);
            }
        } catch (error) {
            setLoading(false);

            if (axios.isAxiosError(error)) {
                if (error.response) {
                    if (error.response.status === 401) {
                        setError("Invalid username or password");
                    } else {
                        console.log(error);
                        setError(`Server error: ${error.response.status}`);
                    }
                } else if (error.request) {
                    setError("Network error - please check your connection");
                } else {
                    setError("An unexpected error occurred");
                }
            } else {
                // setError(error);
                console.log(error);
            }
        }
    };
    return (
        <View style={styles.container}>
            {/* Floating Background Shapes */}
            <View style={styles.backgroundPattern}>
                <Animated.View style={[styles.floatingShape, styles.shape1, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.floatingShape, styles.shape2, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.floatingShape, styles.shape3, { opacity: pulseAnim }]} />
                <Animated.View style={[styles.floatingShape, styles.shape4, { opacity: pulseAnim }]} />
            </View>

            <Animated.View style={[
                styles.loginCard
            ]}>
                {/* Logo Section */}
                <Animated.View style={[
                    styles.logoContainer,
                    // {
                    //     transform: [{
                    //         rotate: logoRotateAnim.interpolate({
                    //             inputRange: [0, 1],
                    //             outputRange: ['0deg', '360deg'],
                    //         })
                    //     }]
                    // }
                ]}>
                    <Image 
                        source={{ uri: "https://assets.chorcha.net/a-SYEMAoDS7aZhSPshmh6.png" }} 
                        style={styles.logo} 
                    />
                </Animated.View>

                {/* Header Section */}
                <View style={styles.headerSection}>
                    <Text style={styles.schoolName}>SJSC Teacher's App</Text>
                    <Text style={styles.signInText}>Welcome Back!</Text>
                    <Text style={styles.welcomeText}>Sign in to continue</Text>
                    <View style={styles.headerDecoration} />
                </View>

                {/* Error Message */}
                {error && (
                    <Animated.View style={[styles.errorContainer, { opacity: fadeAnim }]}>
                        <Ionicons name="alert-circle" size={20} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                )}

                {/* Form Section */}
                <View style={styles.formSection}>
                    {/* Username Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="person" size={18} color="#6C63FF" />
                            <Text style={styles.label}>Email/Phone *</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your username"
                                placeholderTextColor="#94a3b8"
                                value={username}
                                onChangeText={setUsername}
                            />
                        </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Ionicons name="lock-closed" size={18} color="#6C63FF" />
                            <Text style={styles.label}>Password *</Text>
                        </View>
                        <View style={styles.inputWrapper}>
                            <View style={styles.inputGlow} />
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                placeholderTextColor="#94a3b8"
                                secureTextEntry={!showPassword}
                                value={password}
                                onChangeText={setPassword}
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
                                style={[styles.signInButton, loading && styles.submittingButton]}
                                onPress={handleLogin}
                                disabled={loading}
                            >
                                <View style={styles.submitButtonGlow} />
                                <View style={styles.submitContent}>
                                    {loading ? (
                                        <>
                                            <ActivityIndicator size="small" color="white" />
                                            <Text style={styles.signInButtonText}>Signing In...</Text>
                                        </>
                                    ) : (
                                        <>
                                            <Ionicons name="log-in" size={20} color="white" />
                                            <Text style={styles.signInButtonText}>Sign In</Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </View>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8fafc",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
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
        opacity: 0.05,
    },
    shape1: {
        width: 120,
        height: 120,
        backgroundColor: '#6C63FF',
        top: 80,
        right: 30,
        borderRadius: 25,
        transform: [{ rotate: '45deg' }],
    },
    shape2: {
        width: 80,
        height: 80,
        backgroundColor: '#FF6B6B',
        top: 250,
        left: 20,
        borderRadius: 40,
    },
    shape3: {
        width: 100,
        height: 100,
        backgroundColor: '#4ECDC4',
        bottom: 200,
        right: 50,
        borderRadius: 20,
        transform: [{ rotate: '30deg' }],
    },
    shape4: {
        width: 60,
        height: 60,
        backgroundColor: '#FFD93D',
        bottom: 120,
        left: 40,
        borderRadius: 30,
    },
    loginCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 30,
        padding: 30,
        width: '100%',
        maxWidth: 400,
       
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 25,
        position: 'relative',
    },
    logoGlow: {
        position: 'absolute',
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
        zIndex: -1,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    schoolName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: 8,
        textAlign: 'center',
    },
    signInText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#6C63FF',
        marginBottom: 5,
    },
    welcomeText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center',
        marginBottom: 15,
    },
    headerDecoration: {
        width: 60,
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
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        borderColor: 'rgba(220, 38, 38, 0.3)',
        borderWidth: 1,
        borderRadius: 15,
        padding: 12,
        marginBottom: 20,
        gap: 8,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        paddingLeft: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginLeft: 8,
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
        paddingVertical: 16,
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
    eyeIcon: {
        position: 'absolute',
        right: 15,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: 5,
        borderRadius: 15,
        backgroundColor: 'rgba(108, 99, 255, 0.1)',
    },
    submitWrapper: {
        marginTop: 10,
        alignItems: 'center',
    },
    signInButton: {
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
    submitContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    signInButtonText: {
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
});

export default LoginScreen;
