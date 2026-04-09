import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import '../../styles/chat.css';
import Message from './message';
import { MdVideoCall } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { socketvalue } from '../../App';
import { userdata } from '../Home/Signpage';
import { addChatContact, getChatContacts, getChatMessages, markChatReadStatus } from '../../services/backendApi';
import { getStoredUser } from '../../utils/authSession';
function Chat() {
    const currentUser = getStoredUser();
    let user = currentUser?.email || userdata?.email || ""; //userEmail

    const [contactQueue, setContactQueue] = useState([]);
    const [chatQueue, setChatQueue] = useState([]);
    const [dest, setDest] = useState('');
    const [searchContact, setSearchContact] = useState('');
    const [isAddContactOpen, setIsAddContactOpen] = useState(false);
    const [newContactEmail, setNewContactEmail] = useState('');
    const [addContactError, setAddContactError] = useState('');
    const [isAddingContact, setIsAddingContact] = useState(false);
    const source = user;
    const chatEndRef = useRef(null);
    const navigate = useNavigate();

    const loadContacts = useCallback(() => {
        getChatContacts(user)
            .then(res => {

                setContactQueue(Array.isArray(res) ? res : []);
            })
            .catch(err => { });
    }, [user]);

    const filteredContacts = useMemo(() => {
        const query = String(searchContact || '').trim().toLowerCase();
        if (!query) {
            return contactQueue;
        }

        return contactQueue.filter((contact) =>
            String(contact?._id || '').toLowerCase().includes(query)
        );
    }, [contactQueue, searchContact]);


    const handleMessage = (e) => {
        e.preventDefault();
        if (!socketvalue || !socketvalue.emit) {
            console.error("Socket not connected yet");
            return;
        }
        let message = document.getElementById('input').value;
        if (!message.trim()) {
            return;
        }
        //send message to server
        document.getElementById('input').value = "";
        socketvalue.emit("message", ({ from: source, to: dest, message: message }));

    }

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };


    useEffect(() => {

        //make api call to show all contacts
        loadContacts();

        //server send message
        if (socketvalue && socketvalue.on) {
            socketvalue.on("newMessage", ({ from, to, message }) => {
                if ((from === dest && to === user) || (from === user && to === dest)) {
                    setChatQueue(prevChats => [...prevChats, {
                        Source: from,
                        message: message
                    }]);
                }

            })



            // Cleanup on component unmount
            return () => {
                if (socketvalue && socketvalue.off) {
                    socketvalue.off("newMessage");
                }
            };
        }

    }, [user, dest, loadContacts])

    const validateContactEmail = (value) => {
        const safeValue = String(value || "").trim().toLowerCase();
        if (!safeValue) {
            return "Contact email is required";
        }

        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(safeValue)) {
            return "Enter a valid email address";
        }

        if (safeValue === String(user || "").trim().toLowerCase()) {
            return "You cannot add yourself as contact";
        }

        return "";
    };

    const handleOpenAddContact = () => {
        setNewContactEmail('');
        setAddContactError('');
        setIsAddContactOpen(true);
    };

    const handleCloseAddContact = () => {
        if (isAddingContact) {
            return;
        }
        setIsAddContactOpen(false);
        setNewContactEmail('');
        setAddContactError('');
    };

    const handleAddNewContact = async () => {
        const contact = String(newContactEmail || '').trim().toLowerCase();
        const validationError = validateContactEmail(contact);
        if (validationError) {
            setAddContactError(validationError);
            return;
        }

        setAddContactError('');
        setIsAddingContact(true);

        try {
            const result = await addChatContact({ user, contact });
            if (result?.ok === false) {
                setAddContactError(result?.message || "Failed to add contact");
                return;
            }

            alert(result?.message || "Contact added successfully");
            setIsAddContactOpen(false);
            setNewContactEmail('');
            setAddContactError('');
            loadContacts();
        } catch (error) {
            console.error("Failed to add contact", error);
            setAddContactError(error?.response?.data?.message || "Failed to add contact");
        } finally {
            setIsAddingContact(false);
        }
    };


    const showChats = (contact) => {

        setDest(contact);
        setContactQueue((prev) =>
            prev.map((item) =>
                item?._id === contact
                    ? { ...item, unreadMessageCount: 0 }
                    : item
            )
        );
        let to = contact;
        let from = user;

        if (socketvalue && socketvalue.emit) {
            socketvalue.emit("joinRoom", { from: user, to: contact });
        }

        //make api call to load data
        getChatMessages({ from, to })
            .then(res => {
                setChatQueue(res);
            })
            .catch(err => { });


        //make api call to mark all related message read
        markChatReadStatus(contact)
            .then(res => {
                // Don't reload all contacts - just update the clicked one
                // loadContacts() removed for performance optimization
            })
            .catch(err => { });

        setTimeout(scrollToBottom, 0);

    }

    useEffect(() => {
        scrollToBottom(); // Scroll when chatQueue changes
    }, [chatQueue]);


    const handleVideoCall = (e) => {
        e.preventDefault();
        navigate('/dashboard/room');
    }

    const handleClearSearch = () => {
        setSearchContact('');
    };



    return (
        <>
            <section className="chatContainer">
                <div className="contactContainer">
                    <div className="contactHeader">
                        <button onClick={handleOpenAddContact}>Add New Contact</button>
                        <div className="searchRow">
                            <input
                                type="text"
                                placeholder='Search here'
                                value={searchContact}
                                onChange={(e) => setSearchContact(e.target.value)}
                            />
                            {searchContact && (
                                <button type="button" className="clearSearchBtn" onClick={handleClearSearch}>Clear</button>
                            )}
                        </div>
                    </div>
                    <div className="contactBox">

                        {filteredContacts.length > 0 ? (filteredContacts.map((contact, indx) => (
                            <div
                                className={`contactBoxContainer ${dest === contact._id ? 'activeContact' : ''}`}
                                key={indx}
                                onClick={(e) => showChats(contact._id)}
                            >
                                <p>{(contact._id !== user ? contact._id : null)}</p>
                                {Number(contact?.unreadMessageCount || 0) > 0 && (
                                    <div id="contactNotificationCounter" className='unreadBadge'>
                                        {Number(contact?.unreadMessageCount || 0)}
                                    </div>
                                )}
                            </div>
                        ))) : <p>No Contact Found</p>}



                    </div>
                </div>

                <div className="chatBox">

                    <div className="chatBoxHeader">
                        <div className="chatBoxHeaderName">User:{user}  Dest:{dest}</div>
                        <button className="chatBoxHeaderVideoCall" onClick={handleVideoCall}><MdVideoCall /></button>
                    </div>

                    {chatQueue.length > 0 &&
                        chatQueue.map((chat, indx) => (

                            <Message
                                key={indx}
                                message={chat.message}
                                classs={chat.Source === user ? 'messageright' : 'messageleft'}
                            />

                        ))}

                    <div ref={chatEndRef} />


                    <div className="inputBox">
                        <input type="text" placeholder="Enter message" id="input" />
                        <button onClick={handleMessage}>Send</button>
                    </div>
                </div>
            </section>

            {isAddContactOpen && (
                <div className="contactModalOverlay" onClick={handleCloseAddContact}>
                    <div className="contactModal" onClick={(e) => e.stopPropagation()}>
                        <h3>Add New Contact</h3>
                        <input
                            type="email"
                            value={newContactEmail}
                            onChange={(e) => {
                                setNewContactEmail(e.target.value);
                                if (addContactError) {
                                    setAddContactError('');
                                }
                            }}
                            placeholder="Enter contact email"
                        />
                        {addContactError && <p className="contactModalError">{addContactError}</p>}
                        <div className="contactModalActions">
                            <button type="button" onClick={handleCloseAddContact} disabled={isAddingContact}>Cancel</button>
                            <button type="button" onClick={handleAddNewContact} disabled={isAddingContact}>
                                {isAddingContact ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </>
    );
}

export default Chat;
