import 'package:flutter/foundation.dart';
import '../models/project.dart';
import '../models/task.dart';
import '../services/project_service.dart';

class ProjectProvider extends ChangeNotifier {
  final _service = ProjectService();

  List<ProjectModel> _projects = [];
  bool    _loading = false;
  String? _error;

  List<ProjectModel> get projects => _projects;
  bool    get loading => _loading;
  String? get error   => _error;

  ProjectModel? findById(String id) {
    try { return _projects.firstWhere((p) => p.id == id); } catch (_) { return null; }
  }

  /// Enriches projects with task counts from the task list
  void enrichWithTasks(List<TaskModel> tasks) {
    _projects = _projects.map((p) {
      final pts  = tasks.where((t) => t.projectId == p.id).toList();
      final done = pts.where((t) => t.isDone).length;
      return p.copyWith(totalTasks: pts.length, completedTasks: done);
    }).toList();
    notifyListeners();
  }

  Future<void> fetchProjects() async {
    _loading = true;
    _error   = null;
    notifyListeners();
    try {
      _projects = await _service.getProjects();
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<bool> createProject({
    required String name,
    required String category,
    String? description,
    required String priority,
    required String status,
  }) async {
    try {
      final project = await _service.createProject(
        name: name, category: category,
        description: description, priority: priority, status: status,
      );
      _projects.insert(0, project);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProject(ProjectModel project) async {
    try {
      final updated = await _service.updateProject(project);
      final idx = _projects.indexWhere((p) => p.id == project.id);
      if (idx != -1) { _projects[idx] = updated; notifyListeners(); }
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteProject(String projectId) async {
    try {
      await _service.deleteProject(projectId);
      _projects.removeWhere((p) => p.id == projectId);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() { _error = null; notifyListeners(); }
}
