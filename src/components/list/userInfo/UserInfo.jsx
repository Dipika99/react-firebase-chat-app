import './userinfo.css'
import { useUserStore } from "../../../lib/userStore"
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase"

const UserInfo = () => {
    const {currentUser} = useUserStore()
    // modify above code
    return (
        <div className="userinfo">
            <div className="user">
                <img src={currentUser.avatar || './avatar.png'} alt=''></img>
                <h4>{currentUser.username}</h4>
            </div>
            <div className="options">
                <button className='logout' onClick={() => signOut(auth) }>Log Out</button>
            </div>
        </div>
    )
}

export default UserInfo