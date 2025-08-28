import {Account, Avatars, Client, Databases, ID, Query, Storage} from "react-native-appwrite";
import {CreateUserParams, GetMenuParams, SignInParams} from "@/type";

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.jsm.foodordering",
    databaseId: '68af02a2003afad28b60',
    bucketId: '68aef974000d4515687c',
    userCollectionId: '68af02f1001dcd9eb218',
    categoriesCollectionId: '68af04e40006697dc524',
    menuCollectionId: '68af0573000c21001cd4',
    customizationsCollectionId: '68af072400316baf777e',
    menuCustomizationsCollectionId: '68af0817000bbbb40673'
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
        if(!newAccount) throw Error;

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountID: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e) {
        throw new Error(e as string);
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
        throw new Error(e as string);
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession('current');
    } catch (e) {
        throw new Error(e as string);
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
        console.log('getCurrentUser error:', e);
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

        // Filter by search query if provided
        if (query) {
            filteredMenus = filteredMenus.filter((item: any) => 
                item.name.toLowerCase().includes(query.toLowerCase()) ||
                item.description.toLowerCase().includes(query.toLowerCase())
            );
        }

        return filteredMenus;
    } catch (e) {
        console.error('Error in getMenu:', e);
        throw new Error(e as string);
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
        throw new Error(e as string);
    }
}
