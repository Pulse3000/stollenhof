package com.stollenhof.zeiterfassung

import android.Manifest
import android.app.TimePickerDialog
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LocalContentColor
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.core.content.ContextCompat
import com.stollenhof.zeiterfassung.data.Activity
import com.stollenhof.zeiterfassung.ui.theme.ZeiterfassungTheme
import com.stollenhof.zeiterfassung.ui.theme.backgroundAt
import com.stollenhof.zeiterfassung.ui.theme.backgrounds
import kotlinx.coroutines.delay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by viewModels()

    private val notificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        requestNotificationPermissionIfNeeded()
        setContent {
            ZeiterfassungTheme {
                val bg = backgroundAt(viewModel.backgroundIndex)
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = bg.color,
                    contentColor = bg.onColor
                ) {
                    HomeScreen(viewModel)
                }
            }
        }
    }

    private fun requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
            PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeScreen(viewModel: MainViewModel) {
    val activities by viewModel.activities.collectAsState()
    var showDialog by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }

    // Live tick so running timers update every second.
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    val hasRunning = activities.any { it.isRunning }
    LaunchedEffect(hasRunning) {
        while (hasRunning) {
            now = System.currentTimeMillis()
            delay(1000)
        }
    }

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = { Text("Zeiterfassung", fontWeight = FontWeight.SemiBold) },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent,
                    titleContentColor = LocalContentColor.current,
                    actionIconContentColor = LocalContentColor.current
                ),
                actions = {
                    IconButton(onClick = { showSettings = true }) {
                        Icon(Icons.Default.Settings, contentDescription = "Einstellungen")
                    }
                }
            )
        }
    ) { inner ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(inner)
                .padding(horizontal = 20.dp)
        ) {
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = { showDialog = true },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp),
                shape = MaterialTheme.shapes.large
            ) {
                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(28.dp))
                Spacer(Modifier.width(10.dp))
                Text("Hinzufügen", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
            }

            Spacer(Modifier.height(20.dp))

            if (activities.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        "Noch keine Tätigkeiten erfasst.",
                        color = LocalContentColor.current.copy(alpha = 0.7f)
                    )
                }
            } else {
                LazyColumn(
                    contentPadding = PaddingValues(bottom = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(activities, key = { it.id }) { activity ->
                        ActivityRow(
                            activity = activity,
                            now = now,
                            onStop = { viewModel.stop(activity) },
                            onDelete = { viewModel.delete(activity) }
                        )
                    }
                }
            }
        }
    }

    if (showDialog) {
        AddActivityDialog(
            onDismiss = { showDialog = false },
            onSaveDuration = { name, note, minutes ->
                viewModel.addWithDuration(name, note, minutes)
                showDialog = false
            },
            onStartTimer = { name, note ->
                viewModel.startTimer(name, note)
                showDialog = false
            }
        )
    }

    if (showSettings) {
        SettingsDialog(viewModel = viewModel, onDismiss = { showSettings = false })
    }
}

@Composable
private fun SettingsDialog(viewModel: MainViewModel, onDismiss: () -> Unit) {
    val context = LocalContext.current
    Dialog(onDismissRequest = onDismiss) {
        Card(shape = MaterialTheme.shapes.large) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text("Einstellungen", fontSize = 20.sp, fontWeight = FontWeight.SemiBold)

                Spacer(Modifier.height(20.dp))
                Text("Hintergrund", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    backgrounds.forEachIndexed { index, bg ->
                        val selected = index == viewModel.backgroundIndex
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(bg.color)
                                .border(
                                    BorderStroke(
                                        if (selected) 3.dp else 1.dp,
                                        if (selected) MaterialTheme.colorScheme.primary
                                        else MaterialTheme.colorScheme.outline
                                    ),
                                    CircleShape
                                )
                                .clickable { viewModel.setBackground(index) }
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))
                Text("Wecker", fontWeight = FontWeight.SemiBold)
                Spacer(Modifier.height(8.dp))
                Text(
                    text = if (viewModel.alarmEnabled)
                        "Aktiv um %02d:%02d Uhr".format(
                            viewModel.alarmHour, viewModel.alarmMinute
                        )
                    else "Kein Wecker gestellt",
                    color = LocalContentColor.current.copy(alpha = 0.7f),
                    fontSize = 14.sp
                )
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = {
                        TimePickerDialog(
                            context,
                            { _, h, m -> viewModel.setAlarm(h, m) },
                            viewModel.alarmHour,
                            viewModel.alarmMinute,
                            true
                        ).show()
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Alarm, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text(if (viewModel.alarmEnabled) "Wecker ändern" else "Wecker stellen")
                }
                if (viewModel.alarmEnabled) {
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = { viewModel.cancelAlarm() },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Wecker löschen")
                    }
                }

                Spacer(Modifier.height(4.dp))
                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = LocalContentColor.current.copy(alpha = 0.7f)
                    )
                ) {
                    Text("Schließen")
                }
            }
        }
    }
}

@Composable
private fun ActivityRow(
    activity: Activity,
    now: Long,
    onStop: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    activity.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 17.sp
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = subtitle(activity),
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                if (activity.note.isNotBlank()) {
                    Spacer(Modifier.height(2.dp))
                    Text(
                        activity.note,
                        fontSize = 13.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Spacer(Modifier.width(8.dp))
            Text(
                text = formatDuration(activity.durationMillis(now)),
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = if (activity.isRunning)
                    MaterialTheme.colorScheme.primary
                else
                    MaterialTheme.colorScheme.onSurface
            )
            if (activity.isRunning) {
                IconButton(onClick = onStop) {
                    Icon(
                        Icons.Default.Stop,
                        contentDescription = "Stoppen",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            } else {
                IconButton(onClick = onDelete) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Löschen",
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun AddActivityDialog(
    onDismiss: () -> Unit,
    onSaveDuration: (name: String, note: String, minutes: Long) -> Unit,
    onStartTimer: (name: String, note: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var note by remember { mutableStateOf("") }
    var minutes by remember { mutableStateOf("") }

    Dialog(onDismissRequest = onDismiss) {
        Card(shape = MaterialTheme.shapes.large) {
            Column(modifier = Modifier.padding(24.dp)) {
                Text(
                    "Neue Tätigkeit",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(Modifier.height(16.dp))
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Tätigkeit") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = note,
                    onValueChange = { note = it },
                    label = { Text("Notiz (optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = minutes,
                    onValueChange = { v -> minutes = v.filter { it.isDigit() } },
                    label = { Text("Dauer in Minuten (optional)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = {
                        onSaveDuration(name, note, minutes.toLongOrNull() ?: 0L)
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Mit Dauer speichern")
                }
                Spacer(Modifier.height(8.dp))
                OutlinedButton(
                    onClick = { onStartTimer(name, note) },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Timer starten")
                }
                Spacer(Modifier.height(4.dp))
                TextButton(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                ) {
                    Text("Abbrechen")
                }
            }
        }
    }
}

private val timeFormat = SimpleDateFormat("dd.MM.yyyy HH:mm", Locale.GERMANY)

private fun subtitle(activity: Activity): String {
    val start = timeFormat.format(Date(activity.startTime))
    return if (activity.isRunning) "läuft seit $start" else "Start: $start"
}

private fun formatDuration(millis: Long): String {
    val totalSeconds = (millis / 1000).coerceAtLeast(0)
    val h = totalSeconds / 3600
    val m = (totalSeconds % 3600) / 60
    val s = totalSeconds % 60
    return if (h > 0)
        String.format(Locale.GERMANY, "%d:%02d:%02d", h, m, s)
    else
        String.format(Locale.GERMANY, "%02d:%02d", m, s)
}
