import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, getTeacherId, getToken } from '../utils/api';

export const useTeacher = () => {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [teacherId, setTeacherId] = useState(null);
    const [teachersLevel, setTeachersLevel] = useState(null);

    // Fetch teacher data from API
    const fetchTeacher = async (id, authToken) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.get(`/teachers/fetch/${id}`);

            if (response.status === 200 && response.data.teacher) {
                setTeacher(response.data.teacher);
                return response.data.teacher;
            } else {
                throw new Error('Failed to fetch teacher data');
            }
        } catch (err) {
            console.error('Error fetching teacher data:', err);
            setError(err.message || 'Failed to fetch teacher data');
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Initialize teacher data on mount
    useEffect(() => {
        const initializeTeacher = async () => {
            try {
                const storedToken = await getToken();
                const storedTeacherId = await getTeacherId();
                
                setToken(storedToken);
                setTeacherId(storedTeacherId);
                
                if (storedToken && storedTeacherId) {
                    await fetchTeacher(storedTeacherId, storedToken);
                } else {
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error initializing teacher:', err);
                setError('Failed to initialize teacher data');
                setLoading(false);
            }
        };

        initializeTeacher();
    }, []);

    // Refresh teacher data
    const refreshTeacher = async () => {
        if (teacherId && token) {
            return await fetchTeacher(teacherId, token);
        }
        return null;
    };

    // Update teacher data locally (for immediate UI updates)
    const updateTeacher = (updatedData) => {
        setTeacher(prevTeacher => ({
            ...prevTeacher,
            ...updatedData
        }));
    };

    // Clear teacher data (for logout)
    const clearTeacher = () => {
        setTeacher(null);
        setToken(null);
        setTeacherId(null);
        setError(null);
        setLoading(false);
    };

    // Get teacher profile image
    const getTeacherImage = () => {
        if (teacher?.extra?.image) {
            return teacher.extra.image;
        }
        if (teacher?.profileImage) {
            return teacher.profileImage;
        }
        return null;
    };

    // Get teacher full name
    const getTeacherName = () => {
        return teacher?.name || 'Teacher';
    };

    // Get teacher email
    const getTeacherEmail = () => {
        return teacher?.email || '';
    };

    // Check if teacher data is available
    const isTeacherLoaded = () => {
        return !loading && teacher !== null;
    };

    return {
        // Data
        teacher,
        loading,
        error,
        token,
        teacherId,
        
        // Actions
        // fetchTeacher,
        // refreshTeacher,
        // updateTeacher,
        // clearTeacher,
        
        // // Helpers
        // getTeacherImage,
        // getTeacherName,
        // getTeacherEmail,
        // isTeacherLoaded,
    };
};

export default useTeacher;
