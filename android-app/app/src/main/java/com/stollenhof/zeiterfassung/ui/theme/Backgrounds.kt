package com.stollenhof.zeiterfassung.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.luminance

data class AppBackground(val name: String, val color: Color) {
    /** Black text on light backgrounds, white text on dark ones. */
    val onColor: Color get() = if (color.luminance() > 0.5f) Color(0xFF1A1A1A) else Color.White
}

val backgrounds = listOf(
    AppBackground("Weiß", Color(0xFFFFFFFF)),
    AppBackground("Mint", Color(0xFFE3F4EF)),
    AppBackground("Sand", Color(0xFFF3EDE2)),
    AppBackground("Himmel", Color(0xFFE5EEF6)),
    AppBackground("Lavendel", Color(0xFFECE8F5)),
    AppBackground("Nacht", Color(0xFF15171C))
)

fun backgroundAt(index: Int): AppBackground =
    backgrounds.getOrElse(index) { backgrounds.first() }
