import {View, Text, FlatList, Alert} from 'react-native'
import {SafeAreaView} from "react-native-safe-area-context";
import {useCartStore} from "@/store/cart.store";
import CustomHeader from "@/components/CustomHeader";
import cn from "clsx";
import CustomButton from "@/components/CustomButton";
import CartItem from "@/components/CartItem";
import { PaymentInfoStripeProps } from '@/type';
import { router } from 'expo-router';

const PaymentInfoStripe = ({ label,  value,  labelStyle,  valueStyle, }: PaymentInfoStripeProps) => (
    <View className="flex-between flex-row my-1">
        <Text className={cn("paragraph-medium text-gray-200", labelStyle)}>
            {label}
        </Text>
        <Text className={cn("paragraph-bold text-dark-100", valueStyle)}>
            {value}
        </Text>
    </View>
);

const Cart = () => {
    const { items, getTotalItems, getTotalPrice, clearCart } = useCartStore();

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const deliveryFee = 5.00;
    const discount = 0.50;
    const finalTotal = totalPrice + deliveryFee - discount;

    const handleOrderNow = () => {
        if (totalItems === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart before placing an order.');
            return;
        }

        Alert.alert(
            'Order Confirmation',
            `Would you like to place this order for $${finalTotal.toFixed(2)}?`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Place Order',
                    onPress: () => {
                        Alert.alert(
                            'Order Placed!',
                            'Your order has been successfully placed. Thank you for choosing us!',
                            [
                                {
                                    text: 'OK',
                                    onPress: () => {
                                        clearCart();
                                        router.push('/');
                                    },
                                },
                            ]
                        );
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="bg-white h-full">
            <FlatList
                data={items}
                renderItem={({ item }) => <CartItem item={item} />}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                contentContainerClassName="pb-28 px-5 pt-5"
                ListHeaderComponent={() => <CustomHeader title="Your Cart" />}
                ListEmptyComponent={() => (
                    <View className="flex-1 justify-center items-center py-20">
                        <Text className="text-xl text-gray-500 mb-4">Your cart is empty</Text>
                        <Text className="text-gray-400 text-center mb-6">
                            Looks like you haven't added any items to your cart yet.
                        </Text>
                        <CustomButton
                            title="Start Shopping"
                            onPress={() => router.push('/search')}
                            style="w-40"
                        />
                    </View>
                )}
                ListFooterComponent={() => totalItems > 0 && (
                    <View className="gap-5">
                        <View className="mt-6 border border-gray-200 p-5 rounded-2xl">
                            <Text className="h3-bold text-dark-100 mb-5">
                                Payment Summary
                            </Text>

                            <PaymentInfoStripe
                                label={`Total Items (${totalItems})`}
                                value={`$${totalPrice.toFixed(2)}`}
                            />
                            <PaymentInfoStripe
                                label={`Delivery Fee`}
                                value={`$${deliveryFee.toFixed(2)}`}
                            />
                            <PaymentInfoStripe
                                label={`Discount`}
                                value={`- $${discount.toFixed(2)}`}
                                valueStyle="!text-green-600"
                            />
                            <View className="border-t border-gray-300 my-2" />
                            <PaymentInfoStripe
                                label={`Total`}
                                value={`$${finalTotal.toFixed(2)}`}
                                labelStyle="base-bold !text-dark-100"
                                valueStyle="base-bold !text-dark-100 !text-right"
                            />
                        </View>

                        <CustomButton 
                            title="Order Now" 
                            onPress={handleOrderNow}
                        />
                    </View>
                )}
            />
        </SafeAreaView>
    )
}

export default Cart
