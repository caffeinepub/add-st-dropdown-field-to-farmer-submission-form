import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GOOGLE_APPS_SCRIPT_WEB_APP_URL } from '@/lib/googleAppsScript';

// Submit farmer data directly to Google Sheets
export function useSubmitFarmerData(loginId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      farmerName: string;
      mobileNumber: string;
      village: string | null;
      district: string;
      taluka: string;
      st: string;
      mgoHeadquarters: string;
      wheatVariety: string;
      crop1: string;
      crop2: string | null;
      irrigationType: string;
      totalAcreage: number;
    }) => {
      // Construct payload with explicit field order matching Google Apps Script expectations
      // loginID (capital ID) FIRST, name SECOND - critical for proper Google Sheets column order
      const payload = {
        loginID: loginId,
        name: data.farmerName,
        mobileNumber: data.mobileNumber,
        village: data.village || '',
        district: data.district,
        taluka: data.taluka,
        crop1: data.crop1,
        crop2: data.crop2 || '',
        irrigationType: data.irrigationType,
        totalAcreage: data.totalAcreage,
        ST: data.st || '',
        MGOHQ: data.mgoHeadquarters || '',
        WheatVariety: data.wheatVariety || '',
      };

      // Send POST request to Google Apps Script with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
          method: 'POST',
          mode: 'no-cors', // Google Apps Script requires no-cors mode
          body: JSON.stringify(payload),
          signal: controller.signal,
          redirect: 'follow',
        });

        clearTimeout(timeoutId);

        // CRITICAL: With no-cors mode, response.ok is always true and status is 0
        // This is expected behavior for Google Apps Script Web Apps
        // If we reach here without throwing, the request was sent successfully
        return { success: true };
      } catch (error: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout errors - genuine connection issue
        if (error.name === 'AbortError') {
          throw new Error('Connection Error');
        }
        
        // Handle network errors - genuine connection issues
        if (
          error.message?.includes('Failed to fetch') || 
          error.message?.includes('NetworkError') || 
          error.message?.includes('Network request failed') ||
          error.message?.includes('Load failed') ||
          error.message?.includes('net::ERR_') ||
          error.message?.includes('ECONNREFUSED') ||
          !navigator.onLine
        ) {
          throw new Error('Connection Error');
        }
        
        // Re-throw other errors
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate submission count to trigger refresh
      queryClient.invalidateQueries({ queryKey: ['submissionCount', loginId] });
    },
  });
}

// Get submission count for a specific login ID from Google Sheets
export function useGetSubmissionCount(loginId: string) {
  const queryClient = useQueryClient();

  return {
    data: queryClient.getQueryData<number>(['submissionCount', loginId]) || 0,
    refetch: async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`${GOOGLE_APPS_SCRIPT_WEB_APP_URL}?action=getCount&loginId=${encodeURIComponent(loginId)}`, {
          method: 'GET',
          signal: controller.signal,
          redirect: 'follow',
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          let data;
          
          if (contentType && contentType.includes('application/json')) {
            data = await response.json();
          } else {
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch {
              data = { count: 0 };
            }
          }
          
          const count = data.count || 0;
          queryClient.setQueryData(['submissionCount', loginId], count);
          return count;
        }
      } catch (error) {
        console.error('Failed to fetch submission count:', error);
      }
      return 0;
    },
  };
}

// Increment local submission count
export function useIncrementSubmissionCount(loginId: string) {
  const queryClient = useQueryClient();

  return () => {
    const currentCount = queryClient.getQueryData<number>(['submissionCount', loginId]) || 0;
    queryClient.setQueryData(['submissionCount', loginId], currentCount + 1);
  };
}
