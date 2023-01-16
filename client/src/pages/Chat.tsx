import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import { formatDistance } from 'date-fns';

import { AuthErrorResponse, Message, User } from '../types';
import { useUser } from '../context/UserContext';

const Chat = () => {
  const params = useParams();

  const { currentUser, setCurrentUser } = useUser();

  const navigate = useNavigate();

  const socketRef = useRef<Socket>();

  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [members, setMembers] = useState<User[]>([]);

  useEffect(() => {
    const setupSocket = () => {
      // Connect to the socket server.
      socketRef.current = io('http://localhost:8080');

      // Join a specific room.
      socketRef.current?.emit('join_room', {
        roomName: params.roomName,
        username: currentUser!.username,
      });

      // Listen for "receive_message" event
      socketRef.current?.on('receive_message', (data: Message) => {
        const { id, senderId, senderName, text, createdAt } = data;

        setMessages((prev) => [...prev, { id, senderId, senderName, text, createdAt }]);
      });

      // Listen for "new_member" event
      socketRef.current?.on('new_member', (data: { newUser: User }) => {
        console.log('new member joined');
        console.log(data);

        setMembers((prev) => {
          return [...prev, data.newUser];
        });
      });
    };

    const fetchMessagesAndMembers = async () => {
      const { data } = await axios.get('http://localhost:8080/chat/messages', {
        params: { roomName: params.roomName },
        withCredentials: true,
      });

      const previousMessage = data.messages.map((message: any) => {
        return {
          id: message.id,
          text: message.text,
          createdAt: message.createdAt,
          senderId: message.senderId,
          senderName: message.sender.username,
        };
      });

      setMembers(data.users);
      setMessages(previousMessage);
    };

    const checkThePresenceOfChat = async () => {
      try {
        // Check the presence of a chat room.
        const { data } = await axios.get('http://localhost:8080/chat', {
          params: { roomName: params.roomName },
          withCredentials: true,
        });

        // Connect a socket and register events for later use.
        setupSocket();

        // Add a chat room in the sidebar conditionally.
        if (currentUser?.chats?.findIndex((chat) => chat.name === params.roomName) === -1) {
          setCurrentUser({
            ...currentUser!,
            chats: [...currentUser!.chats!, { name: data.name, id: data.id }],
          });
        }

        // Set previous messages and current memebers of this chat.
        fetchMessagesAndMembers();
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          //No chat room found to join
          const serverError = error.response.data as AuthErrorResponse;

          alert(serverError.message);
          navigate(-1);
          return;
        } else if (error instanceof Error) {
          console.log(error);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkThePresenceOfChat();

    // When a user is moving between pages in the same tab, get rid of the previous socket instance and then establish a new connection.
    // This is different from leaving chat room. It is just changing socket instance but stay in the chat room.
    return () => {
      socketRef.current?.disconnect();
    };
  }, [currentUser, navigate, params.roomName, setCurrentUser]);

  const sendMessage = () => {
    // Send a message to the socket server.
    socketRef.current!.emit('send_message', {
      senderId: currentUser!.id,
      roomName: params.roomName,
      senderName: currentUser!.username,
      text: message,
    });

    setMessage('');
  };

  const leaveChat = () => {
    const result = window.confirm('Are you sure you want to leave the chat?');

    if (result) {
      // Leave the chat room.
      socketRef.current?.emit('leave_room', { roomName: params.roomName, username: currentUser!.username });

      // Remove chat room from user context.
      setCurrentUser({
        ...currentUser!,
        chats: currentUser!.chats?.filter((chat) => chat.name !== params.roomName),
      });

      // Since this component is going to be unomunted ouf of the dom, the clear function in useEffect is going to fire and consequently socket gets disconnected.
      navigate('/');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {members &&
        members.length > 0 &&
        members.map((member) => {
          return <div key={member.id}>{member.username}</div>;
        })}

      <button className="border p-2 rounded-md" onClick={leaveChat}>
        Leave
      </button>

      {messages &&
        messages.map((msg) => {
          return (
            <div key={msg.id}>
              <p>{msg.senderName}</p>
              <p>{msg.text}</p>
              <p>{formatDistance(new Date(msg.createdAt), Date.now(), { addSuffix: true })}</p>
            </div>
          );
        })}

      <input className="border" type="text" value={message} onChange={(e) => setMessage(e.target.value)} />
      <button className="border" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default Chat;
