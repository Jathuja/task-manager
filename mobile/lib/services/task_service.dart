import '../core/constants/app_constants.dart';
import '../models/task.dart';
import 'api_service.dart';

class TaskService {
  final _api = ApiService.instance;

  Future<List<TaskModel>> getTasks({String? projectId}) async {
    final params = projectId != null ? {'project_id': projectId} : null;
    final data = await _api.get(AppConstants.tasksEndpoint, params: params);
    return (data as List).map((e) => TaskModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<TaskModel> createTask({
    required String title,
    required String status,
    required String priority,
    String? dueDate,
    String? projectId,
    String? category,
  }) async {
    final id = DateTime.now().millisecondsSinceEpoch;
    final body = {
      'id':         id,
      'title':      title,
      'status':     status,
      'priority':   priority,
      'due_date':   dueDate,
      'project_id': projectId,
      'category':   category,
      'order':      0,
    };
    final data = await _api.post(AppConstants.tasksEndpoint, body);
    return TaskModel.fromJson(data as Map<String, dynamic>);
  }

  Future<TaskModel> updateTask(TaskModel task) async {
    final data = await _api.put(
      '${AppConstants.tasksEndpoint}/${task.id}',
      task.toJson(),
    );
    return TaskModel.fromJson(data as Map<String, dynamic>);
  }

  Future<TaskModel> updateStatus(TaskModel task, String newStatus) =>
      updateTask(task.copyWith(status: newStatus));

  Future<void> deleteTask(dynamic taskId) async =>
      _api.delete('${AppConstants.tasksEndpoint}/$taskId');
}
