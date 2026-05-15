import { useEffect, useState } from 'react';
import * as Network from 'expo-network';
import { Platform } from 'react-native';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: 'none' | 'unknown' | 'cellular' | 'wifi' | 'bluetooth' | 'ethernet' | 'vpn' | 'other';
}

/**
 * Hook to monitor network connectivity status
 * Returns current network status and provides callbacks for changes
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
  });

  useEffect(() => {
    let subscription: any;

    const setupNetworkListener = async () => {
      try {
        // Get initial status
        const initialState = await Network.getNetworkStateAsync();
        setStatus({
          isConnected: initialState.isConnected ?? true,
          isInternetReachable: initialState.isInternetReachable ?? true,
          type: (initialState.type as any) ?? 'unknown',
        });

        // Listen for changes (only on native platforms)
        if (Platform.OS !== 'web') {
          subscription = Network.addNetworkStateListener((state: any) => {
            setStatus({
              isConnected: state.isConnected ?? true,
              isInternetReachable: state.isInternetReachable ?? true,
              type: (state.type as any) ?? 'unknown',
            });
          });
        }
      } catch (error) {
        console.error('Failed to setup network listener:', error);
      }
    };

    setupNetworkListener();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return status;
}
