import React, { useEffect, useState } from 'react'
import "../App.css"
import useAuth from '../store/useAuthStore';
import TUP from "../assets/image/TUP.png"
import Google from "../assets/image/google.png"
import School from "../assets/image/school.jpg"
import { useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, authenticatedUser, signIn, storePassword } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
   
    const from = location.state?.from?.pathname || "/dashboard";
    
    useEffect(() => {
       
        if (authenticatedUser) {
            console.log("✅ User already authenticated, redirecting to:", from);
            navigate(from, { replace: true });
        }
    }, [authenticatedUser, navigate, from]);

    const handleSignInWithGoogle = async () => {
        try {
            setIsLoading(true);
            console.log("🔐 Attempting Google sign-in...");
            const response = await signInWithGoogle();
            if (response.error) {
                console.error(`Error signing in with Google: ${response.error}`);
                alert(`Error signing in with Google: ${response.error}`);
            }
            
        } catch (err) {
            console.error("Google sign-in error:", err.message);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSignin = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }
        
        setIsLoading(true);
        console.log("🔐 Attempting email/password sign-in for:", email);
        
        try {
            const response = await signIn(email, password);
            
            if (response.error) {
                console.error(`Error signing in:`, response.error);
                alert(`Error signing in: ${response.error.message || response.error}`);
            } else {
                console.log("✅ Sign-in successful! Navigating to:", from);
                storePassword(password)
                navigate(from, { replace: true });
            }
        } catch (err) {
            console.error("Sign-in error:", err);
            alert(`Error: ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    }
    
    return (
        <div className='fullScreen min-w-[640px]'>
            <div className='flex flex-col h-full gap-10 sm:w-full min-w-[640px] lg:w-[60%]'>
                <form onSubmit={handleSignin} className='form flex flex-col items-center space-y-4 sm:space-y-6 lg:space-y-8 py-4'>
                    <div className='logoDiv'> 
                        <div className="logo justify-center items-center flex">
                            <img src={TUP} alt="TUP" className='h-10 md:h-12 lg:h-16 xl:h-20 object-contain'/>
                        </div>
                        <div className="rightLogo">
                            <p className='text-[#FF3A3A] text-[2.5rem] tracking-[10px] font-bold lg:text-[1.6rem] xl:text-[2.5rem]'>Techclinic</p>
                            <p className='text-[#A12217] lg:text-[.8rem]'>Health Record and Analytics System</p>
                        </div>
                    </div>
                    
                    <div className='formDiv'>
                        <input
                            type="text"
                            name="email"
                            placeholder=" "
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <label htmlFor="email">Email</label>
                    </div>

                    <div className='formDiv'>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            placeholder=" "
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label htmlFor="password">Password</label>
                    </div>
                    
                    <button 
                        className='tracking-[5px] bg-[#B22222] w-[60%] md:w-[60%] lg:w-[50%] py-3 text-white rounded-lg text-center hover:bg-[hsl(0,68%,48%)] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed' 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? 'SIGNING IN...' : 'LOGIN'}
                    </button>
                    
                    <div className='w-[60%] md:w-[60%] lg:w-[50%] flex items-center'>
                        <div className='flex-1 h-px bg-gray-300' />
                        <p className='px-3 text-sm text-gray-500 text-center'>or login with</p>
                        <div className='flex-1 h-px bg-gray-300' />
                    </div>
                </form>
                
                <div className='h-[30%] w-full flex items-start justify-center'>
                    <div className='h-[70px] w-[40%] flex items-center justify-evenly'>
                      
                    </div>  
                </div>
            </div>
            
            <div className='hidden lg:block lg:w-[55%] h-full'> 
                <img src={School} alt="" className='h-full w-full object-cover'/>
            </div>
        </div>
    )
}

export default Login