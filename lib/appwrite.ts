import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM || "com.jsm.foodordering",
    databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!,
    bucketId: process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!,
    userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
    categoriesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CATEGORIES_COLLECTION_ID!,
    menuCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_COLLECTION_ID!,
    customizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CUSTOMIZATIONS_COLLECTION_ID!,
    menuCustomizationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_MENU_CUSTOMIZATIONS_COLLECTION_ID!
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if(!newAccount) throw new Error('Failed to create account');

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountID: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        // Security: Log error details for debugging while throwing user-friendly message
        if (__DEV__) {
            console.error('createUser error details:', e);
        }
        throw e; // Re-throw to let error handler in component deal with user message
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // Check if there's already an active session
        try {
            await account.get();
            // If we get here, there's already an active session
            return;
        } catch {
            // No active session, proceed with sign in
        }

        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (e) {
        // Security: Log error details for debugging while throwing user-friendly message
        if (__DEV__) {
            console.error('signIn error details:', e);
        }
        throw e; // Re-throw to let error handler in component deal with user message
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        // Security: Log error details for debugging while throwing user-friendly message
        if (__DEV__) {
            console.error('signOut error details:', e);
        }
        throw e; // Re-throw to let error handler in component deal with user message
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if(!currentAccount) return null;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountID', currentAccount.$id)]
        )

        if(!currentUser || currentUser.documents.length === 0) return null;

        return currentUser.documents[0];
    } catch (e) {
        // Security: Only log in development, don't expose sensitive details
        if (__DEV__) {
            console.error('getCurrentUser error details:', e);
        }
        return null;
    }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
    try {
        let queries: string[] = [];

        // Get all menu items first
        const menus = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.menuCollectionId,
            queries,
        );

        let filteredMenus = menus.documents;

        // Filter by category if provided
        if (category && category !== 'all') {
            // First get the category document to find the ID
            const categoriesResult = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.categoriesCollectionId,
                [Query.equal('name', category)]
            );
            
            if (categoriesResult.documents.length > 0) {
                const categoryId = categoriesResult.documents[0].$id;
                filteredMenus = filteredMenus.filter((item: any) => 
                    item.categories === categoryId
                );
            }
        }

        // Security: Filter by search query if provided (query is already sanitized in component)
        if (query) {
            filteredMenus = filteredMenus.filter((item: any) => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        return filteredMenus;
    } catch (e) {
        // Security: Log error details for debugging while throwing user-friendly message
        if (__DEV__) {
            console.error('getMenu error details:', e);
        }
        throw e; // Re-throw to let error handler in component deal with user message
    }
}

export const getCategories = async () => {
    try {
        const categories = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.categoriesCollectionId,
        )

        return categories.documents;
    } catch (e) {
        // Security: Log error details for debugging while throwing user-friendly message
        if (__DEV__) {
            console.error('getCategories error details:', e);
        }
        throw e; // Re-throw to let error handler in component deal with user message
    }
}
