package com.stollenhof.zeiterfassung.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "activities")
data class Activity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val note: String = "",
    val startTime: Long,
    val endTime: Long? = null,
    /** Sum of completed pause intervals in millis. */
    val pausedMillis: Long = 0,
    /** Timestamp the current (ongoing) pause started, or null if not paused. */
    val pauseStart: Long? = null
) {
    val isRunning: Boolean get() = endTime == null
    val isPaused: Boolean get() = endTime == null && pauseStart != null

    fun durationMillis(now: Long = System.currentTimeMillis()): Long {
        val endRef = endTime ?: now
        val ongoingPause = if (pauseStart != null) endRef - pauseStart else 0L
        return (endRef - startTime - pausedMillis - ongoingPause).coerceAtLeast(0L)
    }
}
