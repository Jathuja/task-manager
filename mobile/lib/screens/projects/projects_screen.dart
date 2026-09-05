import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/project_provider.dart';
import '../../providers/task_provider.dart';
import '../../routes/app_routes.dart';
import '../../widgets/project_card.dart';
import '../../widgets/empty_state.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});
  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  String _query = '';
  final _searchCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      final tp = context.read<TaskProvider>();
      final pp = context.read<ProjectProvider>();
      if (tp.tasks.isEmpty) await tp.fetchTasks();
      await pp.fetchProjects();
      pp.enrichWithTasks(tp.tasks);
    });
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pp    = context.watch<ProjectProvider>();
    final theme = Theme.of(context);

    final displayed = pp.projects.where((p) =>
        p.name.toLowerCase().contains(_query.toLowerCase())).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Projects'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add_rounded),
            tooltip: 'New Project',
            onPressed: () => Navigator.pushNamed(context, AppRoutes.createProject)
                .then((_) async {
              final tp = context.read<TaskProvider>();
              await context.read<ProjectProvider>().fetchProjects();
              context.read<ProjectProvider>().enrichWithTasks(tp.tasks);
            }),
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // Search
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search projects...',
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _query.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () { _searchCtrl.clear(); setState(() => _query = ''); },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              ),
              onChanged: (v) => setState(() => _query = v),
            ),
          ),
          const SizedBox(height: 8),

          // Count row
          if (!pp.loading)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(
                children: [
                  Text('${displayed.length} project${displayed.length == 1 ? '' : 's'}',
                      style: theme.textTheme.bodySmall),
                ],
              ),
            ),

          // List
          Expanded(
            child: pp.loading
                ? const Center(child: CircularProgressIndicator())
                : displayed.isEmpty
                    ? EmptyState(
                        icon: Icons.folder_outlined,
                        title: _query.isNotEmpty ? 'No projects found' : 'No projects yet',
                        subtitle: _query.isNotEmpty
                            ? 'Try a different search term'
                            : 'Create your first project to organise tasks',
                        actionLabel: _query.isEmpty ? 'New Project' : null,
                        onAction: _query.isEmpty
                            ? () => Navigator.pushNamed(context, AppRoutes.createProject)
                            : null,
                      )
                    : RefreshIndicator(
                        onRefresh: () async {
                          final tp = context.read<TaskProvider>();
                          await Future.wait([tp.fetchTasks(), pp.fetchProjects()]);
                          pp.enrichWithTasks(tp.tasks);
                        },
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                          itemCount: displayed.length,
                          itemBuilder: (ctx, i) {
                            final project = displayed[i];
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 12),
                              child: ProjectCard(
                                project: project,
                                onTap: () => Navigator.pushNamed(ctx, AppRoutes.projectDetail, arguments: project),
                                onEdit: () => Navigator.pushNamed(ctx, AppRoutes.createProject, arguments: project)
                                    .then((_) async {
                                  final tp = ctx.read<TaskProvider>();
                                  await ctx.read<ProjectProvider>().fetchProjects();
                                  ctx.read<ProjectProvider>().enrichWithTasks(tp.tasks);
                                }),
                                onDelete: () async {
                                  final confirm = await showDialog<bool>(
                                    context: ctx,
                                    builder: (_) => AlertDialog(
                                      title: const Text('Delete Project'),
                                      content: Text('Delete "${project.name}" and all its tasks?'),
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
                                  if (confirm == true && ctx.mounted) {
                                    await ctx.read<ProjectProvider>().deleteProject(project.id);
                                  }
                                },
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
