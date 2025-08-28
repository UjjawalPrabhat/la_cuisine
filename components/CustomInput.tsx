import {View, Text, TextInput} from 'react-native'
import {CustomInputProps} from "@/type";
import {useState} from "react";
import cn from "clsx";

const CustomInput = ({
    placeholder = 'Enter text',
    value,
    onChangeText,
    label,
    secureTextEntry = false,
    keyboardType="default",
    error
}: CustomInputProps) => {
    const [isFocused, setIsFocused] = useState(false);


    return (
        <View className="w-full">
            <Text className="label">{label}</Text>

            <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChangeText}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                placeholderTextColor="#888"
                className={cn(
                    'input', 
                    error ? 'border-red-500' : isFocused ? 'border-primary' : 'border-gray-300'
                )}
            />
            
            {error && (
                <Text className="text-red-500 text-sm mt-1">{error}</Text>
            )}
        </View>
    )
}
export default CustomInput
