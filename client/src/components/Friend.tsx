import { useState } from 'react';
import { HiEllipsisVertical, HiChatBubbleLeft } from 'react-icons/hi2';

import defaultAvatar from '/default.jpg';
import useCreatePrivateChat from '../hooks/useCreatePrivateChat';
import useUser from '../hooks/useUser';
import useRemoveFriend from '../hooks/useRemoveFriend';

interface Props {
	friend: any;
}

const Friend = ({ friend }: Props) => {
	const { data: currentUser } = useUser();
	const { mutate: createPrivateChatMutate } = useCreatePrivateChat();
	const { mutate: removeFriendMutate } = useRemoveFriend(friend);
	const [isOpen, setIsOpen] = useState<boolean>(false);

	const clickHandler = () => {
		createPrivateChatMutate({ senderId: currentUser!.id, receiverId: friend.id });
	};

	const removeFriendHandler = () => {
		removeFriendMutate({ senderId: currentUser!.id, receiverId: friend.id });
	};

	return (
		<div
			className="relative flex items-center justify-between rounded-lg border p-3 transition duration-300 hover:bg-gray-200/50"
			data-cy="friend"
		>
			<div className="flex items-center">
				<div className="avatar">
					<div
						className={`absolute -top-0.5 right-0 z-10 h-3 w-3 rounded-full border ${
							friend.isOnline ? 'bg-green-500' : 'bg-gray-400'
						} `}
					></div>
					<div className="w-10 rounded-full border">
						<img src={friend.avatar || defaultAvatar} alt={'avatar'} />
					</div>
				</div>
				<span className="ml-2 font-bold">{friend.username}</span>
			</div>
			<div className="flex gap-x-3">
				<div className="tooltip tooltip-top " data-tip="Message">
					<button className="btn-outline btn-ghost btn-sm btn-circle btn px-1.5" onClick={clickHandler}>
						<HiChatBubbleLeft className="text-xl" />
					</button>
				</div>
				<div className="tooltip tooltip-top" data-tip="More">
					<button className="btn-outline btn-ghost btn-sm btn-circle btn px-1.5" onClick={() => setIsOpen(!isOpen)}>
						<HiEllipsisVertical className="text-xl" />
					</button>
					{isOpen && (
						<>
							<ul className="menu menu-compact absolute top-10 right-0 z-40 w-52 rounded-lg border bg-base-100 p-2 shadow">
								<li onClick={removeFriendHandler}>
									<span>Remove Friend</span>
								</li>
							</ul>
							<div onClick={() => setIsOpen(false)} className="fixed inset-0"></div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};

export default Friend;
