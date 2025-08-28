import { databases, appwriteConfig } from './appwrite';
import { ID } from 'react-native-appwrite';
import dummyData from './data';

interface Category {
    name: string;
    description: string;
}

interface Customization {
    name: string;
    price: number;
    type: "topping" | "side" | "size" | "crust" | string;
}

interface MenuItem {
    name: string;
    description: string;
    image_url: string;
    price: number;
    rating: number;
    calories: number;
    protein: number;
    category_name: string;
    customizations: string[];
}

interface DummyData {
    categories: Category[];
    customizations: Customization[];
    menu: MenuItem[];
}

const data = dummyData as DummyData;

export const checkAndSeedDatabase = async (): Promise<void> => {
    try {
        // Check if categories exist
        const existingCategories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        );

        // Check if menu items exist
        const existingMenuItems = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId
        );

        // Only seed if both collections are empty
        if (existingCategories.documents.length === 0 && existingMenuItems.documents.length === 0) {
            // Security: Only log in development
            if (__DEV__) {
                if (__DEV__) console.log('🌱 Database is empty, starting auto-seeding...');
            }

            // 1. Create Categories and map them
            const categoryMap: Record<string, string> = {};
            for (const cat of data.categories) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.categoriesCollectionId,
                        ID.unique(),
                        cat
                    );
                    categoryMap[cat.name] = doc.$id;
                    if (__DEV__) console.log(`✅ Created category: ${cat.name}`);
                } catch (error) {
                    if (__DEV__) console.error(`❌ Error creating category ${cat.name}:`, error);
                }
            }

            // 2. Create Customizations
            const customizationMap: Record<string, string> = {};
            for (const cus of data.customizations) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.customizationsCollectionId,
                        ID.unique(),
                        {
                            name: cus.name,
                            price: cus.price,
                            type: cus.type,
                        }
                    );
                    customizationMap[cus.name] = doc.$id;
                    if (__DEV__) console.log(`✅ Created customization: ${cus.name}`);
                } catch (error) {
                    if (__DEV__) console.error(`❌ Error creating customization ${cus.name}:`, error);
                }
            }

            // 3. Create Menu Items
            let createdItemsCount = 0;
            for (const item of data.menu) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCollectionId,
                        ID.unique(),
                        {
                            name: item.name,
                            description: item.description,
                            image_url: item.image_url,
                            price: item.price,
                            rating: item.rating,
                            calories: item.calories,
                            protein: item.protein,
                            categories: categoryMap[item.category_name],
                        }
                    );

                    createdItemsCount++;
                    if (__DEV__) console.log(`✅ Created menu item: ${item.name}`);

                    // 4. Create menu_customizations relationships
                    for (const cusName of item.customizations) {
                        if (customizationMap[cusName]) {
                            try {
                                await databases.createDocument(
                                    appwriteConfig.databaseId,
                                    appwriteConfig.menuCustomizationsCollectionId,
                                    ID.unique(),
                                    {
                                        menu: doc.$id,
                                        customizations: customizationMap[cusName],
                                    }
                                );
                            } catch (error) {
                                if (__DEV__) console.error(`❌ Error linking ${item.name} with ${cusName}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    if (__DEV__) console.error(`❌ Error creating menu item ${item.name}:`, error);
                }
            }

            if (__DEV__) console.log(`🎉 Auto-seeding complete! Created ${Object.keys(categoryMap).length} categories, ${Object.keys(customizationMap).length} customizations, and ${createdItemsCount} menu items.`);
        } else if (existingCategories.documents.length > 0 && existingMenuItems.documents.length === 0) {
            if (__DEV__) console.log('📊 Categories exist but no menu items found. Adding menu items and customizations...');
            
            // Get existing categories and create map
            const categoryMap: Record<string, string> = {};
            for (const cat of existingCategories.documents) {
                categoryMap[cat.name] = cat.$id;
            }

            // Create Customizations if they don't exist
            const existingCustomizations = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.customizationsCollectionId
            );

            const customizationMap: Record<string, string> = {};
            if (existingCustomizations.documents.length === 0) {
                for (const cus of data.customizations) {
                    try {
                        const doc = await databases.createDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.customizationsCollectionId,
                            ID.unique(),
                            {
                                name: cus.name,
                                price: cus.price,
                                type: cus.type,
                            }
                        );
                        customizationMap[cus.name] = doc.$id;
                        if (__DEV__) console.log(`✅ Created customization: ${cus.name}`);
                    } catch (error) {
                        if (__DEV__) console.error(`❌ Error creating customization ${cus.name}:`, error);
                    }
                }
            } else {
                // Map existing customizations
                for (const cus of existingCustomizations.documents) {
                    customizationMap[cus.name] = cus.$id;
                }
            }
            
            // Create menu items
            let createdItemsCount = 0;
            for (const item of data.menu) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCollectionId,
                        ID.unique(),
                        {
                            name: item.name,
                            description: item.description,
                            image_url: item.image_url,
                            price: item.price,
                            rating: item.rating,
                            calories: item.calories,
                            protein: item.protein,
                            categories: categoryMap[item.category_name],
                        }
                    );

                    createdItemsCount++;
                    if (__DEV__) console.log(`✅ Created menu item: ${item.name}`);

                    // Create menu_customizations relationships
                    for (const cusName of item.customizations) {
                        if (customizationMap[cusName]) {
                            try {
                                await databases.createDocument(
                                    appwriteConfig.databaseId,
                                    appwriteConfig.menuCustomizationsCollectionId,
                                    ID.unique(),
                                    {
                                        menu: doc.$id,
                                        customizations: customizationMap[cusName],
                                    }
                                );
                            } catch (error) {
                                if (__DEV__) console.error(`❌ Error linking ${item.name} with ${cusName}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    if (__DEV__) console.error(`❌ Error creating menu item ${item.name}:`, error);
                }
            }
            
            if (__DEV__) console.log(`🎉 Menu seeding complete! Created ${createdItemsCount} menu items.`);
        } else {
            if (__DEV__) console.log('📊 Database already contains data, skipping auto-seeding.');
        }
    } catch (error) {
        if (__DEV__) console.error('❌ Auto-seeding failed:', error);
    }
};
