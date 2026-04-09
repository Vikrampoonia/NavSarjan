import { Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FaAngleRight, FaProjectDiagram, FaSeedling, FaFileAlt, FaHandshake } from "react-icons/fa";
import { FaCalendar } from "react-icons/fa";
import { AiFillProject, AiOutlineLogout } from "react-icons/ai";
import { MdTrendingUp, MdEmojiObjects } from "react-icons/md";
import { FaGear } from "react-icons/fa6"
//import {userdata} from '../../pages/Home/Signpage'
// import { useContext } from "react";
// import { MyContext } from "../../App";
import { userdata } from "../../pages/Home/Signpage";
import { performLogout } from "../../utils/authSession";
import { ROLES } from "../../constants/roles";


const Sidebar = () => {
    const navigate = useNavigate();
    const handleLogout = async () => {
        await performLogout();
        navigate('/');
    };

    const investor = [
        { text: "Investments", icon: <MdTrendingUp />, link: "investments" },
        { text: "Projects", icon: <AiFillProject />, link: "projects" },
        { text: "Startups", icon: <MdEmojiObjects />, link: "startups" }
    ];

    const startup = [
        { text: "My Project", icon: <FaProjectDiagram />, link: "myprojects" },
        { text: "Projects", icon: <AiFillProject />, link: "projects" },
        { text: "Startups", icon: <MdEmojiObjects />, link: "startups" },
        { text: "My Brand", icon: <FaSeedling />, link: "mystartups" },
        { text: "Patents", icon: <FaFileAlt />, link: "patents" }
    ];

    const policyMaker = [
        { text: "Projects", icon: <AiFillProject />, link: "projects" },
        { text: "Startups", icon: <MdEmojiObjects />, link: "startups" },
        { text: "Policy Reviews", icon: <FaGear />, link: "policymaker" },
    ];

    const admin = [
        { text: "Projects", icon: <AiFillProject />, link: "projects" },
        { text: "Startups", icon: <MdEmojiObjects />, link: "startups" },
        { text: "My Project", icon: <FaProjectDiagram />, link: "myprojects" },
        { text: "My Brand", icon: <FaSeedling />, link: "mystartups" },
        { text: "Patents", icon: <FaFileAlt />, link: "patents" },
        { text: "Policy Reviews", icon: <FaGear />, link: "policymaker" },
    ];

    const normalizedRole = String(userdata?.role || "").trim().toLowerCase();
    let valUser = startup;
    if (normalizedRole === ROLES.INVESTOR) valUser = investor;
    if (normalizedRole === ROLES.POLICY_MAKER) valUser = policyMaker;
    if (normalizedRole === ROLES.ADMIN) valUser = admin;
    console.log(userdata)
    //const context = useContext(MyContext)
    return (
        <div className="sidebar">
            <ul>
                {valUser.map((row, index) => {
                    return (
                        <li key={index}>
                            <Link to={row.link} state={{ userid: userdata.email }}>
                                <Button className="w-100">
                                    <span className="icon">
                                        {row.icon}
                                    </span>
                                    {row.text}
                                    <span className="arrow">
                                        <FaAngleRight />
                                    </span>
                                </Button>
                            </Link>
                        </li>);
                })}
                <li>
                    <Link to="/dashboard/chat">
                        <Button className="w-100">
                            <span className="icon"><FaHandshake /></span>
                            Connection
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard/calendar">
                        <Button className="w-100">
                            <span className="icon"><FaCalendar /></span>
                            Calendar
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>
                    </Link>
                </li>
            </ul>
            <ul>

            </ul>
            <br />
            <div className="logoutWrapper">
                <div className="logoutBox">
                    <Button variant="contained" onClick={handleLogout}><AiOutlineLogout /> Logout</Button>
                </div>
            </div>
        </div>
    );
}
export default Sidebar;