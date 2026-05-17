package com.stollenhof.zeiterfassung

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.stollenhof.zeiterfassung.data.Activity
import com.stollenhof.zeiterfassung.data.AppDatabase
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class MainViewModel(app: Application) : AndroidViewModel(app) {

    private val dao = AppDatabase.get(app).activityDao()
    private val settings = SettingsStore(app)

    var backgroundIndex by mutableIntStateOf(settings.backgroundIndex)
        private set

    var alarmEnabled by mutableStateOf(settings.alarmEnabled)
        private set
    var alarmHour by mutableIntStateOf(settings.alarmHour)
        private set
    var alarmMinute by mutableIntStateOf(settings.alarmMinute)
        private set

    var backgroundImageUri by mutableStateOf(settings.backgroundImageUri)
        private set
    var alarmSoundUri by mutableStateOf(settings.alarmSoundUri)
        private set

    fun setBackground(index: Int) {
        backgroundIndex = index
        backgroundImageUri = null
        settings.backgroundIndex = index
        settings.backgroundImageUri = null
    }

    fun setBackgroundImage(uri: String) {
        backgroundImageUri = uri
        settings.backgroundImageUri = uri
    }

    fun clearBackgroundImage() {
        backgroundImageUri = null
        settings.backgroundImageUri = null
    }

    fun setAlarmSound(uri: String) {
        alarmSoundUri = uri
        settings.alarmSoundUri = uri
    }

    fun clearAlarmSound() {
        alarmSoundUri = null
        settings.alarmSoundUri = null
    }

    fun setAlarm(hour: Int, minute: Int) {
        alarmHour = hour
        alarmMinute = minute
        alarmEnabled = true
        settings.alarmHour = hour
        settings.alarmMinute = minute
        settings.alarmEnabled = true
        AlarmScheduler.schedule(getApplication(), hour, minute)
    }

    fun cancelAlarm() {
        alarmEnabled = false
        settings.alarmEnabled = false
        AlarmScheduler.cancel(getApplication())
    }

    val activities: StateFlow<List<Activity>> =
        dao.observeAll().stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5_000),
            initialValue = emptyList()
        )

    fun addWithDuration(name: String, note: String, minutes: Long) {
        val cleanName = name.trim().ifBlank { "Tätigkeit" }
        val end = System.currentTimeMillis()
        val start = end - minutes.coerceAtLeast(0) * 60_000L
        viewModelScope.launch {
            dao.insert(Activity(name = cleanName, note = note.trim(), startTime = start, endTime = end))
        }
    }

    fun startTimer(name: String, note: String) {
        val cleanName = name.trim().ifBlank { "Tätigkeit" }
        viewModelScope.launch {
            dao.insert(
                Activity(
                    name = cleanName,
                    note = note.trim(),
                    startTime = System.currentTimeMillis(),
                    endTime = null
                )
            )
        }
    }

    fun stop(activity: Activity) {
        viewModelScope.launch {
            dao.update(activity.copy(endTime = System.currentTimeMillis()))
        }
    }

    fun delete(activity: Activity) {
        viewModelScope.launch { dao.delete(activity) }
    }
}
