import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';
import PushNotification from 'react-native-push-notification';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

// Context interface
interface NotificationContextType {
  isAuthorized: boolean;
  pendingNotifications: any[];
  scheduleNotification: (title: string, message: string, date: Date, soundName?: string, vibrate?: boolean, id?: string) => void;
  cancelNotification: (id: string) => void;
  cancelAllNotifications: () => void;
  fetchPendingNotifications: () => void;
  requestAuthorization: () => Promise<boolean>;
  scheduleTestNotification: () => void;
}

interface NotificationManagerProviderProps {
  children: ReactNode;
}

// Create the context
export const NotificationContext = createContext<NotificationContextType>({
  isAuthorized: false,
  pendingNotifications: [],
  scheduleNotification: () => {},
  cancelNotification: () => {},
  cancelAllNotifications: () => {},
  fetchPendingNotifications: () => {},
  requestAuthorization: async () => false,
  scheduleTestNotification: () => {},
});

export const NotificationManagerProvider: React.FC<NotificationManagerProviderProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState<any[]>([]);

  // Initialize notifications
  useEffect(() => {
    configurePushNotifications();
    checkNotificationPermissions();
  }, []);

  // Configure push notifications
  const configurePushNotifications = () => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);

        // Process the notification
        if (notification.userInteraction) {
          // User tapped on the notification
          console.log('User tapped on notification');
        }

        // required on iOS only
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },

      // (optional) Called when the user fails to register for remote notifications
      onRegistrationError: function (err) {
        console.error(err.message, err);
      },

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });
  };

  // Check notification permissions
  const checkNotificationPermissions = async () => {
    if (Platform.OS === 'ios') {
      PushNotificationIOS.checkPermissions((permissions) => {
        setIsAuthorized(permissions.alert && permissions.badge && permissions.sound);
      });
    } else {
      // On Android, permissions are granted at installation time
      setIsAuthorized(true);
    }
  };

  // Request permission
  const requestAuthorization = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      try {
        const permissions = await PushNotificationIOS.requestPermissions({
          alert: true,
          badge: true,
          sound: true,
        });
        const permissionsGranted = Boolean(permissions.alert && permissions.badge && permissions.sound);
        setIsAuthorized(permissionsGranted);
        return permissionsGranted;
      } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
      }
    } else {
      // On Android, permissions are granted at installation time
      return true;
    }
  };

  // Schedule a local notification
  const scheduleNotification = (
    title: string,
    message: string,
    date: Date,
    soundName: string = 'default',
    vibrate: boolean = true,
    id: string = Date.now().toString()
  ) => {
    PushNotification.localNotificationSchedule({
      id,
      title,
      message,
      date,
      playSound: true,
      soundName,
      vibrate,
      // For Android
      channelId: 'medication-reminders',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      importance: 'high',
      vibration: 500,
      // For iOS
      userInfo: { id },
    });

    // Refresh the list of pending notifications
    fetchPendingNotifications();
  };

  // Cancel a notification
  const cancelNotification = (id: string) => {
    PushNotification.cancelLocalNotification(id);
    fetchPendingNotifications();
  };

  // Cancel all notifications
  const cancelAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
    setPendingNotifications([]);
  };

  // Fetch all pending notifications
  const fetchPendingNotifications = () => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      setPendingNotifications(notifications);
    });
  };

  // Schedule a test notification for 5 seconds from now
  const scheduleTestNotification = () => {
    const now = new Date(Date.now() + 5 * 1000);
    
    scheduleNotification(
      'Test Notification',
      'This is a test notification from the Medication Reminder app.',
      now,
      'default',
      true,
    );
  };

  // Context value
  const contextValue = {
    isAuthorized,
    pendingNotifications,
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    fetchPendingNotifications,
    requestAuthorization,
    scheduleTestNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook for using the notification context
export const useNotificationManager = () => {
  const context = React.useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationManager must be used within a NotificationManagerProvider');
  }
  return context;
}; 