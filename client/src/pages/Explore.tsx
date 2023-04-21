import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SyncLoader } from 'react-spinners';

import useDebounce from '../hooks/useDebounce';
import { Chat, User } from '../types';
import defaultAvatar from '/default.jpg';

interface ChatWithMembers extends Chat {
	users: User[];
}

const Explorer = () => {
	const navigate = useNavigate();
	//* By setting this value as an object, even if you get the same text as before, it is going to be a different reference.
	//* When a user keeps doing like, enter "s" and delete on and on.
	const [query, setQuery] = useState<{ text: string }>({ text: '' });
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [filteredChats, setFilterdChats] = useState<ChatWithMembers[] | null>();
	const debouncedValue = useDebounce<{ text: string }>(query, 500);

	useEffect(() => {
		if (debouncedValue.text) {
			const fetchChatsByQuery = async () => {
				try {
					const { data } = await axios.get<ChatWithMembers[]>('/chat/search', {
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

	const joinRoomHandler = async (roomName: string) => {
		try {
			const { data } = await axios.get<Chat>('/chat/name', {
				params: { chatName: roomName },
				withCredentials: true,
			});

			navigate(`/chat/${data.id}`);
		} catch (error) {
			// No chatroom found handle the error.
			console.log(error);
		}
	};

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
			<div className="text-base-content mb-5 mt-10 text-xl font-bold">Find your community on chit-chat</div>
			<input
				onChange={changeHandler}
				type="text"
				className="input-bordered input my-3 w-full max-w-[510px] shadow-md"
				placeholder="Explore chats"
			/>
			{filteredChats && filteredChats.length > 0 && !isLoading && (
				<ul className="menu bg-base-100 mt-3 w-full max-w-lg rounded-lg border p-2 shadow-md">
					{filteredChats?.map((chat) => {
						return (
							<li key={chat.id} onClick={() => joinRoomHandler(chat.name!)}>
								<div className="flex flex-row items-center justify-between">
									<span>{chat.name}</span>
									<div className="avatar-group -space-x-3">
										{chat.users.slice(0, 4).map((user) => {
											return (
												<div key={user.id} className="avatar border-0">
													<div className="w-8 rounded-full border">
														<img src={user.avatar || defaultAvatar} alt={user.username} width={20} height={20} />
													</div>
												</div>
											);
										})}
										{chat.users.length > 4 && (
											<div className="placeholder avatar border-0">
												<div className="bg-neutral-focus text-neutral-content w-8 text-xs font-semibold">
													<span>+{chat.users.length - 4}</span>
												</div>
											</div>
										)}
									</div>
								</div>
							</li>
						);
					})}
				</ul>
			)}
			{isLoading && (
				<ul className="menu bg-base-100 mt-3 w-full max-w-lg rounded-lg border p-2 shadow-md">
					<div className="text-center">
						<SyncLoader size={10} color="#394E6A" margin={7} />
					</div>
				</ul>
			)}
		</div>
	);
};

export default Explorer;
