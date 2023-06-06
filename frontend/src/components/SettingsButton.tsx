import { Dispatch, SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiCog } from 'react-icons/hi';

interface Props {
	closeSidebar: () => void;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const SettingsButton = ({ closeSidebar, setIsOpen }: Props) => {
	const navigate = useNavigate();

	const handleClick = async () => {
		closeSidebar();
		setIsOpen(false);

		navigate('/settings');
	};

	return (
		<button className="flex" onClick={handleClick}>
			<HiCog className="text-xl" />
			<span className="ml-3">Settings</span>
		</button>
	);
};

export default SettingsButton;
