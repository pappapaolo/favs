import { useState, useEffect } from 'react';

export const useStorageQuota = () => {
    const [quota, setQuota] = useState({ usage: 0, quota: 0, percentage: 0, isCritical: false });

    const checkQuota = async () => {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            try {
                const estimate = await navigator.storage.estimate();
                const usage = estimate.usage || 0;
                const total = estimate.quota || 0;
                const percentage = total > 0 ? (usage / total) * 100 : 0;

                // Critical if > 90% used OR less than 10MB remaining
                const remaining = total - usage;
                const isCritical = percentage > 90 || (total > 0 && remaining < 10 * 1024 * 1024);

                setQuota({
                    usage,
                    quota: total,
                    percentage,
                    isCritical
                });
            } catch (err) {
                console.error("Storage estimate failed", err);
            }
        }
    };

    useEffect(() => {
        checkQuota();
        // Poll every 10 seconds
        const interval = setInterval(checkQuota, 10000);
        return () => clearInterval(interval);
    }, []);

    return { ...quota, checkQuota };
};
