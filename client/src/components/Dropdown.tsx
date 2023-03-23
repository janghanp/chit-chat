import { Dispatch, SetStateAction } from 'react';
import { HiOutlineChevronDown, HiOutlineX } from 'react-icons/hi';

interface Props {
	isDropDownOpen: boolean;
	setIsDropDownOpen: Dispatch<SetStateAction<boolean>>;
	isOwner: boolean;
	leaveChat: () => void;
	deleteChat: () => void;
}

const Dropdown = ({ isDropDownOpen, setIsDropDownOpen, isOwner, leaveChat, deleteChat }: Props) => {
	return (
		<div className="absolute right-5">
			<label className="swap-rotate swap z-30">
				<input type="checkbox" />
				<HiOutlineChevronDown className="swap-off z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
				<HiOutlineX className="swap-on z-20 h-5 w-5" onClick={() => setIsDropDownOpen((prev) => !prev)} />
				{isDropDownOpen && (
					<div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsDropDownOpen((prev) => !prev)}></div>
				)}
			</label>
			{/* overlay */}
			{isDropDownOpen && (
				<>
					<ul className="menu rounded-box absolute right-0 z-30 w-52 border bg-base-100 p-2 shadow-md">
						<li onClick={isOwner ? deleteChat : leaveChat}>
							<span className="text-error">{isOwner ? 'Delete Chat' : 'Leave Chat'}</span>
						</li>
					</ul>
				</>
			)}
		</div>
	);
};

export default Dropdown;
