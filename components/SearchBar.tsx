import {images} from "@/constants";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Image, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { validateSearchInput } from "@/lib/validation";

const Searchbar = () => {
    const params = useLocalSearchParams<{ query: string }>();
    const [query, setQuery] = useState(params.query);

    const handleSearch = (text: string) => {
        // Security: Validate and sanitize search input
        const validation = validateSearchInput(text);
        
        if (!validation.isValid) {
            Alert.alert('Invalid Search', validation.message || 'Please enter a valid search term');
            return;
        }

        setQuery(validation.sanitized);

        if(!validation.sanitized) router.setParams({ query: undefined });
    };

    const handleSubmit = () => {
        // Security: Validate search input before submission
        const validation = validateSearchInput(query || '');
        
        if (!validation.isValid) {
            Alert.alert('Invalid Search', validation.message || 'Please enter a valid search term');
            return;
        }

        if(validation.sanitized.trim()) {
            router.setParams({ query: validation.sanitized });
        }
    }

    return (
        <View className="searchbar">
            <TextInput
                className="flex-1 p-5"
                placeholder="Search for pizzas, burgers..."
                value={query}
                onChangeText={handleSearch}
                onSubmitEditing={handleSubmit}
                placeholderTextColor="#A0A0A0"
                returnKeyType="search"
                maxLength={100}
                autoCapitalize="none"
                autoCorrect={false}
            />
            <TouchableOpacity
                className="pr-5"
                onPress={handleSubmit}
            >
                <Image
                    source={images.search}
                    className="size-6"
                    resizeMode="contain"
                    tintColor="#5D5F6D"
                />
            </TouchableOpacity>
        </View>
    );
};

export default Searchbar;
