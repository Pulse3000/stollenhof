package com.stollenhof.zeiterfassung

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val settings = SettingsStore(context)

        val serviceIntent = Intent(context, AlarmService::class.java)
            .putExtra(AlarmService.EXTRA_SOUND, settings.alarmSoundUri)
        ContextCompat.startForegroundService(context, serviceIntent)

        // setAlarmClock is one-shot; re-arm for the next day so it repeats daily.
        if (settings.alarmEnabled) {
            AlarmScheduler.schedule(context, settings.alarmHour, settings.alarmMinute)
        }
    }
}
