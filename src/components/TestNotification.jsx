import { Button } from "@mui/material";
import { LocalNotifications } from "@capacitor/local-notifications";

const TestNotification = () => {
  const triggerNotification = async () => {
    try {
      // Request permission using the Capacitor plugin.
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display === "granted") {
        // Schedule a notification to trigger 1 second later.
        await LocalNotifications.schedule({
          notifications: [
            {
              id: 1,
              title: "Test Notification",
              body: "This is a test notification.",
              schedule: { at: new Date(Date.now() + 1000) },
              sound: null,
              attachments: null,
              actionTypeId: "",
              extra: {},
            },
          ],
        });
      } else {
        // Fallback for web or if permission is not granted.
        if ("Notification" in window) {
          if (Notification.permission !== "granted") {
            await Notification.requestPermission();
          }
          if (Notification.permission === "granted") {
            new Notification("Test Notification", {
              body: "This is a test notification.",
            });
          }
        }
      }
    } catch (error) {
      console.error("Failed to schedule notification:", error);
    }
  };

  return (
    <Button variant="contained" onClick={triggerNotification}>
      Test Notification
    </Button>
  );
};

export default TestNotification;
