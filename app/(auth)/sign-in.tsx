import {View, Text, Button, Alert} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {signIn} from "@/lib/appwrite";
import * as Sentry from '@sentry/react-native'
import useAuthStore from "@/store/auth.store";
import { validateEmail } from "@/lib/validation";
import { sanitizeError, authRateLimit } from "@/lib/security";

const SignIn = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({ email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();

    const validateForm = (): boolean => {
        const newErrors = { email: '', password: '' };
        let isValid = true;

        // Security: Validate email format
        const emailValidation = validateEmail(form.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.message || '';
            isValid = false;
        }

        // Security: Basic password validation
        if (!form.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit = async () => {
        const { email, password } = form;

        // Security: Client-side input validation
        if (!validateForm()) {
            return;
        }

        // Security: Rate limiting protection
        if (!authRateLimit.isAllowed(email)) {
            const remainingTime = Math.ceil(authRateLimit.getRemainingTime(email) / 1000 / 60);
            Alert.alert('Too Many Attempts', `Please wait ${remainingTime} minutes before trying again.`);
            return;
        }

        setIsSubmitting(true)

        try {
            await signIn({ email, password });
            
            // Update the auth store with the authenticated user
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch(error: any) {
            // Security: Use sanitized error messages
            const userMessage = sanitizeError(error);
            Alert.alert('Sign In Failed', userMessage);
            
            // Security: Log actual error for debugging (only in development)
            if (__DEV__) {
                console.warn('Sign-in error:', error);
            }
            
            // Security: Report error to monitoring without sensitive data
            Sentry.captureException(error, {
                tags: { action: 'sign_in' },
                extra: { email: email.replace(/(?<=.{2}).*(?=@)/, '***') } // Mask email for privacy
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your email"
                value={form.email}
                onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, email: text }));
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                label="Email"
                keyboardType="email-address"
                error={errors.email}
            />
            <CustomInput
                placeholder="Enter your password"
                value={form.password}
                onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, password: text }));
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                label="Password"
                secureTextEntry={true}
                error={errors.password}
            />

            <CustomButton
                title="Sign In"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">
                    Don't have an account?
                </Text>
                <Link href="/sign-up" className="base-bold text-primary">
                    Sign Up
                </Link>
            </View>
        </View>
    )
}

export default SignIn
