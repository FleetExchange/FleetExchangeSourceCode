"use client";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { CheckCircle, XCircle, Clock, Mail, User, Shield } from "lucide-react";

const AdminUsersPage = () => {
  // Protect this page - only admins can access
  const { isLoaded } = useRoleAuth("admin");

  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [searchTerm, setSearchTerm] = useState("");

  // Get all users
  const allUsers = useQuery(api.users.getAllUsers);

  // Mutations for approval actions
  const updateUserRole = useMutation(api.users.updateUserRole);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Filter users based on selected filter and search term
  const filteredUsers =
    allUsers?.filter((user) => {
      const matchesSearch =
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase());

      switch (filter) {
        case "pending":
          return !user.isApproved && matchesSearch;
        case "approved":
          return user.isApproved && matchesSearch;
        case "all":
          return matchesSearch;
        default:
          return matchesSearch;
      }
    }) || [];

  const handleApprove = async (
    userId: string,
    role: "client" | "transporter"
  ) => {
    try {
      await updateUserRole({
        userId,
        role,
        isApproved: true,
      });
    } catch (error) {
      console.error("Failed to approve user:", error);
    }
  };

  const handleReject = async (
    userId: string,
    role: "client" | "transporter"
  ) => {
    try {
      await updateUserRole({
        userId,
        role,
        isApproved: false,
      });
    } catch (error) {
      console.error("Failed to reject user:", error);
    }
  };

  const pendingCount = allUsers?.filter((user) => !user.isApproved).length || 0;
  const approvedCount = allUsers?.filter((user) => user.isApproved).length || 0;

  return (
    <div className="min-h-screen bg-base-200 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">
            User Management
          </h1>
          <p className="text-base-content/70">
            Approve or manage user accounts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Pending Approval</p>
                <p className="text-2xl font-bold text-warning">
                  {pendingCount}
                </p>
              </div>
              <Clock className="w-8 h-8 text-warning" />
            </div>
          </div>

          <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Approved Users</p>
                <p className="text-2xl font-bold text-success">
                  {approvedCount}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
          </div>

          <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-base-content/70">Total Users</p>
                <p className="text-2xl font-bold text-base-content">
                  {allUsers?.length || 0}
                </p>
              </div>
              <User className="w-8 h-8 text-base-content" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-base-100 rounded-lg p-6 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Filter Tabs */}
            <div className="tabs tabs-boxed">
              <button
                className={`tab ${filter === "pending" ? "tab-active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending ({pendingCount})
              </button>
              <button
                className={`tab ${filter === "approved" ? "tab-active" : ""}`}
                onClick={() => setFilter("approved")}
              >
                Approved ({approvedCount})
              </button>
              <button
                className={`tab ${filter === "all" ? "tab-active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All Users
              </button>
            </div>

            {/* Search */}
            <div className="form-control">
              <input
                type="text"
                placeholder="Search users..."
                className="input input-bordered"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    {/* User Info */}
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="bg-neutral text-neutral-content rounded-full w-12">
                            <span className="text-xl">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-sm opacity-50 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="badge badge-outline capitalize">
                          {user.role}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      {user.isApproved ? (
                        <span className="badge badge-success gap-2">
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </span>
                      ) : (
                        <span className="badge badge-warning gap-2">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>

                    {/* Actions */}
                    <td>
                      {!user.isApproved && user.role !== "admin" ? (
                        <div className="flex gap-2">
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() =>
                              handleApprove(
                                user.clerkId,
                                user.role as "client" | "transporter"
                              )
                            }
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() =>
                              handleReject(
                                user.clerkId,
                                user.role as "client" | "transporter"
                              )
                            }
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      ) : user.role === "admin" ? (
                        <span className="text-info text-sm">Admin User</span>
                      ) : (
                        <span className="text-success text-sm">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <User className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
              <h3 className="font-medium text-base-content/70 mb-2">
                No users found
              </h3>
              <p className="text-sm text-base-content/50">
                {filter === "pending"
                  ? "No users are currently pending approval"
                  : "Try adjusting your search or filter criteria"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
