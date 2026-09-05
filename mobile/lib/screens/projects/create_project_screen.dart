import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../models/project.dart';
import '../../providers/project_provider.dart';
import '../../widgets/custom_button.dart';

class CreateProjectScreen extends StatefulWidget {
  const CreateProjectScreen({super.key});
  @override
  State<CreateProjectScreen> createState() => _CreateProjectScreenState();
}

class _CreateProjectScreenState extends State<CreateProjectScreen> {
  final _formKey  = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();

  String  _category = 'Personal';
  String  _priority = 'Medium';
  String  _status   = 'Planning';
  bool    _saving   = false;
  String? _error;

  ProjectModel? _editing;
  bool          _isEdit = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_isEdit) {
      final arg = ModalRoute.of(context)?.settings.arguments;
      if (arg is ProjectModel) {
        _editing   = arg;
        _isEdit    = true;
        _nameCtrl.text = arg.name;
        _descCtrl.text = arg.description ?? '';
        _category  = arg.category;
        _priority  = arg.priority;
        _status    = arg.status;
      }
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    FocusScope.of(context).unfocus();
    setState(() { _saving = true; _error = null; });

    final pp = context.read<ProjectProvider>();
    bool ok;

    if (_isEdit && _editing != null) {
      ok = await pp.updateProject(_editing!.copyWith(
        name: _nameCtrl.text.trim(),
        description: _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        category: _category,
        priority: _priority,
        status: _status,
      ));
    } else {
      ok = await pp.createProject(
        name: _nameCtrl.text.trim(),
        category: _category,
        description: _descCtrl.text.trim().isEmpty ? null : _descCtrl.text.trim(),
        priority: _priority,
        status: _status,
      );
    }

    setState(() => _saving = false);
    if (ok && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(_isEdit ? 'Project updated!' : 'Project created!'),
        backgroundColor: AppTheme.successColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ));
      Navigator.pop(context);
    } else {
      setState(() => _error = pp.error ?? 'Something went wrong.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final categories = ['Personal', 'Academic', 'Startup', 'Client', 'General'];
    final priorities  = ['Low', 'Medium', 'High'];
    final statuses    = ['Planning', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit Project' : 'New Project'),
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
                  child: Text(_error!, style: TextStyle(color: AppTheme.errorColor)),
                ),

              _label('Project Name *', theme),
              const SizedBox(height: 8),
              TextFormField(
                controller: _nameCtrl,
                decoration: const InputDecoration(hintText: 'E.g. Website Redesign'),
                validator: (v) => v == null || v.trim().isEmpty ? 'Name is required' : null,
              ),
              const SizedBox(height: 20),

              _label('Category', theme),
              const SizedBox(height: 8),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(prefixIcon: Icon(Icons.label_outline_rounded, size: 18)),
                items: categories.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                onChanged: (v) => setState(() => _category = v!),
              ),
              const SizedBox(height: 20),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _label('Priority', theme),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          value: _priority,
                          items: priorities.map((p) => DropdownMenuItem(value: p, child: Text(p))).toList(),
                          onChanged: (v) => setState(() => _priority = v!),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _label('Status', theme),
                        const SizedBox(height: 8),
                        DropdownButtonFormField<String>(
                          value: _status,
                          items: statuses.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                          onChanged: (v) => setState(() => _status = v!),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              _label('Description (Optional)', theme),
              const SizedBox(height: 8),
              TextFormField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: const InputDecoration(hintText: 'Brief description of the project...'),
              ),
              const SizedBox(height: 36),

              CustomButton(
                label: _isEdit ? 'Save Changes' : 'Create Project',
                onPressed: _submit,
                loading: _saving,
                icon: _isEdit ? Icons.save_rounded : Icons.folder_special_rounded,
              ),
              const SizedBox(height: 12),
              CustomButton(label: 'Cancel', onPressed: () => Navigator.pop(context), outlined: true),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text, ThemeData theme) =>
      Text(text, style: theme.textTheme.labelLarge);
}
