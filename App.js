import React, { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [storeUsers, setStoreUsers] = useState([]);
  const [storeAvg, setStoreAvg] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [search, setSearch] = useState("");

  // ---------- Backend Calls ----------

  async function login() {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setToken(data.token);
        setRole(data.role);
      } else alert(data.message || "Login failed");
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  }

  async function signup() {
    if (!name || !email || !password || !address) {
      alert("Fill all fields");
      return;
    }
    try {
      const res = await fetch(`${API}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, address }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Signup successful! Login now.");
        setIsSignup(false);
      } else alert(data.message || "Signup failed");
    } catch (err) {
      console.error(err);
      alert("Error connecting to server");
    }
  }

  async function loadStores() {
    const res = await fetch(`${API}/stores`, {
      headers: { Authorization: "Bearer " + token },
    });
    setStores(await res.json());
  }

  async function loadUsers() {
    const res = await fetch(`${API}/admin/users`, {
      headers: { Authorization: "Bearer " + token },
    });
    setUsers(await res.json());
  }

  async function loadStoreRatings() {
    const res = await fetch(`${API}/store_owner/ratings`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    setStoreUsers(data.users || []);
    setStoreAvg(data.avgRating || 0);
  }

  async function rateStore(id, rating) {
    await fetch(`${API}/stores/${id}/rate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ rating }),
    });
    loadStores();
  }

  // ---------- Lifecycle ----------

  useEffect(() => {
    if (token) {
      if (role === "user") loadStores();
      else if (role === "store_owner") loadStoreRatings();
      else if (role === "admin") {
        loadUsers();
        loadStores();
      }
    }
  }, [token]);

  // ---------- UI ----------

  if (!token)
    return (
      <div style={{ padding: 50 }}>
        {isSignup ? (
          <>
            <h2>Sign Up</h2>
            <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={signup}>Sign Up</button>
            <p>
              Already have an account?{" "}
              <span style={{ color: "blue", cursor: "pointer" }} onClick={() => setIsSignup(false)}>Login</span>
            </p>
          </>
        ) : (
          <>
            <h2>Login</h2>
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            <button onClick={login}>Login</button>
            <p>
              New user?{" "}
              <span style={{ color: "blue", cursor: "pointer" }} onClick={() => setIsSignup(true)}>Sign Up</span>
            </p>
          </>
        )}
      </div>
    );

  return (
    <div style={{ padding: 20 }}>
      <h2>Dashboard ({role})</h2>
      <button onClick={() => { localStorage.clear(); setToken(null); }}>Logout</button>

      {/* ---------- Normal User ---------- */}
      {role === "user" && (
        <div style={{ marginTop: 20 }}>
          <h3>Stores</h3>
          <input placeholder="Search by name" onChange={e => setSearch(e.target.value)} />
          {stores.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map(store => (
            <div key={store.id} style={{ marginBottom: 10, border: "1px solid gray", padding: 10 }}>
              <b>{store.name}</b> | Address: {store.address} | Avg: {store.avgRating || "-"} | Your rating: {store.userRating || "-"}
              <div>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => rateStore(store.id, n)}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---------- Store Owner ---------- */}
      {role === "store_owner" && (
        <div style={{ marginTop: 20 }}>
          <h3>Your Store Dashboard</h3>
          <p>Average Rating: {storeAvg}</p>
          <h4>Users who rated your store:</h4>
          {storeUsers.map(u => (
            <div key={u.id}>{u.name} | Rating: {u.rating}</div>
          ))}
        </div>
      )}

      {/* ---------- Admin ---------- */}
      {role === "admin" && (
        <div style={{ marginTop: 20 }}>
          <h3>Admin Dashboard</h3>
          <h4>Users:</h4>
          {users.map(u => (
            <div key={u.id}>{u.name} | {u.email} | {u.address} | {u.role}</div>
          ))}
          <h4>Stores:</h4>
          {stores.map(s => (
            <div key={s.id}>{s.name} | {s.email} | {s.address} | Avg: {s.avgRating}</div>
          ))}
        </div>
      )}
    </div>
  );
}
