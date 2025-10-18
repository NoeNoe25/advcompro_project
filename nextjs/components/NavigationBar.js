// components/NavigationBar.js
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Button } from "@mui/material";
import FunctionsIcon from "@mui/icons-material/Functions";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "@/contexts/AuthContext";

const NavigationBar = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      <header className="navbar">
        <div className="nav-inner">
          {/* Logo */}
          <div className="logo">
            <Link href="/" className="logo-link">
              <FunctionsIcon sx={{ color: "#D3AF37", marginRight: "6px" }} />
              <span>Lan Pya</span>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="nav-links">
            <Link
              href="/"
              className={router.pathname === "/" ? "active" : ""}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                href="/test-map"
                className={router.pathname === "/test-map" ? "active" : ""}
              >
                Reviews
              </Link>
            )}
          </nav>

          {/* Right Actions */}
          <div className="nav-actions">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={() => router.push("/profile")}
                  sx={{ color: "#F5F5F5", minWidth: "auto" }}
                >
                  <PersonIcon />
                </Button>
                <Button
                  variant="outlined"
                  onClick={logout}
                  sx={{
                    color: "#D3AF37",
                    borderColor: "#D3AF37",
                    textTransform: "none",
                    "&:hover": { backgroundColor: "rgba(211,175,55,0.1)" },
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  href="/login"
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#D3AF37",
                    color: "#2E2926",
                    borderRadius: "25px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#c19b2e",
                    },
                  }}
                >
                  Login
                </Button>
                <Button
                  href="/register"
                  sx={{
                    textTransform: "none",
                    backgroundColor: "#B67B79",
                    color: "#fff",
                    borderRadius: "25px",
                    px: 3,
                    py: 1,
                    fontWeight: 500,
                    "&:hover": {
                      backgroundColor: "#a36b69",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>{children}</main>

      <style jsx>{`
        .navbar {
          width: 100%;
          background-color: #2E2926;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 10px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .logo-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: #f0e6d2;
          font-weight: 600;
          font-size: 18px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .nav-links a {
          color: #f5f5f5;
          text-decoration: none;
          font-size: 15px;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: #d3af37;
        }

        .nav-links a.active {
          color: #d3af37;
          font-weight: 600;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default NavigationBar;
