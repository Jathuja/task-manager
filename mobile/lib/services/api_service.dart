import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import '../core/constants/app_constants.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  const ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  String? _token;

  void setToken(String? token) => _token = token;

  Map<String, String> get _authHeaders => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Uri _uri(String path, {Map<String, String>? params}) {
    final base = Uri.parse(AppConstants.baseUrl + path);
    return params != null ? base.replace(queryParameters: params) : base;
  }

  Future<dynamic> get(String path, {Map<String, String>? params}) async {
    try {
      final res = await http
          .get(_uri(path, params: params), headers: _authHeaders)
          .timeout(AppConstants.requestTimeout);
      return _handle(res);
    } on SocketException {
      throw const ApiException('No internet connection. Please check your network.');
    } on HttpException {
      throw const ApiException('Could not reach the server. Please try again.');
    }
  }

  Future<dynamic> post(String path, Map<String, dynamic> body) async {
    try {
      final res = await http
          .post(_uri(path), headers: _authHeaders, body: jsonEncode(body))
          .timeout(AppConstants.requestTimeout);
      return _handle(res);
    } on SocketException {
      throw const ApiException('No internet connection. Please check your network.');
    }
  }

  Future<dynamic> postForm(String path, Map<String, String> fields) async {
    try {
      final res = await http
          .post(
            _uri(path),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              if (_token != null) 'Authorization': 'Bearer $_token',
            },
            body: fields,
          )
          .timeout(AppConstants.requestTimeout);
      return _handle(res);
    } on SocketException {
      throw const ApiException('No internet connection. Please check your network.');
    }
  }

  Future<dynamic> put(String path, Map<String, dynamic> body) async {
    try {
      final res = await http
          .put(_uri(path), headers: _authHeaders, body: jsonEncode(body))
          .timeout(AppConstants.requestTimeout);
      return _handle(res);
    } on SocketException {
      throw const ApiException('No internet connection. Please check your network.');
    }
  }

  Future<dynamic> delete(String path) async {
    try {
      final res = await http
          .delete(_uri(path), headers: _authHeaders)
          .timeout(AppConstants.requestTimeout);
      return _handle(res);
    } on SocketException {
      throw const ApiException('No internet connection. Please check your network.');
    }
  }

  dynamic _handle(http.Response res) {
    final body = res.body.isEmpty ? '{}' : res.body;
    final decoded = jsonDecode(body);
    if (res.statusCode >= 200 && res.statusCode < 300) return decoded;

    final msg = decoded is Map ? decoded['detail'] ?? 'Something went wrong.' : 'Something went wrong.';
    if (res.statusCode == 401) throw ApiException('Session expired. Please log in again.', statusCode: 401);
    throw ApiException(msg.toString(), statusCode: res.statusCode);
  }
}
