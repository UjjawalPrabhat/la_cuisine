import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, databases } from "./appwrite";
import dummyData from "./data";

interface Category {
    name: string;
    description: string;
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
    menu: MenuItem[];
}

const data = dummyData as DummyData;

async function simpleSeed(): Promise<void> {
    try {
        console.log("🌱 Starting simple seeding...");

        // 1. Get existing categories to avoid duplicates
        const existingCategories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId
        );

        const categoryMap: Record<string, string> = {};
        
        // Map existing categories
        existingCategories.documents.forEach((cat: any) => {
            categoryMap[cat.name] = cat.$id;
        });

        // 2. Create missing categories
        for (const category of data.categories) {
            if (!categoryMap[category.name]) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.categoriesCollectionId,
                        ID.unique(),
                        {
                            name: category.name,
                            description: category.description,
                        }
                    );
                    categoryMap[category.name] = doc.$id;
                    console.log(`✅ Created category: ${category.name}`);
                } catch (error: any) {
                    console.log(`❌ Error creating category ${category.name}:`, error.message);
                }
            } else {
                console.log(`⚡ Category ${category.name} already exists`);
            }
        }

        // 3. Get existing menu items to avoid duplicates
        const existingMenuItems = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId
        );

        const existingMenuNames = existingMenuItems.documents.map((item: any) => item.name);

        // 4. Create missing menu items (using external image URLs for simplicity)
        let createdCount = 0;
        for (const item of data.menu) {
            if (!existingMenuNames.includes(item.name)) {
                try {
                    const doc = await databases.createDocument(
                        appwriteConfig.databaseId,
                        appwriteConfig.menuCollectionId,
                        ID.unique(),
                        {
                            name: item.name,
                            description: item.description,
                            image_url: item.image_url, // Use external URL directly
                            price: item.price,
                            rating: item.rating,
                            calories: item.calories,
                            protein: item.protein,
                            categories: categoryMap[item.category_name] || null,
                        }
                    );
                    createdCount++;
                    console.log(`✅ Created menu item: ${item.name}`);
                } catch (error: any) {
                    console.log(`❌ Error creating menu item ${item.name}:`, error.message);
                }
            } else {
                console.log(`⚡ Menu item ${item.name} already exists`);
            }
        }

        console.log(`🎉 Simple seeding complete! Created ${createdCount} new menu items.`);
    } catch (error) {
        console.error("💥 Seeding failed:", error);
        throw error;
    }
}

export default simpleSeed;
