import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from "react-native";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DropDownPicker from "react-native-dropdown-picker";

const UpdateProfileForm = ({ setValue }) => {
    const navigation = useNavigation();

    // State for form fields
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
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
        }
    };
    
    const [permissionStatus, setPermissionStatus] = useState(null);

    // Requesting permissions
    useEffect(() => {
        const requestPermission = async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            setPermissionStatus(status === 'granted');
        };
        requestPermission();
    }, []);

    const pickImage = async () => {
        if (permissionStatus === 'granted') {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.cancelled) {
                setImage(result.uri);
            }
        } else {
            alert("Permission to access media library is required.");
        }
    };


    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Update Profile</Text>
            {/* <View style={styles.container}>
                <Button title="Pick an image from camera roll" onPress={pickImage} />
                {image && <Image source={{ uri: image }} style={styles.image} />}
            </View> */}

            {/* Name Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your name"
                    value={name}
                    onChangeText={setName}
                />
            </View>

            {/* Email Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
            </View>

            {/* Phone Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your phone number"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                />
            </View>

            
            {/* Password Field */}
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your Password"
                    value={password}
                    onChangeText={setPassword}
                />
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

            {/* Submit Button */}
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Update Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{
                ...styles.button,
                backgroundColor: "darkred",
            }}
                onPress={() => {
                    AsyncStorage.removeItem('token');
                    setValue(null);
                }}>
                <Text style={styles.buttonText}>Logout</Text>
            </TouchableOpacity>
            <View style={{ height: 100 }}></View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#f5f5f5",
    },
    header: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 24,
        color: "#333",
        textAlign: "center",
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    input: {
        backgroundColor: "#fff",
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e0e0e0",
        fontSize: 16,
    },
    button: {
        backgroundColor: "#007bff",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    buttonText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
});

export default UpdateProfileForm;