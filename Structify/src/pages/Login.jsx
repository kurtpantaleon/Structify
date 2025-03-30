import React from 'react'
import { useState } from 'react'
import Logo from '../assets/images/Logo Structify.png'
//import { createUserWithEmailAndPassword } from "firebase/auth" (import this if you want to create an account)
import { signInWithEmailAndPassword } from "firebase/auth" //import this if you want to login to an account
import { auth } from '../services/firebaseConfig'

function Login() {
    const [error, setError] = React.useState(false);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");

    const handleLogin = (e) => {
        e.preventDefault(); //prevent default/empty form submission

        //use createUserWithEmailAndPassword for adminPage (when creating an account)
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            setError(true);
  });
    }
    return ( 
    <section class="bg-gradient-to-tr from-[#1F274D] via-[#2e3a6c] to-[#1F274D] w-screen h-screen overflow-hidden">
        <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <a href="#" class="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
                <img className="h-16" src={Logo} alt="Structify Logo" /> 
            </a>
            <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                        Sign in to your account
                    </h1>
                    <form class="space-y-4 md:space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                            <input type="email" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" placeholder="email@plv.com" onChange={e=>setEmail(e.target.value)} required="" />
                        </div>
                        <div>
                            <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white" onChange={e=>setPassword(e.target.value)} required="" />
                        </div>
                        
                        {error &&<p class="text-sm font-medium text-red-300 text-center my-0">Wrong Email or Password!</p>}
                        
                        <button type="submit" class="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center cursor-pointer">Sign in</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    )
}

export default Login