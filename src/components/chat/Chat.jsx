import React, { useEffect, useRef, useState } from 'react';
import './chat.css'
import EmojiPicker from 'emoji-picker-react'
import { arrayUnion, doc, onSnapshot, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from "../../lib/firebase";
import { useUserStore } from "../../lib/userStore"
import { useChatStore } from "../../lib/chatStore"

const Chat = () => {
    const [chat, setChat] = useState()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('');
    const [img, setImg] = useState({
        file: null,
        url:""
    })

    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked,isReceiverBlocked  } = useChatStore()

    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behaviour: "smooth" })

    }, []);

    useEffect(() => {
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data())
        })

        return () => {
            unSub();
        }
    }, [chatId]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behaviour: "smooth"})
    }, [])

    const handleEmoji = e => {
        setText((prev => prev + e.emoji))
        setOpen(false)
    }

    const handleImg = e => {
        if(e.target.files[0]) {
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const chatContainerRef = useRef(null);

    const handleSend = async () => {
        if (text === "") return;
        // let imgUrl = null;

        try {

            // if (img.file) {
            //     imgUrl = await upload(img.file);
            // }

            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    // ...(imgUrl && { img: imgUrl }) 
                }),
            });

            const userIDs = [currentUser.id , user.id]
            
            userIDs.forEach( async (id) => {
                const userChatsRef = doc(db, "userchats", id)
                const userChatsSnapshot = await getDoc(userChatsRef)
        
                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data()
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId)
                    
                    userChatsData.chats[chatIndex].lastMessage = ( id === currentUser.id ? true: false)
                    userChatsData.chats[chatIndex].isSeen = true
                    userChatsData.chats[chatIndex].updatedAt = Date.now();
        
                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    })
                }
            });

            console.log(chatContainerRef)

            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop -= 10;
            }


        } catch (error) {
            console.log(error)
        }

        setImg({
            file:null,
            url:""
        })

        setText("")
    }
    return (
        <div className="chat">
            <div className='top'>
                <div className='user'>
                    <img src={user?.avatar || "./avatar.png"} alt=""></img>
                    <div className="texts">
                        <span>{user.username}</span>
                    </div>
                </div>
                {/* <div className="options">
                    <button className='block'>Block</button>
                </div> */}
            </div>
            <div className='center' ref={chatContainerRef}>
                {
                    chat?.messages.map((message, index) => {
                        const createdAtDate = message.createdAt.toDate();
                        const formattedTime = createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                        const formattedDate = createdAtDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
                        const isDateChanged = index === 0 || createdAtDate.toDateString() !== chat.messages[index - 1].createdAt.toDate().toDateString();
  
                        return (
                            <div className="message-body" key={message?.createdAt} >
                                {isDateChanged && (
                                    <div className="date-separator">
                                        <span>{formattedDate}</span>
                                    </div>
                                )}

                                <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                                    <div className='text'>
                                        {message.img && <img src={message.img} alt='' />}
                                        <p>{message.text}</p>
                                        <span>{formattedTime}</span>
                                    </div>
                                </div>
                            </div>

                        )
                    })
                }
    
                {img.url && <div className="message">
                    <div className="texts">
                        <img src={img.url} />
                    </div>
                </div>
                }
                <div ref={endRef}></div>
            </div>
            <div className='bottom'>
                <div className='icons'>
                    {/* <label htmlFor="file">
                        <img src=""/>
                    </label>
                    <img src='./img.png' alt=""></img>
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                    <img src='./camera.png' alt=""></img>
                    <img src='./mic.png' alt=""></img> */}
                </div>
                <input 
                    type='text' 
                    placeholder='Type a message...'
                    value={text} 
                    onChange={ (e) => setText(e.target.value) }
               />
                <div className='emoji'>
                    <img src='./emoji.png' onClick={ () => setOpen( prev => !prev )}></img>
                    <div className='picker'>
                        <EmojiPicker open={open} onEmojiClick={handleEmoji}/>
                    </div>
                </div>
                <button className='sendbutton' onClick={handleSend}>Send</button>
            </div>
        </div>
    )
}

export default Chat