class ProjectModel {
  final String id;
  final String name;
  final String category;
  final String? description;
  final String priority;
  final String status;
  final String ownerId;
  final String? createdAt;

  // Computed during fetch (from tasks)
  final int totalTasks;
  final int completedTasks;

  const ProjectModel({
    required this.id,
    required this.name,
    required this.category,
    this.description,
    required this.priority,
    required this.status,
    required this.ownerId,
    this.createdAt,
    this.totalTasks = 0,
    this.completedTasks = 0,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) => ProjectModel(
        id:          json['id'] as String,
        name:        json['name'] as String,
        category:    json['category'] as String? ?? 'General',
        description: json['description'] as String?,
        priority:    json['priority'] as String? ?? 'Medium',
        status:      json['status'] as String? ?? 'Planning',
        ownerId:     json['owner_id'] as String,
        createdAt:   json['created_at'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'name':        name,
        'category':    category,
        'description': description,
        'priority':    priority,
        'status':      status,
      };

  ProjectModel copyWith({
    String? id,
    String? name,
    String? category,
    String? description,
    String? priority,
    String? status,
    String? ownerId,
    String? createdAt,
    int? totalTasks,
    int? completedTasks,
  }) =>
      ProjectModel(
        id:             id             ?? this.id,
        name:           name           ?? this.name,
        category:       category       ?? this.category,
        description:    description    ?? this.description,
        priority:       priority       ?? this.priority,
        status:         status         ?? this.status,
        ownerId:        ownerId        ?? this.ownerId,
        createdAt:      createdAt      ?? this.createdAt,
        totalTasks:     totalTasks     ?? this.totalTasks,
        completedTasks: completedTasks ?? this.completedTasks,
      );

  double get progressPercent =>
      totalTasks == 0 ? 0.0 : completedTasks / totalTasks;

  int get progressPercentInt => (progressPercent * 100).round();

  int get pendingTasks => totalTasks - completedTasks;
}
