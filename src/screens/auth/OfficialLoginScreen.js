import { useContext, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import { validators } from "../../utils/validators";

const DEMO_ADMIN_EMAIL = process.env.EXPO_PUBLIC_DEMO_ADMIN_EMAIL;
const DEMO_ADMIN_PASSWORD = process.env.EXPO_PUBLIC_DEMO_ADMIN_PASSWORD;

export const OfficialLoginScreen = ({ navigation }) => {
  const auth = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeInput, setActiveInput] = useState(null);

  const handleLogin = async () => {
    try {
      const trimmedEmail = email.trim();

      if (!trimmedEmail || !password.trim()) {
        Alert.alert("Missing Information", "Please enter your email and password.");
        return;
      }

      if (!validators.isValidEmail(trimmedEmail)) {
        Alert.alert("Invalid Email", "Please enter a valid government email address.");
        return;
      }

      if (password.length < 8) {
        Alert.alert("Invalid Password", "Password must be at least 8 characters.");
        return;
      }

      setLoading(true);
      await auth.loginOfficial(trimmedEmail, password);
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Unable to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Title Section */}
          <View style={styles.titleSection}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="shield-checkmark" size={14} color="#7c3aed" />
                <Text style={styles.badgeText}>Official Access</Text>
              </View>
            </View>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>
              Sign in to access the maritime administration portal
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Government email</Text>
              <View style={[
                styles.inputWrapper,
                activeInput === "email" && styles.inputWrapperActive,
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={activeInput === "email" ? "#1a56db" : "#9ca3af"} 
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@gov.in"
                  placeholderTextColor="#9ca3af"
                  editable={!loading}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  onFocus={() => setActiveInput("email")}
                  onBlur={() => setActiveInput(null)}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity disabled={loading}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <View style={[
                styles.inputWrapper,
                activeInput === "password" && styles.inputWrapperActive,
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={activeInput === "password" ? "#1a56db" : "#9ca3af"} 
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  autoCapitalize="none"
                  autoComplete="password"
                  onFocus={() => setActiveInput("password")}
                  onBlur={() => setActiveInput(null)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                  disabled={loading}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9ca3af" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonLoading]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.submitButtonText}>Sign in</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Demo Credentials (optional, only shown if set in .env) */}
          {DEMO_ADMIN_EMAIL && DEMO_ADMIN_PASSWORD ? (
            <View style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                <Text style={styles.demoTitle}>Demo credentials</Text>
              </View>
              <View style={styles.demoContent}>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Email:</Text>
                  <Text style={styles.demoValue}>{DEMO_ADMIN_EMAIL}</Text>
                </View>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Password:</Text>
                  <Text style={styles.demoValue}>{DEMO_ADMIN_PASSWORD}</Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Not a government official?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("CitizenLogin")}
              disabled={loading}
            >
              <Text style={styles.footerLink}>Citizen portal</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    marginBottom: 32,
  },
  badgeRow: {
    marginBottom: 16,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#7c3aed",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    lineHeight: 22,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 4,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a56db",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapperActive: {
    borderColor: "#1a56db",
    backgroundColor: "#f0f5ff",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    padding: 0,
  },
  submitButton: {
    backgroundColor: "#1a56db",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    shadowColor: "#1a56db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonLoading: {
    opacity: 0.8,
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  demoCard: {
    marginTop: 28,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  demoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  demoContent: {
    gap: 6,
  },
  demoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  demoLabel: {
    fontSize: 13,
    color: "#9ca3af",
    width: 70,
  },
  demoValue: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: "#6b7280",
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a56db",
  },
});
