import { useNavigate } from 'react-router-dom';

const ExplorerButton = () => {
	const navigate = useNavigate();

	const handleClick = async () => {
		navigate('/explorer');
	};

	return (
		<div className="w-full p-4">
			<button className="btn-outline btn-ghost btn w-full" onClick={handleClick}>
				Explorer
			</button>
		</div>
	);
};

export default ExplorerButton;
