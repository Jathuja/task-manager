import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../core/utils/date_utils.dart';
import '../models/task.dart';

class TaskCard extends StatelessWidget {
  final TaskModel task;
  final String? projectName;
  final VoidCallback? onTap;
  final VoidCallback? onToggleDone;
  final VoidCallback? onDelete;

  const TaskCard({
    super.key,
    required this.task,
    this.projectName,
    this.onTap,
    this.onToggleDone,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final pColor = AppTheme.priorityColor(task.priority);
    final isOver = task.isOverdue;

    return Dismissible(
      key: ValueKey(task.id),
      direction: DismissDirection.endToStart,
      confirmDismiss: (_) async {
        if (onDelete == null) return false;
        return await showDialog<bool>(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Delete Task'),
            content: Text('Delete "${task.title}"?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
              TextButton(
                onPressed: () => Navigator.pop(context, true),
                style: TextButton.styleFrom(foregroundColor: AppTheme.errorColor),
                child: const Text('Delete'),
              ),
            ],
          ),
        ) ?? false;
      },
      onDismissed: (_) => onDelete?.call(),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        margin: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: AppTheme.errorColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(16),
        ),
        child: const Icon(Icons.delete_outline_rounded, color: AppTheme.errorColor, size: 26),
      ),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          margin: const EdgeInsets.symmetric(vertical: 4),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E293B) : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border(
              left: BorderSide(color: pColor, width: 4),
              top:    BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
              right:  BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
              bottom: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB)),
            ),
          ),
          child: Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Checkbox
                GestureDetector(
                  onTap: onToggleDone,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 22, height: 22,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: task.isDone ? AppTheme.successColor : Colors.transparent,
                      border: Border.all(
                        color: task.isDone ? AppTheme.successColor : const Color(0xFFD1D5DB),
                        width: 2,
                      ),
                    ),
                    child: task.isDone
                        ? const Icon(Icons.check, size: 14, color: Colors.white)
                        : null,
                  ),
                ),
                const SizedBox(width: 12),
                // Content
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        task.title,
                        style: theme.textTheme.titleMedium?.copyWith(
                          decoration: task.isDone ? TextDecoration.lineThrough : null,
                          color: task.isDone ? theme.colorScheme.onSurface.withOpacity(0.4) : null,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 8),
                      // Meta row
                      Wrap(
                        spacing: 6,
                        runSpacing: 4,
                        children: [
                          // Priority badge
                          _Badge(label: task.priority.toUpperCase(), color: pColor),
                          // Due date
                          if (task.dueDate != null)
                            _Badge(
                              icon: Icons.calendar_today_rounded,
                              label: AppDateUtils.formatDueDate(task.dueDate),
                              color: isOver ? AppTheme.errorColor : theme.colorScheme.onSurface.withOpacity(0.4),
                            ),
                          // Project
                          if (projectName != null)
                            _Badge(
                              icon: Icons.folder_rounded,
                              label: projectName!,
                              color: AppTheme.primaryColor.withOpacity(0.7),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 6),
                // Status dot
                Container(
                  width: 8, height: 8,
                  margin: const EdgeInsets.only(top: 6),
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppTheme.statusColor(task.status),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Badge extends StatelessWidget {
  final IconData? icon;
  final String label;
  final Color color;
  const _Badge({this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.10),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: color),
            const SizedBox(width: 3),
          ],
          Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: color)),
        ],
      ),
    );
  }
}
