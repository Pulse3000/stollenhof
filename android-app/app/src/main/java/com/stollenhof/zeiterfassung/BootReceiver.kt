package com.stollenhof.zeiterfassung

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/** Re-arms the daily alarm after a device reboot (alarms are cleared on boot). */
class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action != Intent.ACTION_BOOT_COMPLETED) return
        val settings = SettingsStore(context)
        if (settings.alarmEnabled) {
            AlarmScheduler.schedule(context, settings.alarmHour, settings.alarmMinute)
        }
    }
}
