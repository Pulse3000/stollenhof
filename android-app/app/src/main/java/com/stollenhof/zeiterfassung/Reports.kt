package com.stollenhof.zeiterfassung

import com.stollenhof.zeiterfassung.data.Activity
import java.util.Calendar

enum class ReportPeriod(val label: String) {
    DAY("Tag"),
    WEEK("Woche"),
    MONTH("Monat")
}

data class ReportLine(val name: String, val totalMillis: Long, val count: Int)

data class Report(val totalMillis: Long, val lines: List<ReportLine>)

fun buildReport(
    activities: List<Activity>,
    period: ReportPeriod,
    now: Long = System.currentTimeMillis()
): Report {
    val start = periodStart(period, now)
    val lines = activities
        .filter { it.startTime >= start }
        .groupBy { it.name }
        .map { (name, list) ->
            ReportLine(
                name = name,
                totalMillis = list.sumOf { it.durationMillis(now) },
                count = list.size
            )
        }
        .sortedByDescending { it.totalMillis }
    return Report(lines.sumOf { it.totalMillis }, lines)
}

private fun periodStart(period: ReportPeriod, now: Long): Long {
    val cal = Calendar.getInstance().apply {
        timeInMillis = now
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
    }
    when (period) {
        ReportPeriod.DAY -> Unit
        ReportPeriod.WEEK -> {
            cal.firstDayOfWeek = Calendar.MONDAY
            cal.set(Calendar.DAY_OF_WEEK, Calendar.MONDAY)
        }
        ReportPeriod.MONTH -> cal.set(Calendar.DAY_OF_MONTH, 1)
    }
    return cal.timeInMillis
}
