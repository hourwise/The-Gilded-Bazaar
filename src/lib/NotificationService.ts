import notifee, { TimestampTrigger, TriggerType } from '@notifee/react-native';

class NotificationService {
  /**
   * Request permissions (required for iOS and Android 13+)
   */
  requestPermissions = async () => {
    await notifee.requestPermission();
  };

  /**
   * Displays an immediate notification.
   */
  displayNotification = async (title: string, body: string) => {
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display a notification
    await notifee.displayNotification({
      title: title,
      body: body,
      android: {
        channelId,
        // smallIcon: 'name_of_a_small_icon', // optional, defaults to 'ic_launcher'
        pressAction: {
          id: 'default',
        },
      },
    });
  };

  /**
   * Schedules a notification to appear after a delay.
   */
  scheduleNotification = async (title: string, message: string, delayInSeconds: number = 1) => {
    const date = new Date(Date.now() + delayInSeconds * 1000);

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    await notifee.createTriggerNotification(
      {
        title: title,
        body: message,
        android: {
          channelId,
        },
      },
      trigger,
    );
  };
}

export const notificationService = new NotificationService();
