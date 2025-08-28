import {View, Text, Image, ScrollView, TouchableOpacity, Alert} from 'react-native'
import useAuthStore from "@/store/auth.store";
import CustomButton from "@/components/CustomButton";
import {router} from "expo-router";
import {images} from "@/constants";
import {SafeAreaView} from "react-native-safe-area-context";

const Profile = () => {
    const { isAuthenticated, user, logout } = useAuthStore();

    const handleSignOut = async () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: async () => {
                        await logout();
                        router.replace('/sign-in');
                    }
                }
            ]
        );
    };

    const handleSignIn = () => {
        router.push('/sign-in');
    };

    const menuItems = [
        {
            title: "My Orders",
            icon: images.clock,
            onPress: () => Alert.alert("Coming Soon", "Order history feature will be available soon!")
        },
        {
            title: "Delivery Address",
            icon: images.location,
            onPress: () => Alert.alert("Coming Soon", "Address management feature will be available soon!")
        },
        {
            title: "Payment Methods",
            icon: images.dollar,
            onPress: () => Alert.alert("Coming Soon", "Payment methods feature will be available soon!")
        },
        {
            title: "Contact Support",
            icon: images.phone,
            onPress: () => Alert.alert("Support", "Email us at support@fastfood.com or call +1 (555) 123-4567")
        },
    ];

    if (!isAuthenticated || !user) {
        return (
            <SafeAreaView className="flex-1 bg-white">
                <View className="flex-1 justify-center items-center p-6">
                    <Image 
                        source={images.emptyState} 
                        className="w-48 h-48 mb-6" 
                        resizeMode="contain" 
                    />
                    <Text className="text-2xl font-bold mb-2 text-center">Welcome to FastFood</Text>
                    <Text className="text-lg mb-6 text-center text-gray-600">
                        Sign in to access your profile and order history
                    </Text>
                    <CustomButton
                        title="Sign In"
                        onPress={handleSignIn}
                        style="w-full"
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1 px-6">
                {/* Header */}
                <View className="items-center py-8">
                    <View className="w-24 h-24 rounded-full bg-primary items-center justify-center mb-4">
                        <Image 
                            source={images.user} 
                            className="w-12 h-12" 
                            resizeMode="contain"
                            tintColor="white"
                        />
                    </View>
                    <Text className="text-2xl font-bold mb-2">Welcome back!</Text>
                    <Text className="text-lg text-gray-600">{user.email}</Text>
                    {user.name && (
                        <Text className="text-base text-gray-500 mt-1">{user.name}</Text>
                    )}
                </View>

                {/* Menu Items */}
                <View className="space-y-4 mb-8">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            className="flex-row items-center p-4 bg-gray-50 rounded-lg"
                            onPress={item.onPress}
                        >
                            <Image 
                                source={item.icon} 
                                className="w-6 h-6 mr-4" 
                                resizeMode="contain"
                                tintColor="#FE8C00"
                            />
                            <Text className="flex-1 text-lg font-medium">{item.title}</Text>
                            <Image 
                                source={images.arrowRight} 
                                className="w-4 h-4" 
                                resizeMode="contain"
                                tintColor="#gray-400"
                            />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Sign Out Button */}
                <View className="pb-8">
                    <CustomButton
                        title="Sign Out"
                        onPress={handleSignOut}
                        style="w-full bg-red-500"
                        textStyle="text-white"
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

export default Profile
