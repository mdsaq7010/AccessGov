import { supabase } from "./supabase";

const REQUEST_TIMEOUT_MS = 12000;
const DEMO_OTP_KEY = "shipgov_demo_pending_otp";
const IS_DEMO_MODE = typeof __DEV__ !== "undefined" ? __DEV__ : false;
let inMemoryPendingOtp = null;
const DEMO_OFFICIALS = (() => {
  const records = {};

  const adminEmail = process.env.EXPO_PUBLIC_DEMO_ADMIN_EMAIL;
  const adminPassword = process.env.EXPO_PUBLIC_DEMO_ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    records[adminEmail.toLowerCase()] = {
      id: "11111111-1111-4111-8111-111111111111",
      password: adminPassword,
      fullName: "Admin User",
      role: "admin",
      department: "Health Department",
      departmentId: "dept-1",
    };
  }

  const officerEmail = process.env.EXPO_PUBLIC_DEMO_OFFICER_EMAIL;
  const officerPassword = process.env.EXPO_PUBLIC_DEMO_OFFICER_PASSWORD;
  if (officerEmail && officerPassword) {
    records[officerEmail.toLowerCase()] = {
      id: "22222222-2222-4222-8222-222222222222",
      password: officerPassword,
      fullName: "Officer User",
      role: "officer",
      department: "Health Department",
      departmentId: "dept-1",
    };
  }

  return records;
})();

const withTimeout = async (promise, label) => {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(
        new Error(
          `${label} timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds. Check your Supabase connection, browser network access, and table policies.`,
        ),
      );
    }, REQUEST_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
};

const encodeToken = (payload) => {
  const serialized = JSON.stringify(payload);

  if (typeof globalThis.btoa === "function") {
    return globalThis.btoa(serialized);
  }

  if (typeof globalThis.Buffer !== "undefined") {
    return globalThis.Buffer.from(serialized).toString("base64");
  }

  // Fallback for runtimes without btoa/Buffer (e.g. some native JS engines)
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let output = "";
  let i = 0;

  while (i < serialized.length) {
    const c1 = serialized.charCodeAt(i++);
    const c2 = serialized.charCodeAt(i++);
    const c3 = serialized.charCodeAt(i++);

    const e1 = c1 >> 2;
    const e2 = ((c1 & 3) << 4) | (c2 >> 4);
    const e3 = Number.isNaN(c2) ? 64 : ((c2 & 15) << 2) | (c3 >> 6);
    const e4 = Number.isNaN(c3) ? 64 : c3 & 63;

    output +=
      chars.charAt(e1) + chars.charAt(e2) + chars.charAt(e3) + chars.charAt(e4);
  }

  return output;
};

const isAuthBackendUnavailable = (error) => {
  if (!error) {
    return false;
  }

  const message = `${error.message || ""} ${error.details || ""}`.toLowerCase();
  return (
    error.status === 404 ||
    error.status === 406 ||
    message.includes("relation") ||
    message.includes("does not exist") ||
    message.includes("not acceptable") ||
    message.includes("row level security") ||
    message.includes("permission")
  );
};

const savePendingOtp = (payload) => {
  inMemoryPendingOtp = payload;

  if (typeof globalThis.localStorage === "undefined") {
    return;
  }

  globalThis.localStorage.setItem(DEMO_OTP_KEY, JSON.stringify(payload));
};

const clearPendingOtp = () => {
  inMemoryPendingOtp = null;

  if (typeof globalThis.localStorage === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(DEMO_OTP_KEY);
};

const buildDemoOfficial = (email) => {
  const official = DEMO_OFFICIALS[email];
  const token = encodeToken({
    userId: official.id,
    userType: "official",
    role: official.role,
    departmentId: official.departmentId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 3600,
  });

  return {
    success: true,
    token,
    userId: official.id,
    userType: "official",
    userData: {
      id: official.id,
      fullName: official.fullName,
      email,
      role: official.role,
      department: official.department,
      departmentId: official.departmentId,
    },
  };
};

export const authAPI = {
  async requestCitizenOTP(emailOrPhone, method) {
    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const payload = {
        emailOrPhone,
        method,
        otp,
        expiresAt: Date.now() + 10 * 60000,
      };

      savePendingOtp(payload);

      return {
        success: true,
        message: "OTP sent successfully",
        otp,
        _tempOtp: otp,
        _tempEmail: emailOrPhone,
        _tempMethod: method,
      };
    } catch (error) {
      console.error("Error requesting OTP:", error);
      throw error;
    }
  },

  async verifyCitizenOTP(emailOrPhone, otpCode, fullName) {
    try {
      if (!/^\d{6}$/.test(otpCode)) {
        throw new Error("Invalid OTP format. Please enter 6 digits.");
      }

      const isDemoBypassOtp = otpCode === "123456" || otpCode === "000000";
      if (!(IS_DEMO_MODE && isDemoBypassOtp)) {
        const message = IS_DEMO_MODE
          ? "Invalid OTP. Demo mode accepts 123456 or 000000."
          : "Invalid OTP";
        const stored =
          typeof globalThis.localStorage !== "undefined"
            ? globalThis.localStorage.getItem(DEMO_OTP_KEY)
            : null;
        const pendingOtp = stored ? JSON.parse(stored) : inMemoryPendingOtp;

        if (!pendingOtp) {
          throw new Error(message);
        }

        if (
          pendingOtp.emailOrPhone !== emailOrPhone ||
          pendingOtp.otp !== otpCode ||
          pendingOtp.expiresAt <= Date.now()
        ) {
          throw new Error(message);
        }
      }

      const citizenId = `citizen-${Date.now()}`;
      const token = encodeToken({
        userId: citizenId,
        userType: "citizen",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 3600,
      });

      clearPendingOtp();

      return {
        success: true,
        token,
        userId: citizenId,
        userType: "citizen",
        userData: {
          id: citizenId,
          fullName,
          email: emailOrPhone.includes("@") ? emailOrPhone : null,
          phone: emailOrPhone.includes("@") ? null : emailOrPhone,
        },
      };
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  },

  async loginOfficial(email, password) {
    try {
      const { data: official, error: fetchError } = await withTimeout(
        supabase
          .from("officials")
          .select("*, departments(name)")
          .eq("email", email)
          .maybeSingle(),
        "Load official account",
      );

      if (fetchError) {
        throw fetchError;
      }

      if (!official) {
        if (IS_DEMO_MODE) {
          const demoOfficial = DEMO_OFFICIALS[email];
          if (demoOfficial && demoOfficial.password === password) {
            return buildDemoOfficial(email);
          }
        }
        throw new Error("Invalid email or password");
      }

      if (!official.is_active) {
        throw new Error("Your account is inactive");
      }

      if (official.password_hash !== password) {
        const usesSanitizedSeedPassword =
          official.password_hash === "SET_SECURE_PASSWORD_HASH";
        const demoOfficial = DEMO_OFFICIALS[email.toLowerCase()];

        if (
          !(
            usesSanitizedSeedPassword &&
            demoOfficial &&
            demoOfficial.password === password
          )
        ) {
          throw new Error("Invalid email or password");
        }
      }

      const token = encodeToken({
        userId: official.id,
        userType: "official",
        role: official.role,
        departmentId: official.department_id,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 3600,
      });

      const { error: sessionError } = await withTimeout(
        supabase.from("sessions").insert([
          {
            user_id: official.id,
            user_type: "official",
            auth_token: token,
            expires_at: new Date(Date.now() + 7 * 3600 * 1000).toISOString(),
          },
        ]),
        "Create official session",
      );

      if (sessionError) {
        throw sessionError;
      }

      const { error: updateOfficialError } = await withTimeout(
        supabase
          .from("officials")
          .update({ last_login: new Date().toISOString() })
          .eq("id", official.id),
        "Update official login timestamp",
      );

      if (updateOfficialError) {
        throw updateOfficialError;
      }

      return {
        success: true,
        token,
        userId: official.id,
        userType: "official",
        userData: {
          id: official.id,
          fullName: official.full_name,
          email: official.email,
          role: official.role,
          department: official.departments?.name || "Department",
          departmentId: official.department_id,
        },
      };
    } catch (error) {
      if (IS_DEMO_MODE && isAuthBackendUnavailable(error)) {
        const demoOfficial = DEMO_OFFICIALS[email];
        if (demoOfficial && demoOfficial.password === password) {
          return buildDemoOfficial(email);
        }
      }

      console.error("Error logging in official:", error);
      throw error;
    }
  },

  async logout(userId, userType) {
    try {
      const { error } = await withTimeout(
        supabase
          .from("sessions")
          .delete()
          .eq("user_id", userId)
          .eq("user_type", userType),
        "Logout",
      );

      if (error && !isAuthBackendUnavailable(error)) {
        throw error;
      }

      clearPendingOtp();
      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      throw error;
    }
  },
};
