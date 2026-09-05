class UserModel {
  final String username;
  final String email;
  final String? fullName;
  final String? role;
  final String? department;
  final String? profilePictureUrl;

  const UserModel({
    required this.username,
    required this.email,
    this.fullName,
    this.role,
    this.department,
    this.profilePictureUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        username:          json['username'] as String,
        email:             json['email'] as String,
        fullName:          json['full_name'] as String?,
        role:              json['role'] as String?,
        department:        json['department'] as String?,
        profilePictureUrl: json['profile_picture_url'] as String?,
      );

  String get displayName => fullName?.isNotEmpty == true ? fullName! : username;

  String get initials {
    final name = displayName;
    final parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : 'U';
  }
}
