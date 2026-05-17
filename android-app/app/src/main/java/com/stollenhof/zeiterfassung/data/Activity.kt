package com.stollenhof.zeiterfassung.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "activities")
data class Activity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val note: String = "",
    val startTime: Long,
    val endTime: Long? = null
) {
    val isRunning: Boolean get() = endTime == null

    fun durationMillis(now: Long = System.currentTimeMillis()): Long =
        (endTime ?: now) - startTime
}
