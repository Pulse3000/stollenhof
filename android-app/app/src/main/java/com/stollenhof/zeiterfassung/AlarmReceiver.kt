package com.stollenhof.zeiterfassung

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import androidx.core.app.NotificationCompat

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val customSound = SettingsStore(context).alarmSoundUri?.let { Uri.parse(it) }
        val alarmSound = customSound
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        if (customSound != null) {
            runCatching {
                context.grantUriPermission(
                    "com.android.systemui",
                    customSound,
                    Intent.FLAG_GRANT_READ_URI_PERMISSION
                )
            }
        }

        // Notification channels cache their sound; vary the id so a new
        // pick takes effect instead of keeping the old tone.
        val channelId = CHANNEL_ID + "_" + (customSound?.hashCode() ?: 0)

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Wecker",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Erinnerung zur Zeiterfassung"
                enableVibration(true)
                setSound(
                    alarmSound,
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
            }
            nm.createNotificationChannel(channel)
        }

        val contentIntent = PendingIntent.getActivity(
            context, 0,
            Intent(context, MainActivity::class.java)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle("Zeiterfassung")
            .setContentText("Zeit für deine Tätigkeit – jetzt erfassen!")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setSound(alarmSound)
            .setVibrate(longArrayOf(0, 500, 250, 500))
            .setAutoCancel(true)
            .setFullScreenIntent(contentIntent, true)
            .setContentIntent(contentIntent)
            .build()

        nm.notify(NOTIFICATION_ID, notification)

        // setAlarmClock is one-shot; re-arm for the next day so it repeats daily.
        val settings = SettingsStore(context)
        if (settings.alarmEnabled) {
            AlarmScheduler.schedule(context, settings.alarmHour, settings.alarmMinute)
        }
    }

    private companion object {
        const val CHANNEL_ID = "alarm_channel"
        const val NOTIFICATION_ID = 42
    }
}
