package com.example.proyectofinal_notegym_android.ui.dashboard.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import java.time.LocalDate
import java.time.YearMonth
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.ui.draw.scale
import androidx.compose.runtime.getValue



// Nombres como en React, pero para móvil.
private val dayNames = listOf("Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb")
private val monthNames = listOf(
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
)

// Calendario mensual estilo React, adaptado a móvil.
// selectedDay controla el día seleccionado.
// onDaySelected se dispara cuando el usuario toca un día.
@Composable
fun CalendarWidget(
    selectedDay: Int,
    onDaySelected: (Int) -> Unit
) {
    val today = LocalDate.now()
    val year = today.year
    val month = today.monthValue
    val ym = YearMonth.of(year, month)

    val daysInMonth = ym.lengthOfMonth()

    // dayOfWeek: Monday=1..Sunday=7.
    // Convertimos para que Domingo sea 0 (como en muchos calendarios web).
    val firstDow = ym.atDay(1).dayOfWeek.value
    val firstDayIndex = firstDow % 7

    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {

        // Cabecera mes/año.
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "${monthNames[month - 1]} $year",
                style = MaterialTheme.typography.titleSmall,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.width(8.dp))
        }

        // Cabecera de días de la semana.
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            for (name in dayNames) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Grid fijo 6x7 (42 celdas).
        // Importante: calculo el tamaño de celda con el ancho disponible.
        BoxWithConstraints(modifier = Modifier.fillMaxWidth()) {

            val spacing = 8.dp
            val cellSize = (maxWidth - (spacing * 6)) / 7

            val start = firstDayIndex
            val end = start + daysInMonth - 1

            Column(verticalArrangement = Arrangement.spacedBy(spacing)) {
                var cell = 0

                for (row in 0 until 6) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(spacing)
                    ) {
                        for (col in 0 until 7) {

                            val dayNumber = when {
                                cell < start -> 0
                                cell > end -> 0
                                else -> (cell - start) + 1
                            }

                            DayCell(
                                size = cellSize,
                                day = dayNumber,
                                isToday = (dayNumber == today.dayOfMonth),
                                isSelected = (dayNumber != 0 && dayNumber == selectedDay),
                                onClick = onDaySelected
                            )

                            cell++
                        }
                    }
                }
            }
        }
    }
}

// Celda del calendario.
// Si day=0, es un hueco (no clicable).
@Composable
private fun DayCell(
    size: Dp,
    day: Int,
    isToday: Boolean,
    isSelected: Boolean,
    onClick: (Int) -> Unit
) {
    val shape = RoundedCornerShape(12.dp)

    // Valores objetivo (los de siempre).
    val bgTarget = when {
        isSelected -> MaterialTheme.colorScheme.primary
        isToday -> MaterialTheme.colorScheme.primaryContainer
        else -> MaterialTheme.colorScheme.surface
    }

    val textTarget = when {
        isSelected -> MaterialTheme.colorScheme.onPrimary
        else -> MaterialTheme.colorScheme.onSurface
    }

    val borderTarget = when {
        isSelected -> MaterialTheme.colorScheme.primary
        isToday -> MaterialTheme.colorScheme.primary
        else -> MaterialTheme.colorScheme.outlineVariant
    }

    // Animación suave de color (sin saltos).
    val bg by animateColorAsState(targetValue = bgTarget, label = "bg")
    val textColor by animateColorAsState(targetValue = textTarget, label = "text")
    val borderColor by animateColorAsState(targetValue = borderTarget, label = "border")

    // Animación suave de tamaño cuando está seleccionado.
    val scale by animateFloatAsState(
        targetValue = if (isSelected) 1.05f else 1f,
        label = "scale"
    )

    Box(
        modifier = Modifier
            .size(size)
            .scale(scale)
            .clip(shape)
            .background(bg)
            .border(1.dp, borderColor, shape)
            .clickable(enabled = day != 0) {
                onClick(day)
            },
        contentAlignment = Alignment.Center
    ) {
        if (day != 0) {
            Text(
                text = day.toString(),
                color = textColor,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}
