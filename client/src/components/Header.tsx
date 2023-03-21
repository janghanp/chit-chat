import { Dispatch, SetStateAction, useState } from 'react';
import { HiOutlineChevronDown, HiOutlineX, HiUserGroup } from 'react-icons/hi';

interface Props {
	chatName: string;
	setIsOpenMemberList: Dispatch<SetStateAction<boolean>>;
	isOwner: boolean;
	leavChat: () => void;
	deleteChat: () => void;
}

const Header = ({ chatName, setIsOpenMemberList, leavChat, isOwner, deleteChat }: Props) => {
	const [isDropDownOpen, setIsDropDownOpen] = useState<boolean>(false);

	return (
		<div className="fixed left-0 top-0 z-[22] flex h-10 w-full items-center justify-between bg-base-100 pr-5 shadow-md">
			<div className="relative flex h-full w-[321px] items-center justify-center border-r shadow-inner">
				<span className="text-base font-semibold">{chatName}</span>
				<div className="absolute right-5">
					<label className="swap-rotate swap z-30">
						<input type="checkbox" />
						<HiOutlineChevronDown
							className="swap-off z-20 h-5 w-5"
							onClick={() => setIsDropDownOpen((prev) => !prev)}
						/>
						<HiOutlineX className="swap-on z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
						{isDropDownOpen && (
							<div
								className="fixed inset-0 z-10 cursor-default"
								onClick={() => setIsDropDownOpen((prev) => !prev)}
							></div>
						)}
					</label>
					{/* overlay */}
					{isDropDownOpen && (
						<>
							<ul className="menu rounded-box absolute right-0 z-30 w-52 border bg-base-100 p-2 shadow-md">
								<li onClick={isOwner ? deleteChat : leavChat}>
									<span className="text-error">{isOwner ? 'Delete Chat' : 'Leave Chat'}</span>
								</li>
							</ul>
						</>
					)}
				</div>
			</div>
			<button className="btn-ghost btn-sm btn px-2" onClick={() => setIsOpenMemberList((prev) => !prev)}>
				<HiUserGroup className="text-2xl" />
			</button>
		</div>
	);
};

export default Header;
