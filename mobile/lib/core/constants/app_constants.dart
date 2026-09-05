// API Base URL – change this to match your environment
// Android Emulator: http://10.0.2.2:8000  (maps to host machine's localhost)
// Physical device: http://<YOUR_LAN_IP>:8000  (e.g. http://192.168.1.5:8000)
// Production:      https://your-api.com

class AppConstants {
  // ──────────────────────────────────────────────
  // API Configuration
  // ──────────────────────────────────────────────
  static const String baseUrl = 'http://127.0.0.1:8000';

  // Auth endpoints
  static const String loginEndpoint    = '/login';
  static const String registerEndpoint = '/register';
  static const String meEndpoint       = '/users/me';
  static const String updateUserEndpoint = '/users/update';
  static const String profilePictureEndpoint = '/users/profile-picture';

  // Task endpoints
  static const String tasksEndpoint    = '/api/v1/tasks';

  // Project endpoints
  static const String projectsEndpoint = '/api/v1/projects';

  // Alert endpoints
  static const String alertsEndpoint   = '/api/v1/alerts';

  // Analytics
  static const String analyticsEndpoint = '/analytics/monthly-tasks';

  // ──────────────────────────────────────────────
  // Secure Storage Keys
  // ──────────────────────────────────────────────
  static const String tokenKey    = 'auth_token';
  static const String usernameKey = 'username';

  // ──────────────────────────────────────────────
  // Task status values (match backend)
  // ──────────────────────────────────────────────
  static const String statusTodo       = 'todo';
  static const String statusInProgress = 'inprogress';
  static const String statusDone       = 'done';

  // ──────────────────────────────────────────────
  // Task priority values (match backend)
  // ──────────────────────────────────────────────
  static const String priorityHigh   = 'high';
  static const String priorityMedium = 'medium';
  static const String priorityLow    = 'low';

  // ──────────────────────────────────────────────
  // Timeouts
  // ──────────────────────────────────────────────
  static const Duration requestTimeout = Duration(seconds: 15);
}
