import { Dispatch, memo, SetStateAction, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';

import { Chat } from '../types';
import useUser from '../hooks/useUser';
import useMembers from '../hooks/useMembers';
import defaultAvatar from '/default.jpg';

interface Props {
	chatRoom: Chat;
	setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

const ChatRoom = ({ chatRoom, setIsSidebarOpen }: Props) => {
	const hasMessage = chatRoom.messages!.length > 0 ? true : false;

	const params = useParams();

	const navigate = useNavigate();

	const { data: currentUser } = useUser();

	const { data: members } = useMembers(chatRoom.id);

	const [isNewMessage, setIsNewMessage] = useState<boolean>(false);

	const messageRef = useRef<string>(hasMessage ? chatRoom.messages![0].text : '');

	useEffect(() => {
		if (hasMessage) {
			if (messageRef.current !== chatRoom.messages![0].text) {
				if (currentUser?.id !== chatRoom.messages![0].sender.id && chatRoom.id !== params.chatId) {
					setIsNewMessage(true);
				}
			}
		}
	}, [chatRoom]);

	let isToday: boolean = true;

	if (hasMessage) {
		const gap = new Date().getTime() - new Date(chatRoom.messages![0].createdAt).getTime();
		// 86400000 = 24 hours
		isToday = gap < 86400000;
	}

	const clickHandler = () => {
		setIsSidebarOpen(false);

		if (isNewMessage) {
			setIsNewMessage(false);
		}

		navigate(`/chat/${chatRoom.id}`);
	};

	return (
		<tr
			className={`hover:cursor-pointer ${params.chatId === chatRoom.id ? 'active' : ''} w-full`}
			onClick={clickHandler}
		>
			<th className="w-full rounded-none p-3">
				<div className="flex items-center justify-start gap-x-3">
					<div className="indicator">
						<span
							className={`badge-primary badge badge-xs indicator-item right-1 top-1 ${
								isNewMessage ? 'block' : 'hidden'
							}`}
						></span>
						{chatRoom.icon ? (
							<div className="avatar">
								<div className="w-10 rounded-full">
									<img src={chatRoom.icon} alt={chatRoom.name} />
								</div>
							</div>
						) : (
							<>
								{chatRoom.name ? (
									<div className="placeholder avatar">
										<div className="w-10 rounded-full bg-neutral-focus text-neutral-content">
											<span>{chatRoom.name.charAt(0).toUpperCase()}</span>
										</div>
									</div>
								) : (
									<div>
										<div className="avatar">
											<div className="w-10 rounded-full border">
												<img
													src={members?.filter((member) => member.id !== currentUser!.id)[0].avatar || defaultAvatar}
													alt={members?.filter((member) => member.id !== currentUser!.id)[0].username}
												/>
											</div>
										</div>
									</div>
								)}
							</>
						)}
					</div>
					<div className="flex w-full flex-col">
						<span className="flex w-full items-center justify-between font-semibold">
							<span>{chatRoom.name}</span>
							<span>
								<time className="ml-2 text-xs opacity-50">
									{!hasMessage ? (
										''
									) : (
										<>
											{isToday && hasMessage ? (
												<>{format(new Date(chatRoom.messages![0].createdAt), 'p')}</>
											) : (
												<>{format(new Date(chatRoom.messages![0].createdAt), 'MM/dd')}</>
											)}
										</>
									)}
								</time>
							</span>
						</span>

						<span className="text-sm font-normal">
							{hasMessage && (
								<>
									{chatRoom.messages![0].sender.username}: {chatRoom.messages![0].text}
								</>
							)}
						</span>
					</div>
				</div>
			</th>
		</tr>
	);
};

export default memo(ChatRoom);
