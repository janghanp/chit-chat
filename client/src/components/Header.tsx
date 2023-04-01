import { Dispatch, SetStateAction, useState } from 'react';
import { HiUserGroup } from 'react-icons/hi';

import Dropdown from './Dropdown';
import SearchInChat from './SearchInChat';

interface Props {
	isOwner: boolean;
	currentChatName?: string;
	chatId: string;
	setIsOpenMemberList: Dispatch<SetStateAction<boolean>>;
}

const Header = ({ setIsOpenMemberList, currentChatName, isOwner, chatId }: Props) => {
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	return (
		<div className="fixed left-0 top-0 z-[22] flex h-10 w-full items-center justify-between bg-base-100 pr-5 shadow-md">
			<div className="relative hidden h-full w-[321px] items-center justify-center border-r shadow-inner sm:flex">
				{currentChatName && <span className="text-base font-semibold">{currentChatName}</span>}
				<Dropdown
					isDropDownOpen={isDropDownOpen}
					setIsDropDownOpen={setIsDropDownOpen}
					isOwner={isOwner}
					chatId={chatId}
				/>
			</div>
			<div className="flex flex-1 flex-row items-center justify-end gap-x-3 pr-3 sm:flex-auto">
				<SearchInChat />
				<div className="tooltip tooltip-bottom" data-tip="Members">
					<button className="btn-ghost btn-sm btn px-1" onClick={() => setIsOpenMemberList((prev) => !prev)}>
						<HiUserGroup className="text-2xl" />
					</button>
				</div>
			</div>
		</div>
	);
};

export default Header;
