import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Modal,
    ActivityIndicator,
    ImageBackground,
} from 'react-native';
import { getAuth } from '@react-native-firebase/auth';
import { launchImageLibrary } from 'react-native-image-picker';
import progressService from '../../services/progressService';
import storage from '../../services/storage';
import FloatingAnim from '../../components/animations/FloatingAnim';

const defaultMaleImage = require('../../assets/icons/default_male_profile.png');
const defaultFemaleImage = require('../../assets/icons/default_female_profile.png');
const forestBg = require('../../assets/icons/forest_background.jpg');
const cloud1 = require('../../assets/icons/cloud_2.png');
const cloud2 = require('../../assets/icons/cloud_3.png');

const Profile = ({ navigation }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [progress, setProgress] = useState(null);
    const [username, setUsername] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [gender, setGender] = useState('male');
    const [showGenderModal, setShowGenderModal] = useState(false);

    useEffect(() => {
        loadData();
        const unsubscribe = navigation.addListener('focus', loadData);
        return unsubscribe;
    }, [navigation]);

    // Inside src/screens/Profile.js

    const loadData = async () => {
        try {
            // 1. Check for current user
            const user = getAuth().currentUser;
            if (!user) {
                console.log('User is not authenticated (Logged out or Guest)');
                return;
            }

            // Map Firebase user to expected structure if needed, or just use it directly
            // userInfo expects userId property in render
            setUserInfo({ ...user, userId: user.uid, username: user.displayName || user.email });

            // 2. Safely calculate display name
            let nameToDisplay = user.displayName;
            if (!nameToDisplay && user.email) {
                nameToDisplay = user.email.split('@')[0];
            }

            // 3. Load local storage data
            const savedUsername = await storage.load('username');
            setUsername(savedUsername || nameToDisplay || 'User');

            const savedImage = await storage.load('profileImage');
            if (savedImage) {
                setProfileImage(savedImage);
            } else if (user.photoURL) {
                setProfileImage(user.photoURL);
            }

            const savedGender = await storage.load('gender');
            setGender(savedGender || 'male');

            const userProgress = await progressService.loadProgress();
            setProgress(userProgress);

        } catch (error) {
            console.error('Error loading profile data:', error);
        }
    };

    const handleSaveUsername = async () => {
        if (username.trim()) {
            await storage.save('username', username.trim());
            setIsEditingName(false);
        }
    };

    const handleGenderChange = async (selectedGender) => {
        setGender(selectedGender);
        await storage.save('gender', selectedGender);
        setShowGenderModal(false);
        if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://') || profileImage.startsWith('http'))) {
            // Keep custom uploaded images or google images
        } else {
            setProfileImage(null);
        }
    };

    const handleImagePick = () => {
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            maxWidth: 400,
            maxHeight: 400,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.errorCode) {
                console.log('ImagePicker Error: ', response.errorMessage);
            } else if (response.assets && response.assets[0]) {
                const imageUri = response.assets[0].uri;
                setProfileImage(imageUri);
                await storage.save('profileImage', imageUri);
            }
        });
    };

    const getDisplayImage = () => {
        if (profileImage && (profileImage.startsWith('file://') || profileImage.startsWith('content://') || profileImage.startsWith('http'))) {
            return { uri: profileImage };
        }
        return gender === 'male' ? defaultMaleImage : defaultFemaleImage;
    };

    if (!userInfo || !progress) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#58CC02" />
                <Text style={styles.loadingText}>Loading Profile...</Text>
            </View>
        );
    }

    const overallProgress = progressService.getOverallProgress(progress);
    const achievementsList = [
        { id: 'first_lesson', title: 'First Steps', desc: 'Complete your first lesson', icon: '🎯' },
        { id: 'perfect_quiz', title: 'Perfect Score', desc: 'Get 100% on a quiz', icon: '💯' },
        { id: 'week_streak', title: 'Week Warrior', desc: 'Study 7 days in a row', icon: '🔥' },
    ];

    return (
        <ImageBackground source={forestBg} style={styles.container} resizeMode="cover">
            <FloatingAnim delay={0} duration={5000} distance={10} style={[styles.cloud, { top: '10%', left: '5%' }]}>
                <Image source={cloud1} style={{ width: 80, height: 50, opacity: 0.6 }} resizeMode="contain" />
            </FloatingAnim>
            <FloatingAnim delay={2000} duration={6000} distance={15} style={[styles.cloud, { bottom: '15%', right: '10%' }]}>
                <Image source={cloud2} style={{ width: 100, height: 60, opacity: 0.5 }} resizeMode="contain" />
            </FloatingAnim>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.avatarContainer}
                        onPress={handleImagePick}
                        onLongPress={() => setShowGenderModal(true)}
                    >
                        <Image source={getDisplayImage()} style={styles.avatar} />
                        <View style={styles.editBadge}>
                            <Text style={styles.editBadgeText}>📷</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.genderButton} onPress={() => setShowGenderModal(true)}>
                        <Text style={styles.genderButtonText}>
                            {gender === 'male' ? '👨' : '👩'} Change Avatar
                        </Text>
                    </TouchableOpacity>

                    {isEditingName ? (
                        <View style={styles.nameEditContainer}>
                            <TextInput
                                style={styles.nameInput}
                                value={username}
                                onChangeText={setUsername}
                                autoFocus
                                placeholder="Enter your name"
                            />
                            <TouchableOpacity onPress={handleSaveUsername} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => setIsEditingName(true)}>
                            <View style={styles.usernameContainer}>
                                <Text style={styles.username}>{username}</Text>
                                <Text style={styles.editIcon}>🖊️</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{progress.completedModules.length}</Text>
                        <Text style={styles.statLabel}>Lessons</Text>
                        <Text style={styles.statLabel}>Completed</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{progress.totalScore}</Text>
                        <Text style={styles.statLabel}>Total</Text>
                        <Text style={styles.statLabel}>Points</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>{overallProgress}%</Text>
                        <Text style={styles.statLabel}>Overall</Text>
                        <Text style={styles.statLabel}>Progress</Text>
                    </View>
                </View>

                <View style={styles.levelContainer}>
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{progress.level}</Text>
                    </View>
                    <Text style={styles.levelLabel}>Current Level</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>🏆 Achievements</Text>
                    <View style={styles.achievementsContainer}>
                        {achievementsList.map((achievement) => {
                            const isUnlocked = progress.achievements.includes(achievement.id);
                            return (
                                <View
                                    key={achievement.id}
                                    style={[styles.achievementCard, !isUnlocked && styles.achievementLocked]}
                                >
                                    <Text style={[styles.achievementIcon, !isUnlocked && styles.achievementIconLocked]}>
                                        {achievement.icon}
                                    </Text>
                                    <Text style={[styles.achievementTitle, !isUnlocked && styles.achievementTitleLocked]}>
                                        {achievement.title}
                                    </Text>
                                    <Text style={[styles.achievementDesc, !isUnlocked && styles.achievementDescLocked]}>
                                        {achievement.desc}
                                    </Text>
                                    {isUnlocked && <View style={styles.unlockedBadge}><Text style={styles.unlockedText}>✓</Text></View>}
                                </View>
                            );
                        })}
                    </View>
                </View>

                <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.settingsButtonText}>⚙️ Settings</Text>
                </TouchableOpacity>

                <Modal
                    visible={showGenderModal}
                    transparent={true}
                    animationType="fade"
                    onRequestClose={() => setShowGenderModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Choose Default Avatar</Text>

                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'male' && styles.selectedGenderOption]}
                                onPress={() => handleGenderChange('male')}
                            >
                                <Image source={defaultMaleImage} style={styles.genderPreview} />
                                <Text style={styles.genderOptionText}>👨 Male Avatar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.genderOption, gender === 'female' && styles.selectedGenderOption]}
                                onPress={() => handleGenderChange('female')}
                            >
                                <Image source={defaultFemaleImage} style={styles.genderPreview} />
                                <Text style={styles.genderOptionText}>👩 Female Avatar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.modalCloseButton}
                                onPress={() => setShowGenderModal(false)}
                            >
                                <Text style={styles.modalCloseText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    cloud: {
        position: 'absolute',
        zIndex: 0,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#87CEEB',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingTop: 50,
        marginHorizontal: 15,
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        borderRadius: 25,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 15,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#58CC02',
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#58CC02',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    editBadgeText: {
        fontSize: 16,
    },
    genderButton: {
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 10,
    },
    genderButtonText: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    usernameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    editIcon: {
        fontSize: 18,
    },
    userId: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    nameEditContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    nameInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontSize: 18,
        minWidth: 200,
    },
    saveButton: {
        backgroundColor: '#58CC02',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 15,
        marginBottom: 20,
    },
    statCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        flex: 1,
        marginHorizontal: 5,
        elevation: 3,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#58CC02',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    levelContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    levelBadge: {
        backgroundColor: '#58CC02',
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5,
    },
    levelText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    levelLabel: {
        fontSize: 16,
        color: '#fff',
        fontWeight: '600',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    section: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 15,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    achievementsContainer: {
        gap: 10,
    },
    achievementCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 15,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        position: 'relative',
    },
    achievementLocked: {
        opacity: 0.5,
    },
    achievementIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    achievementIconLocked: {
        opacity: 0.5,
    },
    achievementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    achievementTitleLocked: {
        color: '#999',
    },
    achievementDesc: {
        fontSize: 12,
        color: '#666',
        position: 'absolute',
        bottom: 8,
        left: 62,
    },
    achievementDescLocked: {
        color: '#aaa',
    },
    unlockedBadge: {
        backgroundColor: '#58CC02',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    unlockedText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    settingsButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        marginHorizontal: 15,
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
    },
    settingsButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 25,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ddd',
        marginBottom: 10,
    },
    selectedGenderOption: {
        borderColor: '#58CC02',
        backgroundColor: 'rgba(88, 204, 2, 0.1)',
    },
    genderPreview: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15,
    },
    genderOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalCloseButton: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
});

export default Profile;
