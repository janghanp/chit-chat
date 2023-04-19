import { useNavigate } from 'react-router-dom';
import { IoCompassSharp } from 'react-icons/io5';

interface Props {
	closeSidebar: () => void;
}

const ExplorerButton = ({ closeSidebar }: Props) => {
	const navigate = useNavigate();

	const handleClick = async () => {
		closeSidebar();

		navigate('/explorer');
	};

	return (
		<div className="tooltip tooltip-top" data-tip="Explore">
			<button className="btn-ghost btn-sm btn px-1.5" onClick={handleClick}>
				<IoCompassSharp className="text-xl" />
			</button>
		</div>
	);
};

export default ExplorerButton;
