
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Box,
  Tag,
  Bike,
  Wrench,
  Archive,
  BookOpen,
  FileText,
  ClipboardList,
  CalendarDays,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  ExternalLink,
  Pencil,
  Trash2,
  ArrowUpRight,
  Eye,
  Grid2X2,
  X,
} from "lucide-react";

const products = [
  {
    name: "Ola S1 Pro",
    type: "Scooter",
    brand: "Ola Electric",
    price: "PKR 849,000",
  },
  {
    name: "Ather 450X",
    type: "Scooter",
    brand: "Ather",
    price: "PKR 889,000",
  },
  {
    name: "TVS iQube",
    type: "Scooter",
    brand: "TVS",
    price: "PKR 798,000",
  },
  {
    name: "Hero Vida V1",
    type: "Scooter",
    brand: "Hero Electric",
    price: "PKR 839,000",
  },
  {
    name: "Ampere Magnus",
    type: "Scooter",
    brand: "Ampere",
    price: "PKR 549,000",
  },
];

const inquiries = [
  {
    name: "Ali Raza",
    type: "Test Ride",
    message: "Interested in Ola S1 Pro",
    date: "24 Aug 2026",
    status: "New",
  },
  {
    name: "Sara Khan",
    type: "Service Booking",
    message: "Need battery check",
    date: "23 Aug 2026",
    status: "In Progress",
  },
  {
    name: "Bilal Ahmed",
    type: "General Inquiry",
    message: "Price details please",
    date: "22 Aug 2026",
    status: "Replied",
  },
  {
    name: "Ayesha Malik",
    type: "Test Ride",
    message: "Test ride for Ather 450X",
    date: "21 Aug 2026",
    status: "New",
  },
  {
    name: "Usman Tariq",
    type: "Spare Part",
    message: "Need charger",
    date: "20 Aug 2026",
    status: "Replied",
  },
];

export default function Dashboard() {
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 2000);
  };

  const filteredProducts = products.filter((product) =>
    `${product.name} ${product.type} ${product.brand}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const goToBrands = () => {
    router.push("/admin/brands");
    setSidebarOpen(false);
  };

  const goToModels = () => {
    router.push("/admin/models");
    setSidebarOpen(false);
  };

  const goToAccessories = () => {
    router.push("/admin/accessories");
    setSidebarOpen(false);
  };

  const goToSpareParts = () => {
    router.push("/admin/spare-parts");
    setSidebarOpen(false);
  };

  const goToProfile = () => {
    router.push("/admin/profile");
    setAdminOpen(false);
    setSidebarOpen(false);
  };

  return (
    <div className="dashboard">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="logo-area">
          <div className="logo">
            E<span>V</span>INN
          </div>

          <div className="admin-panel-text">Admin Panel</div>
        </div>

        <button
          className="close-sidebar"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={22} />
        </button>

        <div className="sidebar-menu">
          <button
            className="menu-item active"
            onClick={() => showMessage("Dashboard")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          <button className="menu-item" onClick={goToBrands}>
            <Tag size={20} />
            <span>Brands</span>
          </button>

          <button className="menu-item" onClick={goToModels}>
            <Bike size={20} />
            <span>Models</span>
          </button>

          <button className="menu-item" onClick={goToSpareParts}>
            <Wrench size={20} />
            <span>Spare Parts</span>
          </button>

          <button className="menu-item" onClick={goToAccessories}>
            <Archive size={20} />
            <span>Accessories</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Blog / News")}
          >
            <BookOpen size={20} />
            <span>Blog / News</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Test Ride Requests")}
          >
            <ClipboardList size={20} />
            <span>Test Ride Requests</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Service Bookings")}
          >
            <CalendarDays size={20} />
            <span>Service Bookings</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Contacts")}
          >
            <MessageSquare size={20} />
            <span>Contacts</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Users")}
          >
            <Users size={20} />
            <span>Users</span>
          </button>

          <button
            className="menu-item"
            onClick={() => showMessage("Website Settings")}
          >
            <Settings size={20} />
            <span>Website Settings</span>
          </button>
        </div>

        <div className="sidebar-bottom">
          <button
            className="view-website"
            onClick={() => showMessage("Opening Website")}
          >
            <span>View Website</span>
            <ExternalLink size={17} />
          </button>

          <button
            className="logout"
            onClick={() => showMessage("Logout")}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          <div className="sidebar-bike">
            <img
              src="/evee1.png"
              alt="Sidebar Bike"
              width={120}
              height={120}
            />
          </div>

          <div className="tagline">
            <strong>Drive</strong>
            <span>Greener Tomorrow</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="top-left">
            <button
              className="hamburger"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="search-box">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => setSearch("")}
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          <div className="top-right">
            <div className="notification-wrapper">
              <button
                className="notification-button"
                onClick={() =>
                  setNotificationOpen(!notificationOpen)
                }
              >
                <Bell size={22} />
              </button>

              {notificationOpen && (
                <div className="dropdown notification-dropdown">
                  <h4>Notifications</h4>

                  <p>
                    You have new inquiries and product updates.
                  </p>
                </div>
              )}
            </div>

            <div className="admin-wrapper">
              <button
                className="admin-button"
                onClick={() => setAdminOpen(!adminOpen)}
              >
                <div className="avatar">A</div>

                <span>Admin</span>

                <ChevronDown size={16} />
              </button>

              {adminOpen && (
                <div className="dropdown admin-dropdown">
                  <button onClick={goToProfile}>
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      setAdminOpen(false);
                      showMessage("Settings");
                    }}
                  >
                    Settings
                  </button>

                  <button
                    onClick={() => {
                      setAdminOpen(false);
                      showMessage("Logout");
                    }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          <div className="page-header">
            <div>
              <h1>Dashboard</h1>

              <p>
                Welcome to EVINN Admin Panel. Manage your products,
                brands, models and more.
              </p>
            </div>

            <button
              className="date-button"
              onClick={() => showMessage("Date picker")}
            >
              <CalendarDays size={18} />
              Mon, 25 Aug 2026
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon green">
                <Box size={28} />
              </div>

              <div className="stat-info">
                <span>Total Products</span>
                <strong>248</strong>
              </div>

              <div className="growth">
                <span>
                  <ArrowUpRight size={14} />
                  12%
                </span>

                <small>vs last month</small>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={goToBrands}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-icon green">
                <Tag size={28} />
              </div>

              <div className="stat-info">
                <span>Brands</span>
                <strong>18</strong>
              </div>

              <div className="growth">
                <span>
                  <ArrowUpRight size={14} />
                  8%
                </span>

                <small>vs last month</small>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={goToModels}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-icon green">
                <Bike size={28} />
              </div>

              <div className="stat-info">
                <span>Models</span>
                <strong>69</strong>
              </div>

              <div className="growth">
                <span>
                  <ArrowUpRight size={14} />
                  15%
                </span>

                <small>vs last month</small>
              </div>
            </div>

            <div
              className="stat-card"
              onClick={goToSpareParts}
              style={{ cursor: "pointer" }}
            >
              <div className="stat-icon green">
                <Wrench size={28} />
              </div>

              <div className="stat-info">
                <span>Spare Parts</span>
                <strong>320</strong>
              </div>

              <div className="growth">
                <span>
                  <ArrowUpRight size={14} />
                  10%
                </span>

                <small>vs last month</small>
              </div>
            </div>
          </div>

          <div className="top-panels">
            <section className="panel products-panel">
              <div className="panel-header">
                <h2>Recent Products</h2>

                <button
                  onClick={() =>
                    showMessage("View All Products")
                  }
                >
                  View All
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.name}>
                        <td>
                          <div className="product-image">
                            <img
                              src="/evee1.png"
                              alt="Bike"
                              width={31}
                              height={31}
                            />
                          </div>
                        </td>

                        <td className="product-name">
                          {product.name}
                        </td>

                        <td>{product.type}</td>

                        <td>{product.brand}</td>

                        <td>{product.price}</td>

                        <td>
                          <span className="status active">
                            Active
                          </span>
                        </td>

                        <td>
                          <div className="action-buttons">
                            <button
                              className="edit-btn"
                              onClick={() =>
                                showMessage(
                                  `Edit ${product.name}`
                                )
                              }
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                showMessage(
                                  `${product.name} deleted`
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel quick-panel">
              <div className="panel-header">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-grid">
                <button
                  className="quick-card green-bg"
                  onClick={() =>
                    showMessage("Add New Product")
                  }
                >
                  <Box />
                  <span>Add New Product</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={goToBrands}
                >
                  <Tag />
                  <span>Add Brand</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={goToModels}
                >
                  <Bike />
                  <span>Add Model</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={goToSpareParts}
                >
                  <Wrench />
                  <span>Add Spare Part</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={goToAccessories}
                >
                  <Grid2X2 />
                  <span>Add Accessory</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={() =>
                    showMessage("Add Blog Post")
                  }
                >
                  <FileText />
                  <span>Add Blog Post</span>
                </button>

                <button
                  className="quick-card blue-bg"
                  onClick={() =>
                    showMessage("Test Ride Requests")
                  }
                >
                  <CalendarDays />
                  <span>View Test Ride Requests</span>
                </button>
              </div>
            </section>
          </div>

          <div className="bottom-panels">
            <section className="panel inquiry-panel">
              <div className="panel-header">
                <h2>Latest Orders / Inquiries</h2>

                <button
                  onClick={() =>
                    showMessage("View All Inquiries")
                  }
                >
                  View All
                </button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {inquiries.map((item) => (
                      <tr key={item.name}>
                        <td className="product-name">
                          {item.name}
                        </td>

                        <td>{item.type}</td>

                        <td>{item.message}</td>

                        <td>{item.date}</td>

                        <td>
                          <span
                            className={`status ${item.status
                              .toLowerCase()
                              .replace(" ", "-")}`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="panel overview-panel">
              <div className="panel-header">
                <h2>Website Overview</h2>

                <button className="range-button">
                  Last 30 Days
                  <ChevronDown size={15} />
                </button>
              </div>

              <div className="overview-grid">
                <div className="overview-card green-bg">
                  <Users size={28} />

                  <div>
                    <strong>12,540</strong>
                    <span>Website Visitors</span>
                  </div>

                  <small>
                    <ArrowUpRight size={13} />
                    18%
                  </small>
                </div>

                <div className="overview-card blue-bg">
                  <Eye size={28} />

                  <div>
                    <strong>3,210</strong>
                    <span>Product Views</span>
                  </div>

                  <small>
                    <ArrowUpRight size={13} />
                    12%
                  </small>
                </div>

                <div className="overview-card purple-bg">
                  <CalendarDays size={28} />

                  <div>
                    <strong>420</strong>
                    <span>Test Ride Requests</span>
                  </div>

                  <small>
                    <ArrowUpRight size={13} />
                    25%
                  </small>
                </div>

                <div className="overview-card orange-bg">
                  <MessageSquare size={28} />

                  <div>
                    <strong>180</strong>
                    <span>Contact Messages</span>
                  </div>

                  <small>
                    <ArrowUpRight size={13} />
                    10%
                  </small>
                </div>
              </div>
            </section>
          </div>

          <footer className="footer">
            <span>
              © 2026 <b>EVINN.</b> All Rights Reserved.
            </span>

            <span>
              Pakistan&apos;s Trusted Electric Mobility Marketplace{" "}
              <i></i>
            </span>
          </footer>
        </div>

        {message && <div className="toast">{message}</div>}
      </main>
    </div>
  );
}