import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

import useDebounce from '../hooks/useDebounce';
import { Chat } from '../types';

const Explorer = () => {
	// const navigate = useNavigate();

	// const [roomName, setRoomName] = useState<string>('');
	//* By setting this value as an object, even if you get the same text as before, it is going to be a different reference.
	//* When a user keeps doing like, enter "s" and delete on and on.
	const [query, setQuery] = useState<{ text: string }>({ text: '' });
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [filteredChats, setFilterdChats] = useState<Chat[] | null>();

	const debouncedValue = useDebounce<{ text: string }>(query, 500);

	useEffect(() => {
		if (debouncedValue.text) {
			const fetchChatsByQuery = async () => {
				try {
					const { data } = await axios.get('http://localhost:8080/chat/search', {
						withCredentials: true,
						params: {
							query: debouncedValue.text,
						},
					});

					setFilterdChats(data);
				} catch (error) {
					console.log(error);
				} finally {
					setIsLoading(false);
				}
			};

			fetchChatsByQuery();
		}
	}, [debouncedValue]);

	// const joinRoom = async () => {
	// 	if (!roomName) {
	// 		return;
	// 	}

	// 	try {
	// 		const { data } = await axios.get('http://localhost:8080/chat/name', {
	// 			params: { chatName: roomName },
	// 			withCredentials: true,
	// 		});

	// 		navigate(`/chat/${data.id}`);
	// 		setRoomName('');
	// 	} catch (error) {
	// 		// No chatroom found handle the error.
	// 		console.log(error);
	// 	}
	// };

	const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;

		if (value) {
			setIsLoading(true);
		} else {
			setIsLoading(false);
			setFilterdChats(null);
		}

		setQuery({ text: value });
	};

	return (
		<div className="flex h-screen w-full flex-col items-center justify-start p-5 sm:pl-[345px]">
			<div className="text-xl font-bold text-base-content">Find your community on chit-chat</div>
			<input
				onChange={changeHandler}
				type="text"
				className="input-bordered input input-sm my-3 w-full max-w-lg"
				placeholder="Explorer chats"
			/>

			{filteredChats && filteredChats.length > 0 && !isLoading && (
				<ul className="menu mt-3 w-full max-w-lg rounded-lg border bg-base-100 p-2 shadow-md">
					{filteredChats?.map((chat) => {
						return (
							<li key={chat.id}>
								<a>{chat.name}</a>
							</li>
						);
					})}
				</ul>
			)}

			{isLoading && (
				<ul className="menu mt-3 w-full max-w-lg rounded-lg border bg-base-100 p-2 shadow-md">
					<div className="text-center">
						<SyncLoader size={10} color="#394E6A" margin={7} />
					</div>
				</ul>
			)}
		</div>
	);
};

export default Explorer;
