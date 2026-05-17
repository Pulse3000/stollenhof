package com.stollenhof.zeiterfassung

import android.content.Context

/** Simple persistent settings (background choice + alarm) via SharedPreferences. */
class SettingsStore(context: Context) {

    private val prefs =
        context.applicationContext.getSharedPreferences("settings", Context.MODE_PRIVATE)

    var backgroundIndex: Int
        get() = prefs.getInt(KEY_BG, 0)
        set(value) = prefs.edit().putInt(KEY_BG, value).apply()

    var alarmEnabled: Boolean
        get() = prefs.getBoolean(KEY_ALARM_ON, false)
        set(value) = prefs.edit().putBoolean(KEY_ALARM_ON, value).apply()

    var alarmHour: Int
        get() = prefs.getInt(KEY_ALARM_H, 7)
        set(value) = prefs.edit().putInt(KEY_ALARM_H, value).apply()

    var alarmMinute: Int
        get() = prefs.getInt(KEY_ALARM_M, 0)
        set(value) = prefs.edit().putInt(KEY_ALARM_M, value).apply()

    private companion object {
        const val KEY_BG = "background_index"
        const val KEY_ALARM_ON = "alarm_enabled"
        const val KEY_ALARM_H = "alarm_hour"
        const val KEY_ALARM_M = "alarm_minute"
    }
}
