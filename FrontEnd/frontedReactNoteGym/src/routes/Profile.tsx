import React, { useState, useEffect } from 'react';
import HeaderGym from "../components/headerGym";
import ProfileGym from "../components/ProfileGym";
import Sidebar from "@/components/Sidebar";

type UserRole = 'admin' | 'user' | 'trainer';

export default function Profile() {
  const [userRole, setUserRole] = useState<UserRole>('user'); 
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderGym />
      <Sidebar userRole={userRole} /> 
      <main className="flex-grow flex items-center justify-center p-4">
        <ProfileGym />
      </main>
    </div>
  );
}
