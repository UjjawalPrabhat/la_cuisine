import { View, Text, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { databases } from '@/lib/appwrite';
import { appwriteConfig } from '@/lib/appwrite';
import { MenuItem, CartCustomization } from '@/type';
import CustomButton from '@/components/CustomButton';
import { useCartStore } from '@/store/cart.store';
import { images } from '@/constants';

const MenuDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<CartCustomization[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchMenuItem();
  }, [id]);

  const fetchMenuItem = async () => {
    try {
      const response = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.menuCollectionId,
        id!
      );
      setMenuItem(response as MenuItem);
    } catch (error) {
      console.error('Error fetching menu item:', error);
      Alert.alert('Error', 'Failed to load menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!menuItem) return;

    const totalPrice = menuItem.price + selectedCustomizations.reduce((sum, custom) => sum + custom.price, 0);

    for (let i = 0; i < quantity; i++) {
      addItem({
        id: menuItem.$id,
        name: menuItem.name,
        price: totalPrice,
        image_url: `${menuItem.image_url}?project=${appwriteConfig.projectId}`,
        customizations: selectedCustomizations,
      });
    }

    Alert.alert('Success', 'Item added to cart!');
    router.back();
  };

  const toggleCustomization = (customization: CartCustomization) => {
    setSelectedCustomizations(prev => {
      const exists = prev.find(c => c.id === customization.id);
      if (exists) {
        return prev.filter(c => c.id !== customization.id);
      } else {
        return [...prev, customization];
      }
    });
  };

  const getTotalPrice = () => {
    if (!menuItem) return 0;
    const customizationPrice = selectedCustomizations.reduce((sum, custom) => sum + custom.price, 0);
    return (menuItem.price + customizationPrice) * quantity;
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </SafeAreaView>
    );
  }

  if (!menuItem) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg">Menu item not found</Text>
        <CustomButton title="Go Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="relative">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute top-4 left-4 z-10 w-10 h-10 bg-white rounded-full items-center justify-center"
          >
            <Image source={images.arrowBack} className="w-6 h-6" resizeMode="contain" />
          </TouchableOpacity>
          
          <Image
            source={{ uri: `${menuItem.image_url}?project=${appwriteConfig.projectId}` }}
            className="w-full h-80"
            resizeMode="cover"
          />
        </View>

        <View className="p-6">
          {/* Item Info */}
          <Text className="text-2xl font-bold mb-2">{menuItem.name}</Text>
          <Text className="text-gray-600 text-lg mb-4">{menuItem.description}</Text>
          
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-bold text-primary">${menuItem.price}</Text>
            <View className="flex-row items-center">
              <Image source={images.star} className="w-4 h-4 mr-1" resizeMode="contain" />
              <Text className="text-gray-600">{menuItem.rating}</Text>
            </View>
          </View>

          {/* Nutrition Info */}
          <View className="flex-row justify-around bg-gray-100 p-4 rounded-lg mb-6">
            <View className="items-center">
              <Text className="text-lg font-bold">{menuItem.calories}</Text>
              <Text className="text-gray-600">Calories</Text>
            </View>
            <View className="items-center">
              <Text className="text-lg font-bold">{menuItem.protein}g</Text>
              <Text className="text-gray-600">Protein</Text>
            </View>
          </View>

          {/* Quantity Selector */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-lg font-semibold">Quantity</Text>
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center"
              >
                <Image source={images.minus} className="w-4 h-4" resizeMode="contain" />
              </TouchableOpacity>
              <Text className="mx-4 text-lg font-bold">{quantity}</Text>
              <TouchableOpacity
                onPress={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-primary rounded-full items-center justify-center"
              >
                <Image source={images.plus} className="w-4 h-4" resizeMode="contain" tintColor="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add to Cart Button */}
      <View className="p-6 border-t border-gray-200">
        <CustomButton
          title={`Add to Cart - $${getTotalPrice().toFixed(2)}`}
          onPress={handleAddToCart}
        />
      </View>
    </SafeAreaView>
  );
};

export default MenuDetail;
