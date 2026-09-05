import '../core/constants/app_constants.dart';
import '../models/user.dart';
import 'api_service.dart';

class AuthService {
  final _api = ApiService.instance;

  /// Login – backend uses OAuth2 form encoding, not JSON
  Future<String> login(String username, String password) async {
    final data = await _api.postForm(AppConstants.loginEndpoint, {
      'username': username,
      'password': password,
    });
    return data['access_token'] as String;
  }

  Future<UserModel> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final data = await _api.post(AppConstants.registerEndpoint, {
      'username': username,
      'email':    email,
      'password': password,
    });
    return UserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<UserModel> getMe() async {
    final data = await _api.get(AppConstants.meEndpoint);
    return UserModel.fromJson(data as Map<String, dynamic>);
  }

  Future<void> updateProfile({
    String? fullName,
    String? email,
    String? oldPassword,
    String? newPassword,
  }) async {
    final body = <String, dynamic>{};
    if (fullName    != null) body['full_name']     = fullName;
    if (email       != null) body['email']          = email;
    if (oldPassword != null) body['old_password']   = oldPassword;
    if (newPassword != null) body['password']        = newPassword;
    await _api.put(AppConstants.updateUserEndpoint, body);
  }
}
