import { collection, query, updateDoc, where } from 'firebase/firestore'
import './user.css'
import { db } from "../../../../lib/firebase"
import { useState } from 'react'
import { doc, setDoc, getDocs, serverTimestamp, arrayUnion } from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore"
import { useChatStore } from "../../../../lib/chatStore"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const User = () => {
    const [user, setUser] = useState(null)
    const {currentUser} = useUserStore()
    const { changeChat } = useChatStore();
    
    const handleSearch = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const username = formData.get("username")

        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapShot = await getDocs(q);

            if (!querySnapShot.empty) {
                setUser(querySnapShot.docs[0].data());
            } else {
                toast.warn("No User Found!")
            }

        } catch (error) {
            console.log(error)
        }
    }

    const handleAdd = async () => {

        const chatRef = collection(db, "chats")
        const userChatsRef = collection(db, "userchats" )

        try {
            const newChatRef = doc(chatRef)

            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });


            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            })

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            })

        } catch (error) {
            console.log(error)
        }
    }
    return (
        <div className="addUser">
            <form onSubmit={handleSearch}>
                <input 
                    type="text" 
                    placeholder='Username' 
                    name="username"
                />
                <button>Search</button>
            </form>
            <div className='user'>
                {user && <div className="detail">
                    <img src={ user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                    <button onClick={handleAdd}>Start Chat</button>
                </div>}
            </div>
        </div>
    )
}

export default User