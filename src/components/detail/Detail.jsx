import { arrayRemove, arrayUnion } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { useChatStore } from '../../lib/chatStore'
import { useUserStore } from "../../lib/userStore"
import { auth } from "../../lib/firebase"
import './detail.css'

const Detail = () => {

    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
    const { currentUser } = useUserStore();

    const handleBlock = async () => {
        if (!user) return;

        const userDocRef = doc(db, "users", currentUser.id)
        
        try {
            await updateDoc(userDocRef, {
                blocked: isReceiverBlocked ? arrayRemove (user.id) : arrayUnion(user.id) 
            });
            
            changeBlock()

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="detail">
            <div className="user">
                <img src={ user?.avatar || "./avatar.png"} alt=""/>
                <h2>{ user?.username }</h2>

            </div>
            <div className="info">
                <button className='logout' onClick={() => signOut(auth) }>Log Out</button>
            </div>
        </div>
    )
}

export default Detail