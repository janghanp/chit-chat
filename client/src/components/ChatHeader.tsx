import { Dispatch, SetStateAction, useState } from 'react';

import Dropdown from './Dropdown';
import { HiOutlineDotsCircleHorizontal, HiUserGroup } from 'react-icons/hi';

interface Props {
	isOwner: boolean;
	currentChatName?: string;
	chatId: string;
	setIsOpenMemberList: Dispatch<SetStateAction<boolean>>;
}

const ChatHeader = ({ setIsOpenMemberList, currentChatName, isOwner, chatId }: Props) => {
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	return (
		<div className="flex items-center justify-between">
			<div className="w-full p-3 text-3xl font-bold">{currentChatName}</div>
			<div className="relative flex gap-x-3">
				<div className="tooltip tooltip-bottom" data-tip="Members">
					<button className="btn-ghost btn-sm btn btn-square" onClick={() => setIsOpenMemberList((prev) => !prev)}>
						<HiUserGroup className="text-2xl" />
					</button>
				</div>
				<div className="">
					<button className="btn-ghost btn-sm btn btn-square" onClick={() => setIsDropDownOpen(!isDropDownOpen)}>
						<HiOutlineDotsCircleHorizontal className="text-2xl" />
					</button>
				</div>
				<Dropdown
					isDropDownOpen={isDropDownOpen}
					setIsDropDownOpen={setIsDropDownOpen}
					isOwner={isOwner}
					chatId={chatId}
				/>
			</div>
		</div>
	);
};

export default ChatHeader;
