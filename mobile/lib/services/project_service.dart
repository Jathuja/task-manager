import '../core/constants/app_constants.dart';
import '../models/project.dart';
import 'api_service.dart';

class ProjectService {
  final _api = ApiService.instance;

  Future<List<ProjectModel>> getProjects() async {
    final data = await _api.get(AppConstants.projectsEndpoint);
    return (data as List)
        .map((e) => ProjectModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<ProjectModel> createProject({
    required String name,
    required String category,
    String? description,
    required String priority,
    required String status,
  }) async {
    final data = await _api.post(AppConstants.projectsEndpoint, {
      'name':        name,
      'category':    category,
      'description': description,
      'priority':    priority,
      'status':      status,
    });
    return ProjectModel.fromJson(data as Map<String, dynamic>);
  }

  Future<ProjectModel> updateProject(ProjectModel project) async {
    final data = await _api.put(
      '${AppConstants.projectsEndpoint}/${project.id}',
      project.toJson(),
    );
    return ProjectModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteProject(String projectId) async =>
      _api.delete('${AppConstants.projectsEndpoint}/$projectId');
}
