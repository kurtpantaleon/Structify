import React from 'react'
import { useState } from 'react'
import Logo from '../assets/images/Logo Structify.png'
//import { createUserWithEmailAndPassword } from "firebase/auth" (import this if you want to create an account)
import { signInWithEmailAndPassword } from "firebase/auth" //import this if you want to login to an account
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [error, setError] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    
    const handleLogin = async (e) => {
        e.preventDefault();//prevent default/empty form submission
        try {
          //use createUserWithEmailAndPassword htmlFor adminPage (when creating an account)
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;
    
          // Fetch role
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            console.log("User role:", role);
    
            // Redirect based on role
            if (role === "admin") {
              navigate("/adminPage");
            } else if (role === "student") {
              navigate("/MainPage");
            } else if (role === "instructor") {
              navigate("/");
            } else {
              setError(true);
              console.error("No role found.");
            }
          } else {
            setError(true);
            console.error("User data not found.");
          }
        } catch (err) {
          console.error("Login failed:", err.message);
          setError(true);
        }
      };
    return ( 
    <section className="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] w-screen h-screen overflow-hidden">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="h-16" src={Logo} alt="Structify Logo" /> 
            </a>
            <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Sign in to your account
                    </h1>
                    <form className="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="email@plv.com" onChange={e=>setEmail(e.target.value)} required="" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" onChange={e=>setPassword(e.target.value)} required="" />
                        </div>
                        
                        {error &&<p className="text-sm font-medium text-red-300 text-center my-0">Wrong Email or Password!</p>}
                        
                        <button type="submit" className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer">Sign in</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    )
}

export default Login