import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { sanitizeError } from "./security";

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

const useAppwrite = <T, P extends Record<string, string | number>>({
                                                                       fn,
                                                                       params = {} as P,
                                                                       skip = false,
                                                                   }: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await fn({ ...fetchParams });
                setData(result);
            } catch (err: unknown) {
                // Security: Use sanitized error messages
                const errorMessage = sanitizeError(err);
                setError(errorMessage);
                
                // Security: Only show alerts for critical errors, not all errors
                // This prevents too many alerts during normal app usage
                if (__DEV__) {
                    console.error('useAppwrite error details:', err);
                    Alert.alert("Error", errorMessage);
                }
            } finally {
                setLoading(false);
            }
        },
        [fn]
    );

    useEffect(() => {
        if (!skip) {
            fetchData(params);
        }
    }, []);

    const refetch = async (newParams?: P) => await fetchData(newParams!);

    return { data, loading, error, refetch };
};

export default useAppwrite;
