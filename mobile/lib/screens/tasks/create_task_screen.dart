import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/constants/app_constants.dart';
import '../../core/theme/app_theme.dart';
import '../../models/task.dart';
import '../../models/project.dart';
import '../../providers/task_provider.dart';
import '../../providers/project_provider.dart';
import '../../widgets/custom_button.dart';

class CreateTaskScreen extends StatefulWidget {
  const CreateTaskScreen({super.key});
  @override
  State<CreateTaskScreen> createState() => _CreateTaskScreenState();
}

class _CreateTaskScreenState extends State<CreateTaskScreen> {
  final _formKey    = GlobalKey<FormState>();
  final _titleCtrl  = TextEditingController();
  final _descCtrl   = TextEditingController();

  String  _status   = AppConstants.statusTodo;
  String  _priority = AppConstants.priorityMedium;
  String? _dueDate;
  String? _projectId;
  bool    _saving   = false;
  String? _error;

  TaskModel?    _editing;
  bool          _isEdit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isEdit) {
      final arg = ModalRoute.of(context)?.settings.arguments;
      if (arg is TaskModel) {
        _editing   = arg;
        _isEdit    = true;
        _titleCtrl.text = arg.title;
        _status    = arg.status;
        _priority  = arg.priority;
        _dueDate   = arg.dueDate;
        _projectId = arg.projectId;
      }
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) =>
        context.read<ProjectProvider>().fetchProjects());
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now  = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate != null ? DateTime.parse(_dueDate!) : now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 5),
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: Theme.of(ctx).colorScheme.copyWith(primary: AppTheme.primaryColor),
        ),
        child: child!,
      ),
    );
    if (picked != null) {
      setState(() => _dueDate = '${picked.year}-${picked.month.toString().padLeft(2,'0')}-${picked.day.toString().padLeft(2,'0')}');
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() { _saving = true; _error = null; });

    final tp = context.read<TaskProvider>();
    bool ok;

    if (_isEdit && _editing != null) {
      ok = await tp.updateTask(_editing!.copyWith(
        title:     _titleCtrl.text.trim(),
        status:    _status,
        priority:  _priority,
        dueDate:   _dueDate,
        projectId: _projectId,
      ));
    } else {
      ok = await tp.createTask(
        title:     _titleCtrl.text.trim(),
        status:    _status,
        priority:  _priority,
        dueDate:   _dueDate,
        projectId: _projectId,
      );
    }

    setState(() => _saving = false);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_isEdit ? 'Task updated!' : 'Task created!'),
        backgroundColor: AppTheme.successColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
      Navigator.pop(context);
    } else if (!ok) {
      setState(() => _error = tp.error ?? 'Something went wrong.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final pp    = context.watch<ProjectProvider>();
    final theme = Theme.of(context);

    final priorities = [
      (AppConstants.priorityHigh,   'High',   AppTheme.errorColor),
      (AppConstants.priorityMedium, 'Medium', AppTheme.warningColor),
      (AppConstants.priorityLow,    'Low',    AppTheme.successColor),
    ];
    final statuses = [
      (AppConstants.statusTodo,       'To Do'),
      (AppConstants.statusInProgress, 'In Progress'),
      (AppConstants.statusDone,       'Done'),
    ];

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit Task' : 'New Task'),
        leading: IconButton(
          icon: const Icon(Icons.close_rounded),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_error != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppTheme.errorColor.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(_error!, style: TextStyle(color: AppTheme.errorColor, fontWeight: FontWeight.w500)),
                ),

              // Title
              _sectionLabel('Task Title *', theme),
              const SizedBox(height: 8),
              TextFormField(
                controller: _titleCtrl,
                textInputAction: TextInputAction.next,
                decoration: const InputDecoration(hintText: 'What needs to be done?'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Title is required' : null,
              ),
              const SizedBox(height: 20),

              // Priority selector
              _sectionLabel('Priority', theme),
              const SizedBox(height: 10),
              Row(
                children: priorities.map((p) {
                  final active = _priority == p.$1;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: GestureDetector(
                        onTap: () => setState(() => _priority = p.$1),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: active ? p.$3.withOpacity(0.12) : theme.colorScheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: active ? p.$3 : theme.dividerColor,
                              width: active ? 2 : 1,
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(Icons.flag_rounded, color: p.$3, size: 22),
                              const SizedBox(height: 4),
                              Text(p.$2, style: TextStyle(
                                fontSize: 12, fontWeight: FontWeight.w700,
                                color: active ? p.$3 : theme.colorScheme.onSurface.withOpacity(0.6),
                              )),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),

              // Status
              _sectionLabel('Status', theme),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _status,
                decoration: const InputDecoration(prefixIcon: Icon(Icons.circle_outlined, size: 18)),
                items: statuses.map((s) => DropdownMenuItem(
                  value: s.$1,
                  child: Text(s.$2),
                )).toList(),
                onChanged: (v) => setState(() => _status = v!),
              ),
              const SizedBox(height: 20),

              // Due date
              _sectionLabel('Due Date', theme),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                  decoration: BoxDecoration(
                    color: theme.inputDecorationTheme.fillColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.calendar_today_rounded, size: 18,
                          color: _dueDate != null ? AppTheme.primaryColor : theme.colorScheme.onSurface.withOpacity(0.4)),
                      const SizedBox(width: 12),
                      Text(
                        _dueDate ?? 'Select a due date',
                        style: TextStyle(
                          fontSize: 14, fontWeight: FontWeight.w500,
                          color: _dueDate != null ? theme.colorScheme.onSurface : theme.colorScheme.onSurface.withOpacity(0.4),
                        ),
                      ),
                      const Spacer(),
                      if (_dueDate != null)
                        GestureDetector(
                          onTap: () => setState(() => _dueDate = null),
                          child: Icon(Icons.close_rounded, size: 18,
                              color: theme.colorScheme.onSurface.withOpacity(0.4)),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Project
              _sectionLabel('Project (Optional)', theme),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _projectId,
                decoration: const InputDecoration(
                  hintText: 'No project',
                  prefixIcon: Icon(Icons.folder_outlined, size: 18),
                ),
                items: [
                  const DropdownMenuItem(value: null, child: Text('No project')),
                  ...pp.projects.map((p) => DropdownMenuItem(value: p.id, child: Text(p.name))),
                ],
                onChanged: (v) => setState(() => _projectId = v),
              ),
              const SizedBox(height: 36),

              CustomButton(
                label: _isEdit ? 'Save Changes' : 'Create Task',
                onPressed: _submit,
                loading: _saving,
                icon: _isEdit ? Icons.save_rounded : Icons.add_rounded,
              ),
              const SizedBox(height: 12),
              CustomButton(
                label: 'Cancel',
                onPressed: () => Navigator.pop(context),
                outlined: true,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _sectionLabel(String text, ThemeData theme) =>
      Text(text, style: theme.textTheme.labelLarge);
}
