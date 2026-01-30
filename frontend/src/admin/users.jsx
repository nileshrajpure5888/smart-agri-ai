import { useEffect, useMemo, useState } from "react";
import api from "../api";
import "./users.css";

export default function Users() {

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");

  const [page, setPage] = useState(1);
  const limit = 8;


  /* ================= LOAD ================= */

  useEffect(() => {
    loadUsers();
  }, []);


  const loadUsers = async () => {

    try {

      setLoading(true);

      const res = await api.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      setUsers(res.data);

    } catch {

      alert("Failed to load users");

    } finally {

      setLoading(false);

    }
  };


  /* ================= FILTER ================= */

  const filteredUsers = useMemo(() => {

    return users
      .filter((u) =>
        (u.name + u.email)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .filter((u) =>
        role === "all" ? true : u.role === role
      );

  }, [users, search, role]);


  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredUsers.length / limit);

  const paginated = filteredUsers.slice(
    (page - 1) * limit,
    page * limit
  );


  /* ================= DELETE ================= */

  const deleteUser = async (id) => {

    if (!window.confirm("Delete this user?")) return;

    try {

      await api.delete(`/api/admin/users/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      loadUsers();

    } catch {

      alert("Delete failed ❌");

    }
  };


  /* ================= UI ================= */

  return (
    <div className="admin-users">


      {/* HEADER */}

      <div className="users-header">

        <h2>👥 User Management</h2>

        <span className="count">
          Total: {filteredUsers.length}
        </span>

      </div>


      {/* CONTROLS */}

      <div className="controls">

        <input
          placeholder="🔍 Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />


        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="editor">Editor</option>
        </select>

      </div>


      {/* TABLE */}

      <div className="table-card">


        {loading ? (

          <div className="skeleton">
            Loading users...
          </div>

        ) : (

          <table>

            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Action</th>
              </tr>
            </thead>


            <tbody>

              {paginated.map((u, i) => (

                <tr key={u._id}>

                  <td>{(page - 1) * limit + i + 1}</td>

                  <td className="user-name">
                    {u.name}
                  </td>

                  <td>{u.email}</td>


                  <td>
                    <span className={`role ${u.role}`}>
                      {u.role}
                    </span>
                  </td>


                  <td>

                    <button
                      className="btn-delete"
                      onClick={() => deleteUser(u._id)}
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>


      {/* PAGINATION */}

      {totalPages > 1 && (

        <div className="pagination">

          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ◀
          </button>


          <span>
            Page {page} / {totalPages}
          </span>


          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            ▶
          </button>

        </div>

      )}

    </div>
  );
}
