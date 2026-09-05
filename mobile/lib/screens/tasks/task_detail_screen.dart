import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/date_utils.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../routes/app_routes.dart';

class TaskDetailScreen extends StatelessWidget {
  const TaskDetailScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final task  = ModalRoute.of(context)!.settings.arguments as TaskModel;
    final tp    = context.watch<TaskProvider>();
    final pp    = context.read<ProjectProvider>();
    final theme = Theme.of(context);

    // Get fresh task from provider if available
    final current = tp.tasks.firstWhere((t) => t.id == task.id, orElse: () => task);
    final proj = current.projectId != null ? pp.findById(current.projectId!) : null;
    final pColor = AppTheme.priorityColor(current.priority);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Task Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            tooltip: 'Edit',
            onPressed: () => Navigator.pushNamed(context, AppRoutes.createTask, arguments: current)
                .then((_) => tp.fetchTasks()),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            color: AppTheme.errorColor,
            tooltip: 'Delete',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (_) => AlertDialog(
                  title: const Text('Delete Task'),
                  content: Text('Delete "${current.title}"?'),
                  actions: [
                    TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
                      child: const Text('Delete'),
                    ),
                  ],
                ),
              );
              if (confirm == true && context.mounted) {
                await tp.deleteTask(current);
                if (context.mounted) Navigator.pop(context);
              }
            },
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Priority bar + title
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: theme.brightness == Brightness.dark ? const Color(0xFF1E293B) : Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border(left: BorderSide(color: pColor, width: 5),
                    top: BorderSide(color: theme.dividerColor),
                    right: BorderSide(color: theme.dividerColor),
                    bottom: BorderSide(color: theme.dividerColor)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: pColor.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(current.priority.toUpperCase(),
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: pColor)),
                      ),
                      const Spacer(),
                      _StatusChip(status: current.status),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Text(current.title, style: theme.textTheme.headlineMedium),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Info grid
            _InfoCard(children: [
              _InfoRow(icon: Icons.calendar_today_rounded,
                  label: 'Due Date',
                  value: AppDateUtils.formatFullDate(current.dueDate),
                  valueColor: current.isOverdue ? AppTheme.errorColor : null),
              if (proj != null)
                _InfoRow(icon: Icons.folder_rounded, label: 'Project', value: proj.name),
              if (current.category?.isNotEmpty == true)
                _InfoRow(icon: Icons.label_outline_rounded, label: 'Category', value: current.category!),
              _InfoRow(icon: Icons.access_time_rounded, label: 'Created',
                  value: AppDateUtils.formatFullDate(current.createdAt)),
            ]),

            const SizedBox(height: 20),
            // Quick actions
            Text('Quick Actions', style: theme.textTheme.titleMedium),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _ActionBtn(
                    icon: current.isDone ? Icons.replay_rounded : Icons.check_circle_outline_rounded,
                    label: current.isDone ? 'Mark Pending' : 'Mark Done',
                    color: current.isDone ? AppTheme.warningColor : AppTheme.successColor,
                    onTap: () => context.read<TaskProvider>().toggleDone(current),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _ActionBtn(
                    icon: Icons.swap_horiz_rounded,
                    label: 'Change Status',
                    color: AppTheme.primaryColor,
                    onTap: () => _showStatusSheet(context, current),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showStatusSheet(BuildContext context, TaskModel task) {
    final statuses = [
      ('To Do',       'todo',        Icons.radio_button_unchecked_rounded),
      ('In Progress', 'inprogress',  Icons.timelapse_rounded),
      ('Done',        'done',        Icons.check_circle_rounded),
    ];
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(bottom: 8),
                child: Text('Change Status', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
              ...statuses.map((s) => ListTile(
                leading: Icon(s.$3, color: AppTheme.statusColor(s.$2)),
                title: Text(s.$1, style: const TextStyle(fontWeight: FontWeight.w600)),
                trailing: task.status == s.$2 ? Icon(Icons.check_rounded, color: AppTheme.primaryColor) : null,
                onTap: () {
                  context.read<TaskProvider>().changeStatus(task, s.$2);
                  Navigator.pop(context);
                },
              )),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final String status;
  const _StatusChip({required this.status});

  String get _label {
    switch (status) {
      case 'inprogress': return 'In Progress';
      case 'done':       return 'Done';
      default:           return 'To Do';
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = AppTheme.statusColor(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(width: 6, height: 6, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
          const SizedBox(width: 6),
          Text(_label, style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final List<Widget> children;
  const _InfoCard({required this.children});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        children: children.asMap().entries.map((e) => Column(
          children: [
            e.value,
            if (e.key < children.length - 1) const Divider(height: 1),
          ],
        )).toList(),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;
  const _InfoRow({required this.icon, required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          Icon(icon, size: 18, color: theme.colorScheme.onSurface.withOpacity(0.4)),
          const SizedBox(width: 12),
          Text(label, style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurface.withOpacity(0.5),
          )),
          const Spacer(),
          Text(value, style: theme.textTheme.titleMedium?.copyWith(color: valueColor)),
        ],
      ),
    );
  }
}

class _ActionBtn extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _ActionBtn({required this.icon, required this.label, required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w600, fontSize: 13))),
          ],
        ),
      ),
    );
  }
}
