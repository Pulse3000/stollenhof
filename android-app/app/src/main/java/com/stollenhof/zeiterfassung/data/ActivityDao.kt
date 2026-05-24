package com.stollenhof.zeiterfassung.data

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import kotlinx.coroutines.flow.Flow

@Dao
interface ActivityDao {
    @Query("SELECT * FROM activities ORDER BY startTime DESC")
    fun observeAll(): Flow<List<Activity>>

    @Query("SELECT * FROM activities WHERE endTime IS NULL ORDER BY startTime DESC LIMIT 1")
    suspend fun runningActivity(): Activity?

    @Insert
    suspend fun insert(activity: Activity): Long

    @Update
    suspend fun update(activity: Activity)

    @Delete
    suspend fun delete(activity: Activity)
}
