import React, { useEffect, useState } from 'react';
import './chatlist.css'
import User from './user/User';
import { useUserStore } from "../../../lib/userStore"
import { useChatStore } from "../../../lib/chatStore"
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../../lib/firebase"


const ChatList = () => {
    const [addMode, setAddMode] = useState (false);
    const [chats, setChats] = useState ([]);
    const [input, setInput] = useState("")

    const { currentUser } = useUserStore()
    const { chatId, changeChat } = useChatStore();
    
    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "userchats", currentUser.id),
            async (res) => {
                const items = res.data().chats;
                
                if (typeof(items) !== 'undefined') {
                    const promises = items.map(async (item) => {
                        const userDocRef = doc(db, "users", item.receiverId);
                        const userDocSnap = await getDoc(userDocRef);
                        const user = userDocSnap.data();
        
                        return { ...item, user };
                    });
                
               
    
                    const chatData = await Promise.all(promises);
                    setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
                }
            }
        );
    
        return () => {
            unSub();
        };
    }, [currentUser.id]);

    const handleSelect = async (chat) => {

        changeChat(chat.chatId, chat.user)
        
        const userChats = chats.map( item => {
            const {user, ...rest} = item;

            return rest;
        })

        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId)

        userChats[chatIndex].isSeen = true;

        const userChatsRef = doc(db, "userchats", currentUser.id);
        
        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            });
            changeChat(chat.chatId, chat.user);
        } catch (error) {
            console.log(error)
        }
    }

    const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()));
    
    return (
        <div className="chatlist">
            <div className="search">
                <div className='searchbar'>
                    <img src='./search.png' alt=''/>
                    <input type='text' placeholder='Search' onChange={(e) => setInput(e.target.value)}/>
                </div>
                <img 
                    src={addMode ? './minus.png' : './plus.png'}
                    alt=''
                    className='add'
                    onClick={() => setAddMode(prev => !prev)}
                >    
                </img>
            </div>
            
            {
                filteredChats.map((chat) => (
                    <div 
                        className="item" 
                        key={chat.chatId} 
                        onClick={() => handleSelect(chat)}
                        style={{
                            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
                        }}    
                    >
                        <img src={ chat.user.blocked.includes(currentUser.id) ? "./avatar.png" : ( chat.user.avatar || "./avatar.png" )} alt=""></img>
                        <div className="texts">
                            <span>{chat.user.blocked.includes(currentUser.id) ? "User": chat.user.username}</span>
                            <p>{chat.lastMessage}</p>
                        </div>
                    </div>
                ))
            }
            {addMode && <User/>}
        </div>
    )
}

export default ChatList
