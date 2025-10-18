import { useEffect } from "react";
import { useRouter } from "next/router";
import { CircularProgress, Box } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";

export default function PublicRoute({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // Only redirect if finished loading AND user is authenticated
    if (!isLoading && isAuthenticated) {
      router.push("/"); // Redirect to home/dashboard
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Only render children if user is NOT authenticated
  return !isAuthenticated ? children : null;
}
