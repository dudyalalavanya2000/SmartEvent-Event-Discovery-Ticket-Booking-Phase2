
import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");
      const data = response.data;

      setUsers(Array.isArray(data) ? data : data.items || data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateRole = async (userId, role) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user role.");
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user.id}/status`, {
        is_active: !user.is_active,
      });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update user status.");
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Manage Users</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={fetchUsers}>Refresh</button>

      <div style={{ overflowX: "auto", marginTop: "16px" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                ID
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                Name
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                Email
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                Role
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                Status
              </th>
              <th style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  {user.id}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  {user.full_name || user.name || "—"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  {user.email || "—"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <select
                    value={user.role || "USER"}
                    onChange={(e) => updateRole(user.id, e.target.value)}
                  >
                    <option value="USER">USER</option>
                    <option value="ORGANIZER">ORGANIZER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  {user.is_active ? "Active" : "Inactive"}
                </td>
                <td style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
                  <button onClick={() => toggleStatus(user)}>
                    {user.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "16px" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}