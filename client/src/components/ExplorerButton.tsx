import { useNavigate } from 'react-router-dom';
import { IoCompassSharp } from 'react-icons/io5';

const ExplorerButton = () => {
	const navigate = useNavigate();

	const handleClick = async () => {
		navigate('/explorer');
	};

	return (
		<div className="tooltip tooltip-bottom" data-tip="Explorer">
			<button className="btn-ghost btn-sm btn px-1.5" onClick={handleClick}>
				<IoCompassSharp className="text-xl" />
			</button>
		</div>
	);
};

export default ExplorerButton;
