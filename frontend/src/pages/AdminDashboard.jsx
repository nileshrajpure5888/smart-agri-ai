import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Users, MessageSquare, CheckCircle, XCircle, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const [reviews, setReviews] = useState([]);

  // Dummy data (replace with API later)
  useEffect(() => {
    setReviews([
      {
        id: 1,
        name: "Ramesh Patil",
        place: "Pune",
        review: "Great platform for farmers.",
        image: "https://via.placeholder.com/80",
      },
      {
        id: 2,
        name: "Sunita Pawar",
        place: "Solapur",
        review: "Market prediction is helpful.",
        image: "https://via.placeholder.com/80",
      },
    ]);
  }, []);

  const approveReview = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    alert("Review Approved");
  };

  const rejectReview = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    alert("Review Rejected");
  };

  return (
    <div className="min-h-screen flex bg-slate-100">

      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-6">🌱 SmartAgri Admin</h2>

        <nav className="space-y-3">
          <NavLink
            to="/admin"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700"
          >
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700"
          >
            <MessageSquare size={18} /> Reviews
          </NavLink>

          <NavLink
            to="/admin/users"
            className="flex items-center gap-2 p-2 rounded hover:bg-slate-700"
          >
            <Users size={18} /> Farmers
          </NavLink>
        </nav>
      </aside>


      {/* Main Area */}
      <main className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button className="bg-red-500 text-white px-4 py-2 rounded">
            Logout
          </button>
        </div>


        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">Total Farmers</h3>
            <p className="text-2xl font-bold">2,340</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">Pending Reviews</h3>
            <p className="text-2xl font-bold">{reviews.length}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">Active Markets</h3>
            <p className="text-2xl font-bold">120+</p>
          </div>

        </div>


        {/* Reviews Table */}
        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Pending Reviews
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500">No pending reviews 🎉</p>
          ) : (
            <div className="space-y-4">

              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between border p-4 rounded-lg"
                >

                  <div className="flex items-center gap-4">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="w-16 h-16 rounded-full"
                    />

                    <div>
                      <h4 className="font-semibold">{r.name}</h4>
                      <p className="text-sm text-gray-500">{r.place}</p>
                      <p className="text-sm mt-1">"{r.review}"</p>
                    </div>
                  </div>


                  <div className="flex gap-2">
                    <button
                      onClick={() => approveReview(r.id)}
                      className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>

                    <button
                      onClick={() => rejectReview(r.id)}
                      className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </main>

    </div>
  );
}
