
"use client";

import { useState } from "react";
import {
  Camera,
  Mail,
  MapPin,
  ShieldCheck,
  Pencil,
  Lock,
  Save,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

export default function AdminProfilePage() {
  const [editing, setEditing] = useState(false);
  const [passwordModal, setPasswordModal] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [profile, setProfile] = useState({
    name: "Admin User",
    email: "admin@example.com",
    phone: "+92 300 1234567",
    location: "Bahawalpur, Pakistan",
    role: "Administrator",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });

    setPasswordError("");
    setPasswordSuccess("");
  };

  const openPasswordModal = () => {
    setPasswordModal(true);
    setPasswordError("");
    setPasswordSuccess("");
  };

  const closePasswordModal = () => {
    setPasswordModal(false);
    setPasswords({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError("");
    setPasswordSuccess("");
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
  };

  const handlePasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (
      !passwords.currentPassword ||
      !passwords.newPassword ||
      !passwords.confirmPassword
    ) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (passwords.newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    if (passwords.currentPassword === passwords.newPassword) {
      setPasswordError(
        "New password must be different from your current password."
      );
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/auth/password",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            currentPassword: passwords.currentPassword,
            newPassword: passwords.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(
          data?.message || "Unable to change password."
        );
        return;
      }

      setPasswordSuccess(
        data?.message || "Password changed successfully."
      );

      setTimeout(() => {
        closePasswordModal();
      }, 1500);
    } catch {
      setPasswordError(
        "Unable to connect to the server. Please try again."
      );
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-page-container">
        <div className="profile-page-header">
          <div>
            <span className="profile-label">ACCOUNT</span>
            <h1>Admin Profile</h1>
            <p>
              Manage your personal information and account settings.
            </p>
          </div>

          <button
            className="profile-edit-btn"
            onClick={() => setEditing(!editing)}
          >
            <Pencil size={17} />
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        <div className="profile-layout">
          <div className="profile-card profile-sidebar-card">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                <span>AU</span>
              </div>

              {editing && (
                <button className="profile-camera">
                  <Camera size={16} />
                </button>
              )}
            </div>

            <h2>{profile.name}</h2>

            <p className="profile-role">{profile.role}</p>

            <div className="profile-verified">
              <ShieldCheck size={16} />
              Verified Admin
            </div>

            <div className="profile-divider" />

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <Mail size={16} />
              </div>

              <div>
                <span>Email</span>
                <strong>{profile.email}</strong>
              </div>
            </div>

            <div className="profile-info-item">
              <div className="profile-info-icon">
                <MapPin size={16} />
              </div>

              <div>
                <span>Location</span>
                <strong>{profile.location}</strong>
              </div>
            </div>
          </div>

          <div className="profile-main">
            <div className="profile-card profile-details-card">
              <div className="profile-section-header">
                <div>
                  <h2>Personal Information</h2>
                  <p>Update your account information.</p>
                </div>
              </div>

              <div className="profile-form-grid">
                <div className="profile-field">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <input
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    disabled={!editing}
                    type="email"
                  />
                </div>

                <div className="profile-field">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>

                <div className="profile-field">
                  <label>Location</label>
                  <input
                    name="location"
                    value={profile.location}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              </div>

              {editing && (
                <div className="profile-save-area">
                  <button
                    className="profile-save-btn"
                    onClick={() => setEditing(false)}
                  >
                    <Save size={17} />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="profile-card profile-security">
              <div className="profile-security-icon">
                <Lock size={20} />
              </div>

              <div className="profile-security-content">
                <h3>Password & Security</h3>

                <p>
                  Keep your account secure by using a strong password and
                  updating it regularly.
                </p>
              </div>

              <button
                className="profile-password-btn"
                onClick={openPasswordModal}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {passwordModal && (
        <div
          className="password-modal-overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closePasswordModal();
            }
          }}
        >
          <div className="password-modal">
            <div className="password-modal-header">
              <div>
                <div className="password-modal-icon">
                  <Lock size={20} />
                </div>

                <h2>Change Password</h2>

                <p>
                  Update your password to keep your admin account secure.
                </p>
              </div>

              <button
                className="password-modal-close"
                onClick={closePasswordModal}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="password-form"
              onSubmit={handlePasswordSubmit}
            >
              <div className="password-field">
                <label>Current Password</label>

                <div className="password-input-wrapper">
                  <input
                    className="password-input"
                    name="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowCurrent(!showCurrent)}
                  >
                    {showCurrent ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="password-field">
                <label>New Password</label>

                <div className="password-input-wrapper">
                  <input
                    className="password-input"
                    name="newPassword"
                    type={showNew ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowNew(!showNew)}
                  >
                    {showNew ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <span className="password-hint">
                  Password must be at least 8 characters.
                </span>
              </div>

              <div className="password-field">
                <label>Confirm New Password</label>

                <div className="password-input-wrapper">
                  <input
                    className="password-input"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="password-error">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="password-success">
                  {passwordSuccess}
                </div>
              )}

              <div className="password-actions">
                <button
                  type="button"
                  className="password-cancel-btn"
                  onClick={closePasswordModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="password-submit-btn"
                >
                  Change Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
