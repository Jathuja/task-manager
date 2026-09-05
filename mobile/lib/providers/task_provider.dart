import 'package:flutter/foundation.dart';
import '../models/task.dart';
import '../services/task_service.dart';

class TaskProvider extends ChangeNotifier {
  final _service = TaskService();

  List<TaskModel> _tasks = [];
  bool   _loading = false;
  String? _error;

  List<TaskModel> get tasks    => _tasks;
  bool            get loading  => _loading;
  String?         get error    => _error;

  // ── Derived lists ──────────────────────────────────────────────────────────
  List<TaskModel> get todayTasks => _tasks.where((t) {
    if (t.dueDate == null) return false;
    final due   = DateTime.parse(t.dueDate!);
    final now   = DateTime.now();
    return due.year == now.year && due.month == now.month && due.day == now.day;
  }).toList();

  List<TaskModel> get overdueTasks  => _tasks.where((t) => t.isOverdue).toList();
  List<TaskModel> get completedTasks => _tasks.where((t) => t.isDone).toList();
  List<TaskModel> get pendingTasks   => _tasks.where((t) => !t.isDone).toList();

  List<TaskModel> upcomingTasks({int limit = 5}) {
    final future = _tasks
        .where((t) => !t.isDone && t.dueDate != null && !t.isOverdue)
        .toList()
      ..sort((a, b) => a.dueDate!.compareTo(b.dueDate!));
    return future.take(limit).toList();
  }

  List<TaskModel> tasksForDate(DateTime date) => _tasks.where((t) {
    if (t.dueDate == null) return false;
    final due = DateTime.parse(t.dueDate!);
    return due.year == date.year && due.month == date.month && due.day == date.day;
  }).toList();

  List<TaskModel> tasksForProject(String projectId) =>
      _tasks.where((t) => t.projectId == projectId).toList();

  // ── Filtering & Sorting ───────────────────────────────────────────────────
  List<TaskModel> filter({
    String? status,
    String? priority,
    String? query,
    String? projectId,
  }) {
    return _tasks.where((t) {
      if (status    != null && status.isNotEmpty    && t.status   != status)    return false;
      if (priority  != null && priority.isNotEmpty  && t.priority != priority)  return false;
      if (projectId != null && projectId.isNotEmpty && t.projectId != projectId) return false;
      if (query != null && query.isNotEmpty) {
        return t.title.toLowerCase().contains(query.toLowerCase());
      }
      return true;
    }).toList();
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────
  Future<void> fetchTasks({String? projectId}) async {
    _loading = true;
    _error   = null;
    notifyListeners();
    try {
      _tasks = await _service.getTasks(projectId: projectId);
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> createTask({
    required String title,
    required String status,
    required String priority,
    String? dueDate,
    String? projectId,
    String? category,
  }) async {
    try {
      final task = await _service.createTask(
        title:     title,
        status:    status,
        priority:  priority,
        dueDate:   dueDate,
        projectId: projectId,
        category:  category,
      );
      _tasks.insert(0, task);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateTask(TaskModel task) async {
    try {
      final updated = await _service.updateTask(task);
      final idx = _tasks.indexWhere((t) => t.id == task.id);
      if (idx != -1) {
        _tasks[idx] = updated;
        notifyListeners();
      }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> toggleDone(TaskModel task) {
    final newStatus = task.isDone ? 'todo' : 'done';
    return updateTask(task.copyWith(status: newStatus));
  }

  Future<bool> changeStatus(TaskModel task, String status) =>
      updateTask(task.copyWith(status: status));

  Future<bool> deleteTask(TaskModel task) async {
    try {
      await _service.deleteTask(task.id);
      _tasks.removeWhere((t) => t.id == task.id);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }
}
