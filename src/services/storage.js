import AsyncStorage from '@react-native-async-storage/async-storage';

const save = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
        console.error('Error saving data', e);
    }
};

const load = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error('Error loading data', e);
        return null;
    }
};

const remove = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (e) {
        console.error('Error removing data', e);
    }
};

export default {
    save,
    load,
    remove,
};
