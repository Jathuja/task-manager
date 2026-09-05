import 'package:flutter/material.dart';

class AppTheme {
  // Brand palette
  static const Color _primary      = Color(0xFF6366F1); // Indigo-500
  static const Color _primaryDark  = Color(0xFF4F46E5); // Indigo-600
  static const Color _secondary    = Color(0xFF8B5CF6); // Violet-500
  static const Color _success      = Color(0xFF10B981); // Emerald-500
  static const Color _warning      = Color(0xFFF59E0B); // Amber-500
  static const Color _error        = Color(0xFFEF4444); // Red-500
  static const Color _surfaceLight = Color(0xFFF8F9FF);
  static const Color _cardLight    = Color(0xFFFFFFFF);

  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primary,
          brightness: Brightness.light,
          primary: _primary,
          secondary: _secondary,
          error: _error,
          surface: _surfaceLight,
        ),
        scaffoldBackgroundColor: _surfaceLight,
        cardTheme: CardThemeData(
          color: _cardLight,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFFE5E7EB), width: 1),
          ),
          margin: const EdgeInsets.symmetric(vertical: 6),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: _surfaceLight,
          foregroundColor: Color(0xFF111827),
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFF111827),
            letterSpacing: -0.5,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Colors.white,
          selectedItemColor: _primary,
          unselectedItemColor: Color(0xFF9CA3AF),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
          selectedLabelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 11),
          unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w500, fontSize: 11),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFFF9FAFB),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: _error),
          ),
          hintStyle: const TextStyle(color: Color(0xFF9CA3AF), fontSize: 14),
          labelStyle: const TextStyle(color: Color(0xFF6B7280), fontSize: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: _primary,
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            textStyle: const TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.3,
            ),
          ),
        ),
        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: _primary,
            textStyle: const TextStyle(fontWeight: FontWeight.w600),
          ),
        ),
        chipTheme: ChipThemeData(
          backgroundColor: const Color(0xFFF3F4F6),
          selectedColor: const Color(0xFFEEF2FF),
          labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
          side: BorderSide.none,
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: _primary,
          foregroundColor: Colors.white,
          elevation: 4,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0xFFF3F4F6),
          thickness: 1,
          space: 1,
        ),
        textTheme: const TextTheme(
          displayLarge:  TextStyle(fontSize: 32, fontWeight: FontWeight.w800, letterSpacing: -1, color: Color(0xFF111827)),
          headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, letterSpacing: -0.5, color: Color(0xFF111827)),
          headlineMedium:TextStyle(fontSize: 20, fontWeight: FontWeight.w700, letterSpacing: -0.3, color: Color(0xFF111827)),
          titleLarge:    TextStyle(fontSize: 17, fontWeight: FontWeight.w700, color: Color(0xFF111827)),
          titleMedium:   TextStyle(fontSize: 15, fontWeight: FontWeight.w600, color: Color(0xFF1F2937)),
          bodyLarge:     TextStyle(fontSize: 15, fontWeight: FontWeight.w400, color: Color(0xFF374151)),
          bodyMedium:    TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: Color(0xFF374151)),
          bodySmall:     TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: Color(0xFF6B7280)),
          labelLarge:    TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFF374151)),
          labelSmall:    TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: Color(0xFF9CA3AF), letterSpacing: 0.3),
        ),
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _primary,
          brightness: Brightness.dark,
          primary: const Color(0xFF818CF8),
          secondary: const Color(0xFFA78BFA),
          error: _error,
          surface: const Color(0xFF111827),
        ),
        scaffoldBackgroundColor: const Color(0xFF0F172A),
        cardTheme: CardThemeData(
          color: const Color(0xFF1E293B),
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
            side: const BorderSide(color: Color(0xFF334155), width: 1),
          ),
          margin: const EdgeInsets.symmetric(vertical: 6),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF0F172A),
          foregroundColor: Color(0xFFF1F5F9),
          elevation: 0,
          centerTitle: false,
          titleTextStyle: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Color(0xFFF1F5F9),
            letterSpacing: -0.5,
          ),
        ),
        bottomNavigationBarTheme: const BottomNavigationBarThemeData(
          backgroundColor: Color(0xFF1E293B),
          selectedItemColor: Color(0xFF818CF8),
          unselectedItemColor: Color(0xFF64748B),
          type: BottomNavigationBarType.fixed,
          elevation: 0,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF1E293B),
          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF334155)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF334155)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFF818CF8), width: 2),
          ),
          hintStyle: const TextStyle(color: Color(0xFF64748B), fontSize: 14),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF818CF8),
            foregroundColor: Colors.white,
            elevation: 0,
            minimumSize: const Size(double.infinity, 50),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
          ),
        ),
        floatingActionButtonTheme: FloatingActionButtonThemeData(
          backgroundColor: const Color(0xFF818CF8),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        dividerTheme: const DividerThemeData(
          color: Color(0xFF1E293B),
          thickness: 1,
          space: 1,
        ),
      );

  // ── Semantic colours (accessible statically) ──────────────────────────────
  static const Color primaryColor  = _primary;
  static const Color successColor  = _success;
  static const Color warningColor  = _warning;
  static const Color errorColor    = _error;

  static Color priorityColor(String priority) {
    switch (priority.toLowerCase()) {
      case 'high':   return _error;
      case 'medium': return _warning;
      case 'low':    return _success;
      default:       return _warning;
    }
  }

  static Color statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'done':       return _success;
      case 'inprogress': return _primary;
      case 'todo':       return const Color(0xFF9CA3AF);
      default:           return const Color(0xFF9CA3AF);
    }
  }
}
