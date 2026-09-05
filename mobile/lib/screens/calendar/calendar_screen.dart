import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:table_calendar/table_calendar.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/date_utils.dart' as du;
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../routes/app_routes.dart';
import '../../widgets/task_card.dart';
import '../../widgets/empty_state.dart';

class CalendarScreen extends StatefulWidget {
  const CalendarScreen({super.key});
  @override
  State<CalendarScreen> createState() => _CalendarScreenState();
}

class _CalendarScreenState extends State<CalendarScreen> {
  DateTime _focused  = DateTime.now();
  DateTime _selected = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<TaskProvider>().fetchTasks());
  }

  @override
  Widget build(BuildContext context) {
    final tp    = context.watch<TaskProvider>();
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Build event map  date → tasks
    final Map<DateTime, List<TaskModel>> events = {};
    for (final t in tp.tasks) {
      if (t.dueDate != null) {
        try {
          final d = DateTime.parse(t.dueDate!);
          final key = DateTime(d.year, d.month, d.day);
          events[key] = [...(events[key] ?? []), t];
        } catch (_) {}
      }
    }

    List<TaskModel> _eventsForDay(DateTime day) {
      return events[DateTime(day.year, day.month, day.day)] ?? [];
    }

    final selectedTasks = _eventsForDay(_selected);

    return Scaffold(
      appBar: AppBar(title: const Text('Calendar')),
      body: RefreshIndicator(
        onRefresh: () => tp.fetchTasks(),
        child: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.fromLTRB(12, 8, 12, 0),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
                ),
                child: TableCalendar<TaskModel>(
                  firstDay: DateTime.utc(2020, 1, 1),
                  lastDay:  DateTime.utc(2030, 12, 31),
                  focusedDay: _focused,
                  selectedDayPredicate: (d) => isSameDay(_selected, d),
                  eventLoader: _eventsForDay,
                  calendarFormat: CalendarFormat.month,
                  startingDayOfWeek: StartingDayOfWeek.monday,
                  onDaySelected: (selected, focused) =>
                      setState(() { _selected = selected; _focused = focused; }),
                  onPageChanged: (f) => setState(() => _focused = f),
                  calendarStyle: CalendarStyle(
                    outsideDaysVisible: false,
                    todayDecoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.15),
                      shape: BoxShape.circle,
                    ),
                    todayTextStyle: TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w700,
                    ),
                    selectedDecoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    selectedTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
                    markerDecoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      shape: BoxShape.circle,
                    ),
                    markersMaxCount: 3,
                    defaultTextStyle: TextStyle(color: theme.colorScheme.onSurface),
                    weekendTextStyle: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.6)),
                  ),
                  headerStyle: HeaderStyle(
                    formatButtonVisible: false,
                    titleCentered: true,
                    titleTextStyle: theme.textTheme.titleLarge!,
                    leftChevronIcon: Icon(Icons.chevron_left_rounded, color: AppTheme.primaryColor),
                    rightChevronIcon: Icon(Icons.chevron_right_rounded, color: AppTheme.primaryColor),
                  ),
                  daysOfWeekStyle: DaysOfWeekStyle(
                    weekdayStyle: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.5),
                        fontSize: 12, fontWeight: FontWeight.w600),
                    weekendStyle: TextStyle(color: theme.colorScheme.onSurface.withOpacity(0.35),
                        fontSize: 12, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),

            // Selected day header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 20, 16, 8),
                child: Row(
                  children: [
                    Text(
                      isSameDay(_selected, DateTime.now())
                          ? 'Today\'s Tasks'
                          : 'Tasks on ${du.AppDateUtils.formatFullDate(_selected.toIso8601String().split('T')[0])}',
                      style: theme.textTheme.titleLarge,
                    ),
                    const Spacer(),
                    if (selectedTasks.isNotEmpty)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.primaryColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('${selectedTasks.length}',
                            style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w700)),
                      ),
                  ],
                ),
              ),
            ),

            // Tasks for selected day
            tp.loading
                ? const SliverToBoxAdapter(child: Center(child: Padding(padding: EdgeInsets.all(32), child: CircularProgressIndicator())))
                : selectedTasks.isEmpty
                    ? SliverToBoxAdapter(
                        child: EmptyState(
                          icon: Icons.event_available_rounded,
                          title: 'No tasks this day',
                          subtitle: 'Tap + to schedule a task for this date',
                          actionLabel: 'Add Task',
                          onAction: () => Navigator.pushNamed(context, AppRoutes.createTask)
                              .then((_) => context.read<TaskProvider>().fetchTasks()),
                        ),
                      )
                    : SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (ctx, i) {
                            final t = selectedTasks[i];
                            return Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: TaskCard(
                                task: t,
                                onTap: () => Navigator.pushNamed(ctx, AppRoutes.taskDetail, arguments: t)
                                    .then((_) => tp.fetchTasks()),
                                onToggleDone: () => tp.toggleDone(t),
                              ),
                            );
                          },
                          childCount: selectedTasks.length,
                        ),
                      ),

            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.createTask)
            .then((_) => context.read<TaskProvider>().fetchTasks()),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }
}
