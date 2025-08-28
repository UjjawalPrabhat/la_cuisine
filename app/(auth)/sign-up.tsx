import {View, Text, Button, Alert} from 'react-native'
import {Link, router} from "expo-router";
import CustomInput from "@/components/CustomInput";
import CustomButton from "@/components/CustomButton";
import {useState} from "react";
import {createUser, signIn} from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { validateEmail, validatePassword, validateName } from "@/lib/validation";
import { sanitizeError, authRateLimit } from "@/lib/security";
import * as Sentry from '@sentry/react-native';

const SignUp = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [errors, setErrors] = useState({ name: '', email: '', password: '' });
    const { fetchAuthenticatedUser } = useAuthStore();

    const validateForm = (): boolean => {
        const newErrors = { name: '', email: '', password: '' };
        let isValid = true;

        // Security: Validate name
        const nameValidation = validateName(form.name);
        if (!nameValidation.isValid) {
            newErrors.name = nameValidation.message || '';
            isValid = false;
        }

        // Security: Validate email format
        const emailValidation = validateEmail(form.email);
        if (!emailValidation.isValid) {
            newErrors.email = emailValidation.message || '';
            isValid = false;
        }

        // Security: Validate password strength
        const passwordValidation = validatePassword(form.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.message || '';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const submit = async () => {
        const { name, email, password } = form;

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
            // Create user account
            await createUser({ email,  password,  name });
            
            // Sign in the newly created user
            await signIn({ email, password });
            
            // Update the auth store with the authenticated user
            await fetchAuthenticatedUser();

            router.replace('/');
        } catch(error: any) {
            // Security: Use sanitized error messages
            const userMessage = sanitizeError(error);
            Alert.alert('Account Creation Failed', userMessage);
            
            // Security: Log actual error for debugging (only in development)
            if (__DEV__) {
                console.warn('Sign-up error:', error);
            }
            
            // Security: Report error to monitoring without sensitive data
            Sentry.captureException(error, {
                tags: { action: 'sign_up' },
                extra: { email: email.replace(/(?<=.{2}).*(?=@)/, '***') } // Mask email for privacy
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="gap-10 bg-white rounded-lg p-5 mt-5">
            <CustomInput
                placeholder="Enter your full name"
                value={form.name}
                onChangeText={(text) => {
                    setForm((prev) => ({ ...prev, name: text }));
                    if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                label="Full name"
                error={errors.name}
            />
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
                title="Sign Up"
                isLoading={isSubmitting}
                onPress={submit}
            />

            <View className="flex justify-center mt-5 flex-row gap-2">
                <Text className="base-regular text-gray-100">
                    Already have an account?
                </Text>
                <Link href="/sign-in" className="base-bold text-primary">
                    Sign In
                </Link>
            </View>
        </View>
    )
}

export default SignUp
