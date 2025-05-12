import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebaseConfig";
import CommentIcon from "../assets/images/Comment Icon.png";
import Header from '../components/AdminHeader';
import exit from '../assets/images/X Icon.png';

const Forum = () => {
    return(
    <div className='bg-blue-100 min-h-screen'>
        <Header />

        {/* 🔙 Exit Button */}
        <div className="flex justify-end m-8">
            <button onClick={() => navigate(-1)} className="z-10">
                <img src={exit} alt="Close" className="w-6 h-6 cursor-pointer filter invert" />
            </button>
        </div>
    </div>
    );
};

export default Forum;
