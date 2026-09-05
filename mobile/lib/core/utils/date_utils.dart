import 'package:intl/intl.dart';

class AppDateUtils {
  static String formatDueDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      final now  = DateTime.now();
      final today    = DateTime(now.year, now.month, now.day);
      final tomorrow = today.add(const Duration(days: 1));
      final target   = DateTime(date.year, date.month, date.day);

      if (target == today)    return 'Today';
      if (target == tomorrow) return 'Tomorrow';

      final diff = target.difference(today).inDays;
      if (diff < 0)  return '${diff.abs()}d overdue';
      if (diff <= 7) return 'In $diff days';
      return DateFormat('MMM d').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatFullDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return 'No due date';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('MMMM d, y').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatMonthYear(DateTime date) =>
      DateFormat('MMMM y').format(date);

  static bool isOverdue(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return false;
    try {
      final due = DateTime.parse(dateStr);
      final today = DateTime.now();
      return DateTime(due.year, due.month, due.day)
          .isBefore(DateTime(today.year, today.month, today.day));
    } catch (_) {
      return false;
    }
  }

  static bool isToday(String? dateStr) {
    if (dateStr == null) return false;
    try {
      final due   = DateTime.parse(dateStr);
      final today = DateTime.now();
      return due.year == today.year &&
             due.month == today.month &&
             due.day == today.day;
    } catch (_) {
      return false;
    }
  }

  static String greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  static String todayLabel() => DateFormat('EEEE, MMMM d').format(DateTime.now());
}
