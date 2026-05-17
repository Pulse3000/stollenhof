package com.stollenhof.zeiterfassung

import android.content.Context
import android.graphics.BitmapFactory
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalContext

/** Loads a downsampled background bitmap from a content URI, dependency-free. */
@Composable
fun rememberBackgroundBitmap(uriString: String?): ImageBitmap? {
    val context = LocalContext.current
    return remember(uriString) {
        if (uriString.isNullOrBlank()) null
        else runCatching { decodeSampled(context, Uri.parse(uriString)) }.getOrNull()
    }
}

private const val MAX_DIMENSION = 1600

private fun decodeSampled(context: Context, uri: Uri): ImageBitmap? {
    val resolver = context.contentResolver

    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    resolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }

    var sample = 1
    val largest = maxOf(bounds.outWidth, bounds.outHeight)
    while (largest / sample > MAX_DIMENSION) sample *= 2

    val opts = BitmapFactory.Options().apply { inSampleSize = sample }
    val bitmap = resolver.openInputStream(uri)?.use {
        BitmapFactory.decodeStream(it, null, opts)
    }
    return bitmap?.asImageBitmap()
}
