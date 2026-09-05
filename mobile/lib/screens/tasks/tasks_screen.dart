import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_theme.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../routes/app_routes.dart';
import '../../widgets/task_card.dart';
import '../../widgets/empty_state.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});
  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  final _searchCtrl = TextEditingController();
  String _searchQuery  = '';
  String _filterStatus = '';
  String _filterType   = 'all'; // 'all', 'independent', 'project'
  String _sortBy       = 'due_date';

  final _statuses = [
    ('All',         ''),
    ('To Do',       AppConstants.statusTodo),
    ('In Progress', AppConstants.statusInProgress),
    ('Done',        AppConstants.statusDone),
  ];

  @override
  void initState() {
    super.initState();
    _tabs = TabController(length: 3, vsync: this);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TaskProvider>().fetchTasks();
      context.read<ProjectProvider>().fetchProjects();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  List<TaskModel> _getFiltered(List<TaskModel> all) {
    var list = all.where((t) {
      if (_filterStatus.isNotEmpty && t.status != _filterStatus) return false;
      if (_filterType == 'independent' && t.projectId != null) return false;
      if (_filterType == 'project' && t.projectId == null) return false;
      if (_searchQuery.isNotEmpty &&
          !t.title.toLowerCase().contains(_searchQuery.toLowerCase())) return false;
      return true;
    }).toList();

    switch (_sortBy) {
      case 'priority':
        const order = {'high': 0, 'medium': 1, 'low': 2};
        list.sort((a, b) => (order[a.priority] ?? 1).compareTo(order[b.priority] ?? 1));
      case 'alpha':
        list.sort((a, b) => a.title.compareTo(b.title));
      case 'newest':
        list.sort((a, b) => (b.createdAt ?? '').compareTo(a.createdAt ?? ''));
      default: // due_date
        list.sort((a, b) {
          if (a.dueDate == null && b.dueDate == null) return 0;
          if (a.dueDate == null) return 1;
          if (b.dueDate == null) return -1;
          return a.dueDate!.compareTo(b.dueDate!);
        });
    }
    return list;
  }

  void _showSortSheet() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) {
        final opts = [
          ('Due Date',    'due_date'),
          ('Priority',    'priority'),
          ('Newest First','newest'),
          ('A – Z',       'alpha'),
        ];
        return Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(left: 4, bottom: 8),
                child: Text('Sort by', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16)),
              ),
              ...opts.map((o) => RadioListTile<String>(
                title: Text(o.$1),
                value: o.$2,
                groupValue: _sortBy,
                onChanged: (v) { setState(() => _sortBy = v!); Navigator.pop(context); },
                activeColor: AppTheme.primaryColor,
              )),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final tp    = context.watch<TaskProvider>();
    final pp    = context.watch<ProjectProvider>();
    final theme = Theme.of(context);

    // Tab-filtered source
    List<TaskModel> source;
    switch (_tabs.index) {
      case 1: source = tp.todayTasks;   break;
      case 2: source = tp.overdueTasks; break;
      default: source = tp.tasks;
    }
    final displayed = _getFiltered(source);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.sort_rounded),
            tooltip: 'Sort',
            onPressed: _showSortSheet,
          ),
          const SizedBox(width: 4),
        ],
        bottom: TabBar(
          controller: _tabs,
          onTap: (_) => setState(() {}),
          tabs: [
            Tab(text: 'All (${tp.tasks.length})'),
            Tab(text: 'Today (${tp.todayTasks.length})'),
            Tab(text: 'Overdue (${tp.overdueTasks.length})'),
          ],
          labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
          labelColor: AppTheme.primaryColor,
          unselectedLabelColor: theme.colorScheme.onSurface.withOpacity(0.5),
          indicatorColor: AppTheme.primaryColor,
          indicatorWeight: 3,
        ),
      ),
      body: Column(
        children: [
          // Search + filter row
          Container(
            color: theme.scaffoldBackgroundColor,
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
            child: Column(
              children: [
                // Search bar
                TextField(
                  controller: _searchCtrl,
                  decoration: InputDecoration(
                    hintText: 'Search tasks...',
                    prefixIcon: const Icon(Icons.search_rounded, size: 20),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? IconButton(
                            icon: const Icon(Icons.clear_rounded, size: 18),
                            onPressed: () { _searchCtrl.clear(); setState(() => _searchQuery = ''); },
                          )
                        : null,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  ),
                  onChanged: (v) => setState(() => _searchQuery = v),
                ),
                const SizedBox(height: 10),
                // Status filter chips
                SizedBox(
                  height: 34,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: _statuses.map((s) {
                      final active = _filterStatus == s.$2;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(s.$1),
                          selected: active,
                          onSelected: (_) => setState(() =>
                              _filterStatus = active ? '' : s.$2),
                          backgroundColor: theme.colorScheme.surface,
                          selectedColor: AppTheme.primaryColor.withOpacity(0.12),
                          checkmarkColor: AppTheme.primaryColor,
                          labelStyle: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: active ? AppTheme.primaryColor : theme.colorScheme.onSurface.withOpacity(0.6),
                          ),
                          side: BorderSide(
                            color: active ? AppTheme.primaryColor.withOpacity(0.3) : Colors.transparent,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                const SizedBox(height: 10),
                // Type filter chips
                SizedBox(
                  height: 34,
                  child: ListView(
                    scrollDirection: Axis.horizontal,
                    children: [
                      _buildTypeChip('All', 'all', theme),
                      _buildTypeChip('Independent', 'independent', theme),
                      _buildTypeChip('Project Tasks', 'project', theme),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
              ],
            ),
          ),

          // Task list
          Expanded(
            child: tp.loading
                ? const Center(child: CircularProgressIndicator())
                : displayed.isEmpty
                    ? EmptyState(
                        icon: Icons.task_alt_rounded,
                        title: _searchQuery.isNotEmpty ? 'No results found' : 'No tasks yet',
                        subtitle: _searchQuery.isNotEmpty
                            ? 'Try a different search term'
                            : 'Create your first task to get started',
                        actionLabel: _searchQuery.isEmpty ? 'Add Task' : null,
                        onAction: _searchQuery.isEmpty
                            ? () => Navigator.pushNamed(context, AppRoutes.createTask)
                            : null,
                      )
                    : RefreshIndicator(
                        onRefresh: () => tp.fetchTasks(),
                        child: ListView.builder(
                          padding: const EdgeInsets.fromLTRB(16, 4, 16, 100),
                          itemCount: displayed.length,
                          itemBuilder: (ctx, i) {
                            final t = displayed[i];
                            final proj = t.projectId != null ? pp.findById(t.projectId!) : null;
                            return TaskCard(
                              task: t,
                              projectName: proj?.name,
                              onTap: () => Navigator.pushNamed(ctx, AppRoutes.taskDetail, arguments: t)
                                  .then((_) => tp.fetchTasks()),
                              onToggleDone: () => tp.toggleDone(t),
                              onDelete: () => tp.deleteTask(t),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.createTask)
            .then((_) => tp.fetchTasks()),
        child: const Icon(Icons.add_rounded),
      ),
    );
  }

  Widget _buildTypeChip(String label, String value, ThemeData theme) {
    final active = _filterType == value;
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: FilterChip(
        label: Text(label),
        selected: active,
        onSelected: (_) => setState(() => _filterType = value),
        backgroundColor: theme.colorScheme.surface,
        selectedColor: AppTheme.primaryColor.withOpacity(0.12),
        checkmarkColor: AppTheme.primaryColor,
        labelStyle: TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w600,
          color: active ? AppTheme.primaryColor : theme.colorScheme.onSurface.withOpacity(0.6),
        ),
        side: BorderSide(
          color: active ? AppTheme.primaryColor.withOpacity(0.3) : Colors.transparent,
        ),
      ),
    );
  }
}
