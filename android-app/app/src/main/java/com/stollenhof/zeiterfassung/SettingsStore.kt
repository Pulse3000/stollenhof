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

    /** content:// URI of a user-picked background image, or null for a color background. */
    var backgroundImageUri: String?
        get() = prefs.getString(KEY_BG_IMAGE, null)?.ifBlank { null }
        set(value) = prefs.edit().putString(KEY_BG_IMAGE, value).apply()

    /** content:// URI of a user-picked alarm sound, or null for the default alarm tone. */
    var alarmSoundUri: String?
        get() = prefs.getString(KEY_ALARM_SOUND, null)?.ifBlank { null }
        set(value) = prefs.edit().putString(KEY_ALARM_SOUND, value).apply()

    private companion object {
        const val KEY_BG = "background_index"
        const val KEY_ALARM_ON = "alarm_enabled"
        const val KEY_ALARM_H = "alarm_hour"
        const val KEY_ALARM_M = "alarm_minute"
        const val KEY_BG_IMAGE = "background_image_uri"
        const val KEY_ALARM_SOUND = "alarm_sound_uri"
    }
}
