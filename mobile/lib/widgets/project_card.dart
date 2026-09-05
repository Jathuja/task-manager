import 'package:flutter/material.dart';
import '../core/theme/app_theme.dart';
import '../models/project.dart';

class ProjectCard extends StatelessWidget {
  final ProjectModel project;
  final VoidCallback? onTap;
  final VoidCallback? onDelete;
  final VoidCallback? onEdit;

  const ProjectCard({
    super.key,
    required this.project,
    this.onTap,
    this.onDelete,
    this.onEdit,
  });

  Color get _categoryColor {
    switch (project.category.toLowerCase()) {
      case 'academic': return const Color(0xFF3B82F6);
      case 'startup':  return const Color(0xFF8B5CF6);
      case 'client':   return const Color(0xFFF59E0B);
      default:         return const Color(0xFF10B981);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme  = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final prog   = project.progressPercent;

    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF1E293B) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? const Color(0xFF334155) : const Color(0xFFE5E7EB),
          ),
          boxShadow: isDark
              ? null
              : [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 12, offset: const Offset(0, 4))],
        ),
        child: Padding(
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    width: 42, height: 42,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(Icons.folder_rounded, color: AppTheme.primaryColor, size: 22),
                  ),
                  const Spacer(),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: _categoryColor.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      project.category,
                      style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: _categoryColor),
                    ),
                  ),
                  const SizedBox(width: 6),
                  if (onEdit != null)
                    IconButton(
                      icon: const Icon(Icons.more_vert_rounded, size: 18),
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                      onPressed: () => _showMenu(context),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                project.name,
                style: theme.textTheme.titleLarge,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (project.description?.isNotEmpty == true) ...[
                const SizedBox(height: 4),
                Text(
                  project.description!,
                  style: theme.textTheme.bodySmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
              const SizedBox(height: 16),
              // Stats row
              Row(
                children: [
                  _Stat(label: 'Total', value: '${project.totalTasks}'),
                  const SizedBox(width: 16),
                  _Stat(label: 'Done', value: '${project.completedTasks}', color: AppTheme.successColor),
                  const SizedBox(width: 16),
                  _Stat(label: 'Pending', value: '${project.pendingTasks}', color: AppTheme.warningColor),
                ],
              ),
              const SizedBox(height: 12),
              // Progress bar
              Row(
                children: [
                  Expanded(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: prog,
                        minHeight: 6,
                        backgroundColor: isDark ? const Color(0xFF334155) : const Color(0xFFF3F4F6),
                        valueColor: AlwaysStoppedAnimation(
                          prog >= 1.0 ? AppTheme.successColor : AppTheme.primaryColor,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    '${project.progressPercentInt}%',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: prog >= 1.0 ? AppTheme.successColor : AppTheme.primaryColor,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => SafeArea(
        child: Wrap(
          children: [
            ListTile(
              leading: const Icon(Icons.edit_outlined),
              title: const Text('Edit Project'),
              onTap: () { Navigator.pop(context); onEdit?.call(); },
            ),
            ListTile(
              leading: Icon(Icons.delete_outline, color: AppTheme.errorColor),
              title: Text('Delete Project', style: TextStyle(color: AppTheme.errorColor)),
              onTap: () { Navigator.pop(context); onDelete?.call(); },
            ),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _Stat({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(value, style: theme.textTheme.titleMedium?.copyWith(color: color, fontWeight: FontWeight.w700)),
        Text(label, style: theme.textTheme.labelSmall),
      ],
    );
  }
}
