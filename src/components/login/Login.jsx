import { useState } from "react";
import "./login.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; 
import upload from "../../lib/upload";
import { signOut } from "firebase/auth";

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url:""
    })

    const [loading, setLoading] = useState(false)

    const handleAvatar = e => {
        if(e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        
        setLoading(true)

        const formData = new FormData(e.target)
        const {username, email, password} = Object.fromEntries(formData);
        
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password)
            const imgUrl = await upload(avatar.file)
            
            //update code to validate image
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: []
              });
            
            await setDoc(doc(db, "userchats", res.user.uid), {
                username,
                email,
                id: res.user.uid,
                blocked: []
            });


            toast.success("Account created! You can login now!")
            
            // reset form 
            e.target.reset();
            setAvatar({
                file: null,
                url:""
            });

            // 
            signOut(auth)

        } catch (err) {
            console.log(err)
            toast.error(err.message)   
        
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target);
        const { email, password } = Object.fromEntries(formData)
        
        try {
            await signInWithEmailAndPassword(auth, email,  password)    
            
        } catch (err) {
            console.log(err) 

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login">
            <div className="item">
                <h2>
                    Welcome!
                </h2>
                <form id="login" action="" onSubmit={handleLogin}>
                    <input type="email" placeholder="Email" name="email"/>
                    <input type="password" placeholder="Password" name="password"/>
                    <button type="submit" disabled = {loading}>{loading ? "Loading" : "Sign In"}</button>
                </form>
            </div>
            <div className="separator"></div>
            <div className="item">
                <h2>
                    Create an Account
                </h2>
                <form id="register" action="" onSubmit={handleRegister}>
                    <label required htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt=""/>
                        Upload an image
                    </label>
                    <input type="file" id="file" accept="image/png, image/jpeg" onChange={handleAvatar} style={{display:"none"}}/>
                    <input required type="text" placeholder="Username" name="username"/>
                    <input required type="email" placeholder="Email" name="email"/>
                    <input required type="password" placeholder="Password" name="password"/>
                    <button type="submit" disabled = {loading} >{ loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
    )
}

export default Login