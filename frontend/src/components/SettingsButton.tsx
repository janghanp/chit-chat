import { HiCog } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface Props {
	closeSidebar: () => void;
}

const SettingsButton = ({ closeSidebar }: Props) => {
	const navigate = useNavigate();

	const handleClick = async () => {
		closeSidebar();

		navigate('/settings');
	};

	return (
		<div className="tooltip" data-tip="Settings">
			<button className="btn-ghost btn-sm btn btn-square" onClick={handleClick}>
				<HiCog className="text-3xl" />
			</button>
		</div>
	);
};

export default SettingsButton;
