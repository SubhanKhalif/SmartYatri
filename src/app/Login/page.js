"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Forgatepass from "@/components/forgatepass/forgatepass"; // adjust path as per your structure

// Helper for API calls
async function loginUser({ username, password }) {
  // This helper is now unused by handleLogin, but left for possible future use.
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

// Helper to determine if a field has value or is focused
function getLabelClass(value, isFocused) {
  // Always float the label if field has value or is focused
  return [
    "absolute left-0 text-gray-500 text-base font-semibold transition-all duration-300 pointer-events-none",
    (isFocused || (value && value.length > 0))
      ? "-top-5 text-xs text-blue-600 font-bold"
      : "top-3 text-base"
  ].join(" ");
}

export default function LoginPage() {
  // Remove isSignup and signup-related fields/states
  const [form, setForm] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForgatepass, setShowForgatepass] = useState(false);
  const router = useRouter();

  // Only track focus for username and password
  const [focus, setFocus] = useState({
    username: false,
    password: false,
  });

  // Refs for autofill detection (only username and password)
  const usernameRef = useRef(null);
  const passwordRef = useRef(null);

  // Autofill detection effect using onAnimationStart hack
  useEffect(() => {
    function handleAutoFill(e) {
      if (e.animationName === "onAutoFillStart") {
        const target = e.target;
        setFocus((prev) => ({ ...prev, [target.name]: true }));
        setForm((prev) => ({ ...prev, [target.name]: target.value }));
      }
    }

    const inputs = [usernameRef, passwordRef];
    inputs.forEach(ref => {
      if (ref.current) {
        ref.current.addEventListener('animationstart', handleAutoFill);
        // Also check initial value (for refresh)
        if (ref.current.value) {
          setFocus((prev) => ({ ...prev, [ref.current.name]: true }));
          setForm((prev) => ({ ...prev, [ref.current.name]: ref.current.value }));
        }
      }
    });

    return () => {
      inputs.forEach(ref => {
        if (ref.current) {
          ref.current.removeEventListener('animationstart', handleAutoFill);
        }
      });
    };
  }, []);

  const handleFocus = (e) => {
    setFocus((prev) => ({ ...prev, [e.target.name]: true }));
  };
  const handleBlur = (e) => {
    setFocus((prev) => ({ ...prev, [e.target.name]: false }));
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // handleLogin remains, but any signup navigation removed
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // include credentials if your backend uses cookies/sessions
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username: form.username, password: form.password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error("Failed to parse JSON from /api/auth/login", jsonErr);
        setError("Invalid server response.");
        setLoading(false);
        return;
      }

      console.log("login response:", { status: res.status, ok: res.ok, data });

      if (!res.ok || !data.success) {
        setError(data?.error || "Login failed. Check credentials.");
        setLoading(false);
        return;
      }

      setSuccess("Login successful!");

      // User navigation (unchanged but cleaned up)
      const user = data.user ?? data;
      const getId = (obj, keys) => {
        for (const k of keys) {
          if (obj == null) continue;
          const val = obj[k];
          if (val !== undefined && val !== null && String(val).trim() !== "") return val;
        }
        return null;
      };

      const storeId = getId(user, ["storeId", "store_id", "store", "store?.id"]);
      const storeIdAlt = user?.store?.id ?? user?.store?._id ?? null;
      const warehouseId = getId(user, ["warehouseId", "warehouse_id", "warehouse", "warehouse?.id"]);
      const warehouseIdAlt = user?.warehouse?.id ?? user?.warehouse?._id ?? null;

      const finalStoreId = storeId || storeIdAlt;
      const finalWarehouseId = warehouseId || warehouseIdAlt;

      console.log({ finalStoreId, finalWarehouseId });

      // If store exists, go to /Store, else / (root)
      if (finalStoreId !== null) {
        router.replace("/Store");
        return;
      }
      if (finalWarehouseId !== null) {
        router.replace("/");
        return;
      }
      router.replace("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Signup navigation handler
  const handleGoToSignup = () => {
    // Path relative to your app structure
    // If using Next.js 13+ app router structure, this is sufficient
    router.push("/Signup");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-cyan-100 py-0 px-2 overflow-hidden">
      <div
        className={`w-full max-w-md bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-blue-200 p-10 transition-all duration-700`}
      >
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-600 to-cyan-500 mb-10 text-center tracking-tight drop-shadow-lg animate-fade-in">
          Login
        </h1>
        <form
          onSubmit={handleLogin}
          className="space-y-7"
          autoComplete="on"
        >
          <div className="grid grid-cols-1 gap-6">
            {/* Username */}
            <div className="relative group">
              <input
                ref={usernameRef}
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="peer w-full border-0 border-b-2 border-blue-300 focus:border-blue-600 bg-transparent px-0 py-3 text-lg font-medium text-gray-800 placeholder-transparent focus:outline-none transition-all duration-300 autofill:bg-transparent"
                required
                autoComplete="username"
                disabled={loading}
                placeholder=" "
              />
              <label
                htmlFor="username"
                className={getLabelClass(form.username, focus.username)}
              >
                Username <span className="text-red-500">*</span>
              </label>
            </div>
            {/* Password */}
            <div className="relative group">
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="peer w-full border-0 border-b-2 border-blue-300 focus:border-blue-600 bg-transparent px-0 py-3 text-lg font-medium text-gray-800 placeholder-transparent focus:outline-none transition-all duration-300 autofill:bg-transparent"
                required
                autoComplete="current-password"
                disabled={loading}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={getLabelClass(form.password, focus.password)}
              >
                Password <span className="text-red-500">*</span>
              </label>
              {/* Forgatepass Component trigger */}
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  className="text-blue-500 text-sm font-semibold hover:underline px-1"
                  onClick={() => setShowForgatepass(true)}
                  tabIndex={0}
                  style={{ background: "none", border: "none" }}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>
          {error && (
            <div className="animate-fade-in-down text-red-600 font-semibold bg-red-100/80 border border-red-200 rounded-lg px-4 py-2 mt-2 text-center shadow-md transition-all duration-300">
              {error}
            </div>
          )}
          {success && (
            <div className="animate-fade-in-up text-green-700 font-semibold bg-green-100/80 border border-green-200 rounded-lg px-4 py-2 mt-2 text-center shadow-md transition-all duration-300">
              {success}
            </div>
          )}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-extrabold text-lg transition-all duration-300 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500 text-white shadow-xl hover:from-blue-700 hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                Logging in...
              </span>
            ) : "Login"}
          </button>
        </form>
        {/* Signup navigation button */}
        <div className="flex justify-center mt-8">
          <span className="text-gray-700 text-base">Don&apos;t have an account?</span>
          <button
            type="button"
            className="ml-2 text-blue-600 text-base font-bold hover:underline focus:outline-none transition-colors duration-150"
            onClick={handleGoToSignup}
            disabled={loading}
          >
            Sign up
          </button>
        </div>
      </div>
      {/* Forgatepass Modal */}
      {showForgatepass && (
        <Forgatepass open={showForgatepass} onClose={() => setShowForgatepass(false)} />
      )}
      {/* Animations (TailwindCSS custom keyframes or use animate.css) */}
      <style jsx global>{`
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(16px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-16px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(32px);}
          100% { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-down { animation: fade-in-down 0.5s cubic-bezier(.4,0,.2,1) both; }
        .animate-fade-in-up { animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1) both; }
        html, body, #__next {
          height: 100%;
          overflow: hidden;
        }
        /* Autofill fix for floating label */
        input:-webkit-autofill,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
          -webkit-text-fill-color: #1e293b !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        /* Autofill animation hack for detection */
        input:-webkit-autofill {
          animation-name: onAutoFillStart;
          animation-fill-mode: both;
        }
        @keyframes onAutoFillStart {
          from { }
          to { }
        }
      `}</style>
    </div>
  );
}
