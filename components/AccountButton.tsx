"use client";

import { FormEvent, useState } from "react";
import { LogIn, LogOut, Mail, UserCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "./AuthProvider";
import { cn } from "@/lib/utils";

export function AccountButton() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, logout } =
    useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      setIsOpen(false);
      setEmail("");
      setPassword("");
    } catch {
      setError("No pudimos completar el acceso. Revisa tus datos e intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
      setIsOpen(false);
    } catch {
      setError("No pudimos conectar con Google. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        disabled={loading}
        aria-label="Cuenta"
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center",
          user ? "bg-accent-blue/20 text-accent-blue" : "bg-white/10 text-white"
        )}
      >
        <UserCircle className="w-5 h-5" strokeWidth={1.5} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-end justify-center"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 280 }}
              className="w-full max-w-md bg-neutral-900 rounded-t-3xl px-6 pt-5 pb-8 border-t border-white/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-lg font-bold">Cuenta</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
                  aria-label="Cerrar"
                >
                  <X className="w-4 h-4 text-white" strokeWidth={1.5} />
                </button>
              </div>

              {user ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-white font-semibold truncate">
                      {user.displayName || user.email || "Usuario GYMBEND"}
                    </p>
                    <p className="text-gray-subtitle text-sm mt-1">
                      Tus rutinas se sincronizan con Firebase.
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-4 rounded-3xl bg-white/10 text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Cerrar sesion
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={handleGoogle}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-3xl bg-white text-black font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={1.5} />
                    Continuar con Google
                  </button>

                  <form onSubmit={handleEmailSubmit} className="space-y-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="Email"
                      className="w-full bg-white/5 text-white placeholder-gray-subtitle text-sm rounded-2xl py-3 px-4 outline-none focus:bg-white/10 transition-colors"
                      required
                    />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Password"
                      className="w-full bg-white/5 text-white placeholder-gray-subtitle text-sm rounded-2xl py-3 px-4 outline-none focus:bg-white/10 transition-colors"
                      minLength={6}
                      required
                    />
                    {error && <p className="text-accent-red text-xs">{error}</p>}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 rounded-3xl bg-accent-blue text-white font-bold uppercase tracking-wide text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <Mail className="w-4 h-4" strokeWidth={1.5} />
                      {mode === "signin" ? "Entrar con email" : "Crear cuenta"}
                    </button>
                  </form>

                  <button
                    onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                    className="w-full text-gray-subtitle text-sm py-2"
                  >
                    {mode === "signin"
                      ? "Crear una cuenta con email"
                      : "Ya tengo cuenta"}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
