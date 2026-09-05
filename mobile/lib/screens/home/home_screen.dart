import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/date_utils.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../routes/app_routes.dart';
import '../../widgets/stat_card.dart';
import '../../widgets/task_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadData());
  }

  Future<void> _loadData() async {
    final tp = context.read<TaskProvider>();
    final pp = context.read<ProjectProvider>();
    await Future.wait([tp.fetchTasks(), pp.fetchProjects()]);
    pp.enrichWithTasks(tp.tasks);
  }

  @override
  Widget build(BuildContext context) {
    final auth  = context.watch<AuthProvider>();
    final tasks = context.watch<TaskProvider>();
    final theme = Theme.of(context);

    final total     = tasks.tasks.length;
    final completed = tasks.completedTasks.length;
    final pending   = tasks.pendingTasks.length;
    final overdue   = tasks.overdueTasks.length;
    final progress  = total == 0 ? 0.0 : completed / total;
    final upcoming  = tasks.upcomingTasks(limit: 5);
    final user      = auth.user;

    return Scaffold(
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _loadData,
          child: CustomScrollView(
            slivers: [
              // ── Header ────────────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('${AppDateUtils.greeting()} 👋',
                                style: theme.textTheme.bodyMedium?.copyWith(
                                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                                )),
                            const SizedBox(height: 2),
                            Text(user?.displayName ?? 'there',
                                style: theme.textTheme.headlineLarge),
                            Text(AppDateUtils.todayLabel(),
                                style: theme.textTheme.bodySmall),
                          ],
                        ),
                      ),
                      // Avatar
                      GestureDetector(
                        onTap: () => Navigator.pushNamed(context, AppRoutes.profile),
                        child: CircleAvatar(
                          radius: 22,
                          backgroundColor: AppTheme.primaryColor,
                          child: Text(user?.initials ?? 'U',
                              style: const TextStyle(color: Colors.white,
                                  fontWeight: FontWeight.w700, fontSize: 16)),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Progress card ─────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Container(
                  margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [AppTheme.primaryColor, const Color(0xFF8B5CF6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.primaryColor.withOpacity(0.35),
                        blurRadius: 20, offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Today\'s Progress',
                          style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Text('${(progress * 100).round()}% Completed',
                          style: const TextStyle(color: Colors.white,
                              fontSize: 22, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: progress,
                          minHeight: 8,
                          backgroundColor: Colors.white.withOpacity(0.25),
                          valueColor: const AlwaysStoppedAnimation(Colors.white),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text('$completed of $total tasks done',
                          style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 12)),
                    ],
                  ),
                ),
              ),

              // ── Stat cards ────────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
                  child: GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.4,
                    children: [
                      StatCard(label: 'Total Tasks',  value: '$total',     icon: Icons.task_alt_rounded,      color: AppTheme.primaryColor),
                      StatCard(label: 'Completed',    value: '$completed', icon: Icons.check_circle_rounded,  color: AppTheme.successColor),
                      StatCard(label: 'Pending',      value: '$pending',   icon: Icons.pending_actions_rounded,color: AppTheme.warningColor),
                      StatCard(label: 'Overdue',      value: '$overdue',   icon: Icons.warning_amber_rounded,  color: AppTheme.errorColor),
                    ],
                  ),
                ),
              ),

              // ── Upcoming Tasks ────────────────────────────────────────────
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 24, 20, 8),
                  child: Row(
                    children: [
                      Text('Upcoming Tasks', style: theme.textTheme.titleLarge),
                      const Spacer(),
                      TextButton(
                        onPressed: () => Navigator.pushNamed(context, AppRoutes.tasks),
                        child: const Text('See all'),
                      ),
                    ],
                  ),
                ),
              ),

              if (tasks.loading)
                const SliverToBoxAdapter(
                  child: Center(child: Padding(
                    padding: EdgeInsets.all(40),
                    child: CircularProgressIndicator(),
                  )),
                )
              else if (upcoming.isEmpty)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: AppTheme.successColor.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppTheme.successColor.withOpacity(0.15)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.celebration_rounded, color: AppTheme.successColor, size: 28),
                          const SizedBox(width: 12),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('All caught up! 🎉',
                                  style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                              Text('No upcoming tasks.', style: theme.textTheme.bodySmall),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                )
              else
                SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (ctx, i) {
                      final t = upcoming[i];
                      return Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: TaskCard(
                          task: t,
                          onTap: () => Navigator.pushNamed(ctx, AppRoutes.taskDetail, arguments: t),
                          onToggleDone: () => ctx.read<TaskProvider>().toggleDone(t),
                        ),
                      );
                    },
                    childCount: upcoming.length,
                  ),
                ),

              const SliverToBoxAdapter(child: SizedBox(height: 100)),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => Navigator.pushNamed(context, AppRoutes.createTask),
        icon: const Icon(Icons.add_rounded),
        label: const Text('Add Task', style: TextStyle(fontWeight: FontWeight.w700)),
      ),
    );
  }
}
