"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { changePassword } from "@/app/team/actions";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) { setError("New passwords do not match."); return; }
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update password.");
    }
  }

  return <main className="auth-page"><section className="auth-panel"><p className="eyebrow">GritGrid / Security</p><h1>Secure your account.</h1><p>Create a new password before continuing.</p>{success ? <><p className="form-success" role="status">Password updated successfully.</p><button className="button button-primary" onClick={() => router.push("/team")}>Continue to Team Portal →</button></> : <form className="auth-form" onSubmit={submit}><label>Current temporary password<input required type="password" autoComplete="current-password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} /></label><label>New password<input required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} /></label><label>Confirm new password<input required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit">Update password</button></form>}</section></main>;
}
