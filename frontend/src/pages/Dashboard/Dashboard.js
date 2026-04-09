// import { Button } from "@mui/material";
// import { Link } from "react-router-dom";
import DashboardBox from "./DasboardBox";
import Sidebar from '../../components/Sidebar/Sidebar';
import { useState, createContext, useEffect } from "react";
import Header from "../../components/Header/Header";
import { useLocation, Outlet } from "react-router-dom";
import { io } from "socket.io-client";
import { userdata } from '../Home/Signpage'
import { APP_CONFIG } from "../../config/appConfig";

const MyContext = createContext();





const Dashboard = ({ socketValue }) => {
  const [, setSocket] = useState(null);
  let user = userdata.email;
  const token = localStorage.getItem('navsarjan_token');


  useEffect(() => {
    if (!token) {
      console.warn("Socket connection skipped: auth token not found.");
      return;
    }

    // Create a new socket connection
    const newSocket = io(APP_CONFIG.socketUrl, {
      // Optional: add connection options if needed
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      auth: {
        token,
      },
    });

    // Socket connection event
    newSocket.on("connect", () => {
      // Pass socket to parent component
      socketValue(newSocket);

      // Set socket in local state
      setSocket(newSocket);

      // Emit user connection
      newSocket.emit("Add", { from: user });
    });

    // Listen for notifications
    newSocket.on("notification", ({ to, message }) => {
      console.log("Notification from " + to + " with message: " + message);
    });

    // Error handling
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Cleanup function
    return () => {
      newSocket.disconnect();
    };
  }, [user, socketValue, token]);



  const [isToggleSidebar, setisToggleSidebar] = useState(false);
  const values = {
    isToggleSidebar, setisToggleSidebar
  }

  return (
    <MyContext.Provider value={values}>
      <div className="main d-flex">
        <Header userdata={userdata} />
        <div className={`sidebarWrapper ${isToggleSidebar === true ? 'toggle' : ''}`}>
          <Sidebar userlog={userdata} />
        </div>
        <div className={`content ${isToggleSidebar === true ? 'toggle' : ''} `}>
          <Outlet />
        </div>
      </div>
    </MyContext.Provider>
  );
}
export default Dashboard;
export { MyContext };
