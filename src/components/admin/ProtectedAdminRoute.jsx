import React, {
  useEffect,
  useState,
} from "react";

import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";


/* ============================================================
   PROTECTED ADMIN ROUTE
============================================================ */

export default function ProtectedAdminRoute() {

  const location =
    useLocation();


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    checking,
    setChecking,
  ] =
    useState(true);


  const [
    authenticated,
    setAuthenticated,
  ] =
    useState(false);


  /* ==========================================================
     VERIFY SESSION WITH BACKEND
  ========================================================== */

  useEffect(() => {

    let active =
      true;


    async function verifySession() {

      try {

        const response =
          await fetch(
            `${API_URL}/api/auth/me`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );


        let result = {};


        try {

          result =
            await response.json();

        } catch {

          result = {};

        }


        if (
          !response.ok
        ) {

          throw new Error(
            result.message ||
            "Session is not valid."
          );

        }


        const user =
          result.user ||
          result.admin ||
          result.data?.user;


        if (!user) {

          throw new Error(
            "No authenticated user was returned."
          );

        }


        /* ====================================================
           ROLE CHECK
        ==================================================== */

        const role =
          String(
            user.role || ""
          ).toLowerCase();


        const allowedRoles = [
          "founder",
          "admin",
          "super_admin",
        ];


        if (
          !allowedRoles.includes(
            role
          )
        ) {

          throw new Error(
            "This account does not have CMS access."
          );

        }


        /* ====================================================
           STATUS CHECK
        ==================================================== */

        if (
          user.status &&
          user.status !==
            "active"
        ) {

          throw new Error(
            "This account is not active."
          );

        }


        /* ====================================================
           SAVE SAFE UI USER DATA

           This is NOT the authentication source.
           The server cookie remains authoritative.
        ==================================================== */

        const safeUser = {

          id:
            user.id ||
            null,

          email:
            user.email ||
            "",

          name:
            user.name ||
            user.fullName ||
            user.full_name ||
            "CMS User",

          role:
            user.role,

          status:
            user.status ||
            "active",

        };


        localStorage.setItem(
          "cf_admin_user",
          JSON.stringify(
            safeUser
          )
        );


        localStorage.removeItem(
          "cf_admin_token"
        );


        if (
          active
        ) {

          setAuthenticated(
            true
          );

        }

      } catch (
        error
      ) {

        console.error(
          "CMS session verification failed:",
          error
        );


        localStorage.removeItem(
          "cf_admin_user"
        );


        localStorage.removeItem(
          "cf_admin_token"
        );


        if (
          active
        ) {

          setAuthenticated(
            false
          );

        }

      } finally {

        if (
          active
        ) {

          setChecking(
            false
          );

        }

      }

    }


    verifySession();


    return () => {

      active =
        false;

    };

  }, [
    API_URL,
    location.pathname,
  ]);


  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    checking
  ) {

    return (

      <div
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          background:
            "#f5f1e8",

          color:
            "#071a2e",

          fontFamily:
            "Arial, sans-serif",
        }}
      >

        Checking secure CMS session...

      </div>

    );

  }


  /* ==========================================================
     NOT AUTHENTICATED
  ========================================================== */

  if (
    !authenticated
  ) {

    return (

      <Navigate
        to="/admin/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />

    );

  }


  /* ==========================================================
     AUTHENTICATED
  ========================================================== */

  return (
    <Outlet />
  );

}