import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";


const LoginScreen = ({ setValue }) => {
    const navigation = useNavigation();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

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
            <Image source={{ uri: "https://assets.chorcha.net/a-SYEMAoDS7aZhSPshmh6.png" }} style={styles.logo} />
            <Text style={styles.schoolName}>SJSC Teacher's App</Text>
            <Text style={styles.signInText}>Sign in</Text>
            {error &&
                <Text style={{
                    backgroundColor: "lightcoral",
                    color: "darkred",
                    marginVertical: 10,
                    padding: 5,
                    borderRadius: 5,
                    textAlign: "center",
                }}>{error}</Text>
            }
            <Text style={styles.label}>Email/Phone *</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your user name"
                value={username}
                onChangeText={setUsername}
            />

            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                />
                <TouchableOpacity
                    style={styles.eyeIcon}
                    onPress={() => setShowPassword(!showPassword)}>
                    <Icon
                        name={showPassword ? "eye-off" : "eye"} // Toggle between eye and eye-off icons
                        type="feather" // Use Feather icons
                        size={14} // Icon size
                        color="#666" // Icon color
                    />
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.signInButton}
                // onPress={() => navigation.navigate('Home')}
                onPress={handleLogin}
            >
                {loading &&
                    <ActivityIndicator size={20} color="white" style={{ marginRight: 10 }} />
                }
                <Text style={styles.signInButtonText}>Sign In</Text>

            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FAF7F8",
        padding: 20,
    },
    logo: {
        width: 80,
        height: 80,
        marginBottom: 10,
    },
    schoolName: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#008080",
    },
    signInText: {
        fontSize: 22,
        fontWeight: "bold",
    },
    welcomeText: {
        fontSize: 14,
        color: "gray",
        textAlign: "center",
        marginBottom: 20,
    },
    label: {
        alignSelf: "flex-start",
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10,
    },
    input: {
        width: "100%",
        height: 50,
        borderWidth: 1,
        borderColor: "#008080",
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    eyeIcon: {
        position: "absolute",
        right: 10,
        fontSize: 14,
    },
    forgotPassword: {
        color: "#008080",
        marginBottom: 20,
        marginTop: 5,
    },
    signInButton: {
        backgroundColor: "#008080",
        width: "100%",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 10,
    },
    signInButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default LoginScreen;
