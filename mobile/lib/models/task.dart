class TaskModel {
  final dynamic id;         // int or String as returned by backend
  final String title;
  final String status;      // todo | inprogress | done
  final String priority;    // high | medium | low
  final String? dueDate;    // YYYY-MM-DD
  final String? projectId;
  final String? category;
  final int order;
  final String? assigneeId;
  final String? createdAt;

  const TaskModel({
    required this.id,
    required this.title,
    required this.status,
    required this.priority,
    this.dueDate,
    this.projectId,
    this.category,
    this.order = 0,
    this.assigneeId,
    this.createdAt,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) => TaskModel(
        id:         json['id'],
        title:      json['title'] as String,
        status:     (json['status'] as String? ?? 'todo').toLowerCase(),
        priority:   (json['priority'] as String? ?? 'medium').toLowerCase(),
        dueDate:    json['due_date'] as String?,
        projectId:  json['project_id'] as String?,
        category:   json['category'] as String?,
        order:      (json['order'] as int?) ?? 0,
        assigneeId: json['assignee_id'] as String?,
        createdAt:  json['created_at'] as String?,
      );

  Map<String, dynamic> toJson() => {
        'id':          id,
        'title':       title,
        'status':      status,
        'priority':    priority,
        'due_date':    dueDate,
        'project_id':  projectId,
        'category':    category,
        'order':       order,
        'assignee_id': assigneeId,
      };

  TaskModel copyWith({
    dynamic id,
    String? title,
    String? status,
    String? priority,
    String? dueDate,
    String? projectId,
    String? category,
    int? order,
    String? assigneeId,
    String? createdAt,
  }) =>
      TaskModel(
        id:         id         ?? this.id,
        title:      title      ?? this.title,
        status:     status     ?? this.status,
        priority:   priority   ?? this.priority,
        dueDate:    dueDate    ?? this.dueDate,
        projectId:  projectId  ?? this.projectId,
        category:   category   ?? this.category,
        order:      order      ?? this.order,
        assigneeId: assigneeId ?? this.assigneeId,
        createdAt:  createdAt  ?? this.createdAt,
      );

  bool get isDone       => status == 'done';
  bool get isInProgress => status == 'inprogress';
  bool get isTodo       => status == 'todo';

  bool get isOverdue {
    if (dueDate == null || isDone) return false;
    try {
      final due   = DateTime.parse(dueDate!);
      final today = DateTime.now();
      return DateTime(due.year, due.month, due.day)
          .isBefore(DateTime(today.year, today.month, today.day));
    } catch (_) {
      return false;
    }
  }
}
