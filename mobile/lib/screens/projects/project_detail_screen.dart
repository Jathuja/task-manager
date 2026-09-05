import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../models/project.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../routes/app_routes.dart';
import '../../widgets/task_card.dart';
import '../../widgets/empty_state.dart';

class ProjectDetailScreen extends StatefulWidget {
  const ProjectDetailScreen({super.key});
  @override
  State<ProjectDetailScreen> createState() => _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<TaskProvider>().fetchTasks());
  }

  @override
  Widget build(BuildContext context) {
    final project = ModalRoute.of(context)!.settings.arguments as ProjectModel;
    final tp      = context.watch<TaskProvider>();
    final theme   = Theme.of(context);
    final tasks   = tp.tasksForProject(project.id);
    final done    = tasks.where((t) => t.isDone).length;
    final prog    = tasks.isEmpty ? 0.0 : done / tasks.length;

    return Scaffold(
      appBar: AppBar(
        title: Text(project.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => Navigator.pushNamed(context, AppRoutes.createProject, arguments: project),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => tp.fetchTasks(),
        child: CustomScrollView(
          slivers: [
            // Project header
            SliverToBoxAdapter(
              child: Container(
                margin: const EdgeInsets.all(16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryColor, const Color(0xFF8B5CF6)],
                    begin: Alignment.topLeft, end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(project.category,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w700)),
                        ),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(project.status,
                              style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ),
                    if (project.description?.isNotEmpty == true) ...[
                      const SizedBox(height: 12),
                      Text(project.description!, style: TextStyle(color: Colors.white.withOpacity(0.85), fontSize: 14)),
                    ],
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        _WhiteStat(label: 'Total', value: '${tasks.length}'),
                        const SizedBox(width: 20),
                        _WhiteStat(label: 'Done', value: '$done'),
                        const SizedBox(width: 20),
                        _WhiteStat(label: 'Pending', value: '${tasks.length - done}'),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: prog,
                        minHeight: 8,
                        backgroundColor: Colors.white.withOpacity(0.25),
                        valueColor: const AlwaysStoppedAnimation(Colors.white),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text('${(prog * 100).round()}% complete',
                        style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12)),
                  ],
                ),
              ),
            ),

            // Tasks header
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
                child: Row(
                  children: [
                    Text('Tasks', style: theme.textTheme.titleLarge),
                    const Spacer(),
                    TextButton.icon(
                      icon: const Icon(Icons.add_rounded, size: 18),
                      label: const Text('Add Task'),
                      onPressed: () => Navigator.pushNamed(context, AppRoutes.createTask)
                          .then((_) => tp.fetchTasks()),
                    ),
                  ],
                ),
              ),
            ),

            // Task list
            tasks.isEmpty
                ? SliverToBoxAdapter(
                    child: EmptyState(
                      icon: Icons.task_outlined,
                      title: 'No tasks yet',
                      subtitle: 'Add tasks to this project',
                      actionLabel: 'Add Task',
                      onAction: () => Navigator.pushNamed(context, AppRoutes.createTask),
                    ),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (ctx, i) {
                        final t = tasks[i];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: TaskCard(
                            task: t,
                            onTap: () => Navigator.pushNamed(ctx, AppRoutes.taskDetail, arguments: t)
                                .then((_) => tp.fetchTasks()),
                            onToggleDone: () => tp.toggleDone(t),
                            onDelete: () => tp.deleteTask(t),
                          ),
                        );
                      },
                      childCount: tasks.length,
                    ),
                  ),

            const SliverToBoxAdapter(child: SizedBox(height: 80)),
          ],
        ),
      ),
    );
  }
}

class _WhiteStat extends StatelessWidget {
  final String label, value;
  const _WhiteStat({required this.label, required this.value});
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800)),
      Text(label,  style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 12)),
    ],
  );
}
